/*!
 * Repo X-Ray Engine — v1.0.0
 * A dependency-free repository health analyzer.
 *
 * Runs unchanged in the browser (window.RepoXray) and in Node (require/import).
 * Pure functions only: no DOM, no network, no globals mutated.
 * Feed it raw GitHub REST payloads, get back a scored, human-readable report.
 *
 * MIT © Ritesh
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.RepoXray = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  var VERSION = '1.0.0';
  var DAY = 86400000;

  /* ------------------------------------------------------------------ *
   * Small maths helpers
   * ------------------------------------------------------------------ */

  function clamp(n, lo, hi) { return Math.max(lo, Math.min(hi, n)); }

  /** Score on a logarithmic curve: `full` maps to 100, 0 maps to 0. */
  function logScore(value, full) {
    if (!value || value <= 0) return 0;
    return clamp((Math.log10(value + 1) / Math.log10(full + 1)) * 100, 0, 100);
  }

  /** Linear decay: `good` days or fresher = 100, `bad` days or staler = 0. */
  function decayScore(days, good, bad) {
    if (days == null || !isFinite(days)) return 0;
    if (days <= good) return 100;
    if (days >= bad) return 0;
    return clamp(((bad - days) / (bad - good)) * 100, 0, 100);
  }

  function daysBetween(a, b) {
    if (!a) return null;
    var t = new Date(a).getTime();
    if (isNaN(t)) return null;
    return ((b || Date.now()) - t) / DAY;
  }

  function sum(arr) { return arr.reduce(function (a, b) { return a + b; }, 0); }
  function round(n, d) { var p = Math.pow(10, d || 0); return Math.round(n * p) / p; }

  /* ------------------------------------------------------------------ *
   * Input parsing — accepts basically anything a human might paste
   * ------------------------------------------------------------------ */

  /**
   * "facebook/react", a browse URL, a clone URL, an SSH remote, or a bare
   * username all resolve to { owner, repo }. `repo` is null for a user.
   */
  function parseRepoInput(input) {
    if (!input || typeof input !== 'string') return null;
    var s = input.trim();
    if (!s) return null;

    s = s.replace(/^git\+/, '').replace(/^git@([^:]+):/, 'https://$1/');
    s = s.replace(/^https?:\/\/(www\.)?github\.com\//i, '');
    s = s.replace(/^github\.com\//i, '');
    s = s.replace(/\.git$/, '').replace(/^\/+|\/+$/g, '');

    // Drop trailing GitHub UI paths: /tree/main, /issues, /pull/12 ...
    var parts = s.split(/[?#]/)[0].split('/').filter(Boolean);
    if (!parts.length) return null;

    var owner = parts[0];
    var repo = parts[1] || null;
    var nameRe = /^[A-Za-z0-9_.-]+$/;
    if (!nameRe.test(owner)) return null;
    if (repo && !nameRe.test(repo)) return null;

    return { owner: owner, repo: repo, slug: repo ? owner + '/' + repo : owner };
  }

  /* ------------------------------------------------------------------ *
   * Bus factor & contribution concentration
   * ------------------------------------------------------------------ */

  /**
   * Bus factor: the smallest number of contributors whose combined
   * contributions cross `threshold` (default 50%) of all work. A bus factor
   * of 1 means one person leaving would strand the project.
   */
  function busFactor(contributors, threshold) {
    var list = (contributors || [])
      .map(function (c) { return c.contributions || 0; })
      .filter(function (n) { return n > 0; })
      .sort(function (a, b) { return b - a; });
    if (!list.length) return { factor: 0, topShare: 0, total: 0, gini: 0 };

    var total = sum(list);
    var need = total * (threshold || 0.5);
    var acc = 0, factor = 0;
    for (var i = 0; i < list.length; i++) {
      acc += list[i];
      factor++;
      if (acc >= need) break;
    }
    return {
      factor: factor,
      topShare: list[0] / total,
      total: total,
      gini: gini(list),
      contributorCount: list.length
    };
  }

  /** Gini coefficient of contribution inequality (0 = even, 1 = one person). */
  function gini(values) {
    var v = values.slice().sort(function (a, b) { return a - b; });
    var n = v.length;
    if (n === 0) return 0;
    var total = sum(v);
    if (total === 0) return 0;
    var cum = 0;
    for (var i = 0; i < n; i++) cum += (i + 1) * v[i];
    return clamp((2 * cum) / (n * total) - (n + 1) / n, 0, 1);
  }

  /* ------------------------------------------------------------------ *
   * Commit rhythm — the fun part
   * ------------------------------------------------------------------ */

  var DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  /**
   * Turn raw commits into a behavioural profile: when does this project
   * actually get built? Uses each commit's own UTC offset when present so
   * "3am" means 3am for the human who typed it.
   */
  function commitRhythm(commits) {
    var byHour = new Array(24).fill(0);
    var byWeekday = new Array(7).fill(0);
    // grid[weekday][hour] — the real punch card, not an approximation.
    var grid = [];
    for (var g = 0; g < 7; g++) grid.push(new Array(24).fill(0));
    var dates = [];
    var authors = Object.create(null);

    (commits || []).forEach(function (c) {
      var meta = (c.commit && c.commit.author) || null;
      if (!meta || !meta.date) return;
      var t = new Date(meta.date);
      if (isNaN(t.getTime())) return;

      // Shift into the committer's local wall clock via the ISO offset.
      var m = /([+-])(\d{2}):(\d{2})$/.exec(meta.date);
      var local = new Date(t.getTime());
      if (m) {
        var offMin = (parseInt(m[2], 10) * 60 + parseInt(m[3], 10)) * (m[1] === '-' ? -1 : 1);
        local = new Date(t.getTime() + offMin * 60000);
      }
      var lh = local.getUTCHours();
      var ld = local.getUTCDay();
      byHour[lh]++;
      byWeekday[ld]++;
      grid[ld][lh]++;
      dates.push(t.getTime());

      var who = (c.author && c.author.login) || meta.name || 'unknown';
      authors[who] = (authors[who] || 0) + 1;
    });

    var total = sum(byHour);
    if (!total) {
      return { total: 0, byHour: byHour, byWeekday: byWeekday, grid: grid, peakHour: null, peakDay: null,
               nightShare: 0, weekendShare: 0, chronotype: 'unknown', cadenceDays: null, spanDays: 0, authors: [] };
    }

    var night = byHour.slice(22).concat(byHour.slice(0, 5));
    var nightShare = sum(night) / total;
    var weekendShare = (byWeekday[0] + byWeekday[6]) / total;

    var peakHour = byHour.indexOf(Math.max.apply(null, byHour));
    var peakDayIdx = byWeekday.indexOf(Math.max.apply(null, byWeekday));

    dates.sort(function (a, b) { return a - b; });
    var cadenceDays = dates.length > 1
      ? (dates[dates.length - 1] - dates[0]) / DAY / (dates.length - 1)
      : null;

    var chronotype = 'balanced';
    if (nightShare >= 0.28) chronotype = 'nocturnal';
    else if (sum(byHour.slice(5, 10)) / total >= 0.28) chronotype = 'early bird';
    else if (sum(byHour.slice(9, 18)) / total >= 0.6) chronotype = 'nine-to-five';

    var authorList = Object.keys(authors)
      .map(function (k) { return { login: k, commits: authors[k] }; })
      .sort(function (a, b) { return b.commits - a.commits; });

    return {
      total: total,
      byHour: byHour,
      byWeekday: byWeekday,
      grid: grid,
      peakHour: peakHour,
      peakDay: DAY_NAMES[peakDayIdx],
      nightShare: nightShare,
      weekendShare: weekendShare,
      chronotype: chronotype,
      cadenceDays: cadenceDays,
      spanDays: dates.length > 1 ? (dates[dates.length - 1] - dates[0]) / DAY : 0,
      authors: authorList
    };
  }

  /* ------------------------------------------------------------------ *
   * Release cadence
   * ------------------------------------------------------------------ */

  function releaseCadence(releases, now) {
    var list = (releases || [])
      .filter(function (r) { return r && (r.published_at || r.created_at); })
      .map(function (r) { return new Date(r.published_at || r.created_at).getTime(); })
      .filter(function (t) { return !isNaN(t); })
      .sort(function (a, b) { return b - a; });

    if (!list.length) return { count: 0, daysSinceLast: null, averageGapDays: null };

    var gaps = [];
    for (var i = 0; i < list.length - 1; i++) gaps.push((list[i] - list[i + 1]) / DAY);

    return {
      count: list.length,
      daysSinceLast: ((now || Date.now()) - list[0]) / DAY,
      averageGapDays: gaps.length ? sum(gaps) / gaps.length : null
    };
  }

  /* ------------------------------------------------------------------ *
   * Language mix
   * ------------------------------------------------------------------ */

  function languageMix(languages) {
    var entries = Object.keys(languages || {}).map(function (k) {
      return { name: k, bytes: languages[k] || 0 };
    }).filter(function (e) { return e.bytes > 0; });

    var total = sum(entries.map(function (e) { return e.bytes; }));
    if (!total) return { total: 0, entries: [], primary: null, diversity: 0 };

    entries.sort(function (a, b) { return b.bytes - a.bytes; });
    entries.forEach(function (e) { e.share = e.bytes / total; });

    // Normalised Shannon entropy: 0 = monolingual, 1 = perfectly mixed.
    var h = 0;
    entries.forEach(function (e) { h -= e.share * Math.log(e.share); });
    var diversity = entries.length > 1 ? h / Math.log(entries.length) : 0;

    return { total: total, entries: entries, primary: entries[0].name, diversity: diversity };
  }

  /* ------------------------------------------------------------------ *
   * The six health dimensions
   * ------------------------------------------------------------------ */

  var DIMENSIONS = [
    { key: 'popularity',  label: 'Popularity',    weight: 0.15, icon: '⭐' },
    { key: 'activity',    label: 'Activity',      weight: 0.25, icon: '⚡' },
    { key: 'maintenance', label: 'Maintenance',   weight: 0.20, icon: '🔧' },
    { key: 'community',   label: 'Community',     weight: 0.15, icon: '👥' },
    { key: 'docs',        label: 'Documentation', weight: 0.15, icon: '📚' },
    { key: 'resilience',  label: 'Resilience',    weight: 0.10, icon: '🛡️' }
  ];

  function gradeFor(score) {
    if (score >= 92) return { letter: 'A+', tone: 'exceptional' };
    if (score >= 84) return { letter: 'A',  tone: 'excellent' };
    if (score >= 76) return { letter: 'B+', tone: 'strong' };
    if (score >= 68) return { letter: 'B',  tone: 'healthy' };
    if (score >= 58) return { letter: 'C+', tone: 'okay' };
    if (score >= 48) return { letter: 'C',  tone: 'mixed' };
    if (score >= 36) return { letter: 'D',  tone: 'struggling' };
    return { letter: 'F', tone: 'at risk' };
  }

  /* ------------------------------------------------------------------ *
   * analyze() — the main entry point
   * ------------------------------------------------------------------ */

  /**
   * @param {object} payload
   *   repo         raw GET /repos/:owner/:repo
   *   contributors GET /repos/:o/:r/contributors        (optional)
   *   commits      GET /repos/:o/:r/commits?per_page=100 (optional)
   *   languages    GET /repos/:o/:r/languages           (optional)
   *   releases     GET /repos/:o/:r/releases            (optional)
   *   readme       GET /repos/:o/:r/readme              (optional)
   *   community    GET /repos/:o/:r/community/profile   (optional)
   *   now          timestamp override, for deterministic tests
   */
  function analyze(payload) {
    payload = payload || {};
    var repo = payload.repo;
    if (!repo || !repo.full_name) throw new Error('analyze() needs a GitHub repo payload');
    var now = payload.now || Date.now();

    var stars = repo.stargazers_count || 0;
    var forks = repo.forks_count || 0;
    var watchers = repo.subscribers_count || repo.watchers_count || 0;
    var openIssues = repo.open_issues_count || 0;

    var pushedAgo = daysBetween(repo.pushed_at, now);
    var updatedAgo = daysBetween(repo.updated_at, now);
    var ageDays = daysBetween(repo.created_at, now) || 0;

    var bus = busFactor(payload.contributors);
    var rhythm = commitRhythm(payload.commits);
    var langs = languageMix(payload.languages);
    var rel = releaseCadence(payload.releases, now);

    var readmeBytes = (payload.readme && payload.readme.size) || 0;
    var topics = repo.topics || [];
    var community = payload.community || null;

    /* --- popularity --------------------------------------------------- */
    var popularity = round(
      0.60 * logScore(stars, 40000) +
      0.20 * logScore(forks, 6000) +
      0.20 * logScore(watchers, 2000), 1);

    /* --- activity ------------------------------------------------------ */
    var freshness = decayScore(pushedAgo, 7, 400);
    var cadence = rhythm.cadenceDays != null
      ? decayScore(rhythm.cadenceDays, 1, 30)
      : (pushedAgo != null ? freshness * 0.7 : 0);
    var activity = round(0.6 * freshness + 0.4 * cadence, 1);

    /* --- maintenance ---------------------------------------------------- */
    // Open issues relative to project reach — a big project carries more.
    var expectedIssues = Math.max(5, Math.sqrt(stars + 1) * 1.5);
    var issuePressure = clamp(100 - (openIssues / expectedIssues) * 40, 0, 100);
    var releaseHealth = rel.count === 0
      ? (repo.fork ? 50 : 35)
      : decayScore(rel.daysSinceLast, 60, 900);
    var archivedPenalty = repo.archived ? 0 : 1;
    var maintenance = round(archivedPenalty * (0.45 * issuePressure + 0.35 * releaseHealth + 0.20 * freshness), 1);

    /* --- community ------------------------------------------------------ */
    var contribScore = logScore(bus.contributorCount, 250);
    var forkRatio = stars > 0 ? clamp((forks / stars) * 400, 0, 100) : 0;
    var communitySignals = 0;
    if (repo.license) communitySignals += 40;
    if (community && community.files) {
      if (community.files.contributing) communitySignals += 20;
      if (community.files.code_of_conduct) communitySignals += 20;
      if (community.files.issue_template || community.files.pull_request_template) communitySignals += 20;
    } else {
      communitySignals += repo.license ? 25 : 10; // unknown → partial credit
    }
    communitySignals = clamp(communitySignals, 0, 100);
    var communityScore = round(0.45 * contribScore + 0.20 * forkRatio + 0.35 * communitySignals, 1);

    /* --- documentation --------------------------------------------------- */
    var readmeScore = clamp((readmeBytes / 6000) * 100, 0, 100);
    if (!readmeBytes && community && community.files && community.files.readme) readmeScore = 55;
    var metaScore =
      (repo.description ? 35 : 0) +
      (repo.homepage ? 20 : 0) +
      clamp(topics.length * 9, 0, 30) +
      (repo.has_wiki ? 5 : 0) +
      (repo.has_pages ? 10 : 0);
    var docs = round(0.6 * readmeScore + 0.4 * clamp(metaScore, 0, 100), 1);

    /* --- resilience ------------------------------------------------------- */
    var busScore = clamp(logScore(bus.factor, 12), 0, 100);
    var spreadScore = clamp((1 - bus.gini) * 130, 0, 100);
    var langScore = clamp(30 + langs.diversity * 70, 0, 100);
    var resilience = round(0.5 * busScore + 0.3 * spreadScore + 0.2 * langScore, 1);

    var scores = {
      popularity: popularity,
      activity: activity,
      maintenance: maintenance,
      community: communityScore,
      docs: docs,
      resilience: resilience
    };

    var overall = round(DIMENSIONS.reduce(function (acc, d) {
      return acc + scores[d.key] * d.weight;
    }, 0), 1);

    var grade = gradeFor(overall);

    var report = {
      version: VERSION,
      generatedAt: new Date(now).toISOString(),
      slug: repo.full_name,
      url: repo.html_url,
      description: repo.description || '',
      overall: overall,
      grade: grade.letter,
      tone: grade.tone,
      scores: scores,
      dimensions: DIMENSIONS.map(function (d) {
        return { key: d.key, label: d.label, icon: d.icon, weight: d.weight, score: scores[d.key] };
      }),
      facts: {
        stars: stars,
        forks: forks,
        watchers: watchers,
        openIssues: openIssues,
        ageDays: round(ageDays, 0),
        ageYears: round(ageDays / 365.25, 1),
        pushedAgoDays: pushedAgo == null ? null : round(pushedAgo, 1),
        updatedAgoDays: updatedAgo == null ? null : round(updatedAgo, 1),
        sizeKB: repo.size || 0,
        license: repo.license ? (repo.license.spdx_id || repo.license.name) : null,
        archived: !!repo.archived,
        fork: !!repo.fork,
        topics: topics,
        defaultBranch: repo.default_branch || 'main',
        starsPerDay: ageDays > 0 ? round(stars / ageDays, 2) : 0
      },
      bus: bus,
      rhythm: rhythm,
      languages: langs,
      releases: rel
    };

    report.insights = buildInsights(report);
    report.verdict = buildVerdict(report);
    return report;
  }

  /* ------------------------------------------------------------------ *
   * Insight generation — the bit humans actually read
   * ------------------------------------------------------------------ */

  function pct(n) { return Math.round(n * 100) + '%'; }

  function hourLabel(h) {
    if (h == null) return '';
    var suffix = h < 12 ? 'am' : 'pm';
    var display = h % 12 === 0 ? 12 : h % 12;
    return display + suffix;
  }

  function buildInsights(r) {
    var out = [];
    var f = r.facts;

    function add(kind, icon, text) { out.push({ kind: kind, icon: icon, text: text }); }

    /* headline health */
    if (f.archived) add('bad', '🗄️', 'This repository is archived — it is read-only and will not receive fixes.');

    /* activity */
    if (f.pushedAgoDays != null) {
      if (f.pushedAgoDays < 2) add('good', '🔥', 'Pushed within the last 48 hours — actively under construction.');
      else if (f.pushedAgoDays < 30) add('good', '✅', 'Last push was ' + Math.round(f.pushedAgoDays) + ' days ago. Comfortably alive.');
      else if (f.pushedAgoDays < 180) add('warn', '😴', 'Quiet for ' + Math.round(f.pushedAgoDays) + ' days. Slowing down, not dead.');
      else add('bad', '⚰️', 'No pushes in ' + Math.round(f.pushedAgoDays / 30) + ' months. Treat as unmaintained.');
    }

    /* bus factor */
    if (r.bus.contributorCount > 0) {
      if (r.bus.factor === 1) {
        add('bad', '🚌', 'Bus factor of 1 — a single contributor authored ' + pct(r.bus.topShare) +
          ' of all commits. If they walk away, so does the project.');
      } else if (r.bus.factor <= 3) {
        add('warn', '🚌', 'Bus factor of ' + r.bus.factor + ' — just ' + r.bus.factor +
          ' people carry half the work across ' + r.bus.contributorCount + ' contributors.');
      } else {
        add('good', '🛡️', 'Bus factor of ' + r.bus.factor + ' — work is spread across a real team of ' +
          r.bus.contributorCount + '.');
      }
    }

    /* the surprising one */
    if (r.rhythm.total >= 10) {
      if (r.rhythm.chronotype === 'nocturnal') {
        add('fun', '🦉', pct(r.rhythm.nightShare) + ' of recent commits land between 10pm and 5am. This codebase is nocturnal.');
      } else if (r.rhythm.chronotype === 'early bird') {
        add('fun', '🐓', 'Most commits arrive before 10am — built by early risers.');
      } else if (r.rhythm.chronotype === 'nine-to-five') {
        add('fun', '🏢', 'Commits cluster inside office hours — this looks like funded, salaried work.');
      }
      if (r.rhythm.weekendShare >= 0.3) {
        add('fun', '🌙', pct(r.rhythm.weekendShare) + ' of commits happen on weekends. Somebody has a passion project.');
      } else if (r.rhythm.weekendShare <= 0.05) {
        add('fun', '📅', 'Almost nothing ships on weekends — healthy boundaries, or a corporate calendar.');
      }
      if (r.rhythm.peakDay) {
        add('info', '⏰', 'Peak commit window: ' + r.rhythm.peakDay + 's around ' + hourLabel(r.rhythm.peakHour) + '.');
      }
      if (r.rhythm.cadenceDays != null && r.rhythm.cadenceDays < 0.5) {
        add('good', '🚀', 'A commit lands every ' + round(r.rhythm.cadenceDays * 24, 1) + ' hours on average.');
      }
    }

    /* releases */
    if (r.releases.count === 0) {
      add('warn', '📦', 'No tagged releases. Consumers have to pin commits and hope.');
    } else if (r.releases.daysSinceLast != null && r.releases.daysSinceLast > 365) {
      add('warn', '📦', 'Last release was ' + Math.round(r.releases.daysSinceLast / 30) + ' months ago.');
    } else if (r.releases.averageGapDays != null && r.releases.averageGapDays < 45) {
      add('good', '📦', 'Ships a release roughly every ' + Math.round(r.releases.averageGapDays) + ' days.');
    }

    /* legal */
    if (!f.license) add('bad', '⚖️', 'No license detected — legally this is "all rights reserved". You cannot safely reuse it.');
    else add('good', '⚖️', 'Licensed under ' + f.license + '.');

    /* docs */
    if (r.scores.docs < 40) add('warn', '📚', 'Documentation is thin. Expect to read source to get started.');
    if (!r.description) add('warn', '📝', 'No repository description set.');
    if (f.topics.length === 0) add('info', '🏷️', 'No topics tagged — hurts discoverability on GitHub search.');

    /* issues */
    if (f.openIssues > 500) add('warn', '🐛', f.openIssues.toLocaleString() + ' open issues. The backlog is a lifestyle.');
    else if (f.openIssues === 0 && f.stars > 100) add('good', '✨', 'Zero open issues at ' + f.stars.toLocaleString() + ' stars — impressively tidy.');

    /* traction */
    if (f.starsPerDay >= 5) add('good', '📈', 'Averaging ' + f.starsPerDay + ' stars per day since creation — genuine momentum.');
    if (f.ageYears >= 8 && f.pushedAgoDays != null && f.pushedAgoDays < 60) {
      add('good', '🏛️', f.ageYears + ' years old and still shipping. That is rare.');
    }

    /* languages */
    if (r.languages.primary) {
      add('info', '💻', r.languages.primary + ' is ' + pct(r.languages.entries[0].share) + ' of the codebase' +
        (r.languages.entries.length > 1 ? ', across ' + r.languages.entries.length + ' languages.' : '.'));
    }

    return out;
  }

  function buildVerdict(r) {
    var g = r.grade;
    var f = r.facts;
    if (f.archived) return 'Archived. Read it, learn from it, do not depend on it.';
    if (g === 'A+' || g === 'A') return 'Green light. Well-run, well-documented, and actively maintained — safe to depend on.';
    if (g === 'B+' || g === 'B') return 'Solid choice. A few rough edges, but nothing that should stop you shipping with it.';
    if (g === 'C+' || g === 'C') return 'Proceed with care. Read the source, pin your version, and have an exit plan.';
    if (g === 'D') return 'Risky. Thin maintenance and concentrated ownership — vendor it or budget for maintaining it yourself.';
    return 'Do not build a business on this. Fork it if you need it, and own the outcome.';
  }

  /* ------------------------------------------------------------------ *
   * Presentation helpers (shared by the web UI and the CLI)
   * ------------------------------------------------------------------ */

  var SPARK = '▁▂▃▄▅▆▇█';

  function sparkline(values) {
    if (!values || !values.length) return '';
    var max = Math.max.apply(null, values);
    if (max <= 0) return new Array(values.length + 1).join(SPARK[0]);
    return values.map(function (v) {
      var i = Math.round((v / max) * (SPARK.length - 1));
      return SPARK[clamp(i, 0, SPARK.length - 1)];
    }).join('');
  }

  function formatNumber(n) {
    if (n == null) return '—';
    if (n >= 1e9) return round(n / 1e9, 1) + 'B';
    if (n >= 1e6) return round(n / 1e6, 1) + 'M';
    if (n >= 1e3) return round(n / 1e3, 1) + 'k';
    return String(n);
  }

  function formatBytes(n) {
    if (!n) return '0 B';
    var units = ['B', 'KB', 'MB', 'GB'];
    var i = Math.floor(Math.log(n) / Math.log(1024));
    i = clamp(i, 0, units.length - 1);
    return round(n / Math.pow(1024, i), 1) + ' ' + units[i];
  }

  function relativeTime(days) {
    if (days == null) return 'unknown';
    if (days < 1) return 'today';
    if (days < 2) return 'yesterday';
    if (days < 30) return Math.round(days) + ' days ago';
    if (days < 365) return Math.round(days / 30) + ' months ago';
    return round(days / 365.25, 1) + ' years ago';
  }

  /** The API endpoints a client needs to fetch to feed analyze(). */
  function endpoints(owner, repo) {
    var base = 'https://api.github.com/repos/' + owner + '/' + repo;
    return {
      repo: base,
      contributors: base + '/contributors?per_page=100&anon=0',
      commits: base + '/commits?per_page=100',
      languages: base + '/languages',
      releases: base + '/releases?per_page=20',
      readme: base + '/readme',
      community: base + '/community/profile'
    };
  }

  return {
    VERSION: VERSION,
    DIMENSIONS: DIMENSIONS,
    analyze: analyze,
    parseRepoInput: parseRepoInput,
    busFactor: busFactor,
    gini: gini,
    commitRhythm: commitRhythm,
    releaseCadence: releaseCadence,
    languageMix: languageMix,
    gradeFor: gradeFor,
    endpoints: endpoints,
    sparkline: sparkline,
    formatNumber: formatNumber,
    formatBytes: formatBytes,
    relativeTime: relativeTime,
    logScore: logScore,
    decayScore: decayScore
  };
});
