#!/usr/bin/env node
/**
 * Repo X-Ray engine tests — zero dependencies, uses node:test + node:assert.
 *
 *   node --test test/
 *   npm test
 */
'use strict';

const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const X = require(path.join(__dirname, '..', 'js', 'xray-engine.js'));

const NOW = Date.parse('2026-01-01T00:00:00Z');
const daysAgo = (d) => new Date(NOW - d * 86400000).toISOString();

/* ------------------------------------------------------------------ */
describe('parseRepoInput', () => {
  const cases = [
    ['facebook/react', 'facebook', 'react'],
    ['  facebook/react  ', 'facebook', 'react'],
    ['https://github.com/facebook/react', 'facebook', 'react'],
    ['https://www.github.com/facebook/react/', 'facebook', 'react'],
    ['http://github.com/facebook/react.git', 'facebook', 'react'],
    ['git@github.com:facebook/react.git', 'facebook', 'react'],
    ['git+https://github.com/facebook/react.git', 'facebook', 'react'],
    ['github.com/facebook/react', 'facebook', 'react'],
    ['https://github.com/facebook/react/tree/main/packages', 'facebook', 'react'],
    ['https://github.com/facebook/react/issues/123', 'facebook', 'react'],
    ['https://github.com/facebook/react?tab=readme', 'facebook', 'react']
  ];

  for (const [input, owner, repo] of cases) {
    test(`parses ${JSON.stringify(input)}`, () => {
      const r = X.parseRepoInput(input);
      assert.equal(r.owner, owner);
      assert.equal(r.repo, repo);
      assert.equal(r.slug, `${owner}/${repo}`);
    });
  }

  test('bare username has no repo', () => {
    const r = X.parseRepoInput('sindresorhus');
    assert.equal(r.owner, 'sindresorhus');
    assert.equal(r.repo, null);
  });

  test('rejects junk', () => {
    for (const bad of ['', '   ', null, undefined, 42, '///', 'has space/repo']) {
      assert.equal(X.parseRepoInput(bad), null, `expected null for ${JSON.stringify(bad)}`);
    }
  });
});

/* ------------------------------------------------------------------ */
describe('busFactor', () => {
  test('single dominant author gives factor 1', () => {
    const b = X.busFactor([{ contributions: 900 }, { contributions: 50 }, { contributions: 50 }]);
    assert.equal(b.factor, 1);
    assert.equal(b.contributorCount, 3);
    assert.ok(b.topShare > 0.85);
    assert.ok(b.gini > 0.4);
  });

  test('even team needs half of them', () => {
    const b = X.busFactor(Array.from({ length: 10 }, () => ({ contributions: 100 })));
    assert.equal(b.factor, 5);
    assert.ok(b.gini < 0.05, `expected near-zero gini, got ${b.gini}`);
  });

  test('empty input is safe', () => {
    const b = X.busFactor([]);
    assert.equal(b.factor, 0);
    assert.equal(b.total, 0);
  });

  test('ignores zero-contribution entries', () => {
    const b = X.busFactor([{ contributions: 10 }, { contributions: 0 }]);
    assert.equal(b.contributorCount, 1);
  });
});

describe('gini', () => {
  test('perfect equality is 0', () => assert.ok(X.gini([5, 5, 5, 5]) < 1e-9));
  test('total inequality approaches 1', () => assert.ok(X.gini([0, 0, 0, 100]) > 0.7));
  test('empty array is 0', () => assert.equal(X.gini([]), 0));
});

/* ------------------------------------------------------------------ */
describe('commitRhythm', () => {
  const mk = (iso) => ({ commit: { author: { date: iso, name: 'dev' } }, author: { login: 'dev' } });

  test('detects a nocturnal codebase', () => {
    const commits = [];
    for (let i = 0; i < 20; i++) commits.push(mk(`2025-11-${String(i + 1).padStart(2, '0')}T02:30:00Z`));
    const r = X.commitRhythm(commits);
    assert.equal(r.total, 20);
    assert.equal(r.chronotype, 'nocturnal');
    assert.equal(r.peakHour, 2);
    assert.ok(r.nightShare > 0.9);
  });

  test('detects nine-to-five', () => {
    const commits = [];
    // Mon-Fri, 10:00-16:00
    for (let d = 3; d <= 7; d++) {
      for (const h of [10, 11, 13, 14, 15, 16]) {
        commits.push(mk(`2025-11-0${d}T${String(h).padStart(2, '0')}:00:00Z`));
      }
    }
    const r = X.commitRhythm(commits);
    assert.equal(r.chronotype, 'nine-to-five');
    assert.equal(r.weekendShare, 0);
  });

  test('honours the commit UTC offset (author wall clock, not UTC)', () => {
    // 23:00-08:00 is 07:00 UTC the next day, but the human typed it at 23:00.
    const nocturnal = X.commitRhythm([mk('2025-11-03T23:00:00-08:00')]);
    assert.equal(nocturnal.peakHour, 23, 'should report the author local hour');

    // Same instant expressed in UTC would be misread as a 7am commit.
    const naive = X.commitRhythm([mk('2025-11-04T07:00:00Z')]);
    assert.equal(naive.peakHour, 7);

    // And a +05:30 offset resolves to its own local hour.
    assert.equal(X.commitRhythm([mk('2025-11-03T02:15:00+05:30')]).peakHour, 2);
  });

  test('handles malformed or empty input', () => {
    const r = X.commitRhythm([{}, { commit: {} }, { commit: { author: {} } }, null].filter(Boolean));
    assert.equal(r.total, 0);
    assert.equal(r.chronotype, 'unknown');
    assert.deepEqual(X.commitRhythm([]).byHour.length, 24);
  });

  test('builds an exact weekday × hour punch card', () => {
    // 2025-11-03 is a Monday (weekday 1), 2025-11-08 a Saturday (weekday 6).
    const r = X.commitRhythm([
      mk('2025-11-03T02:00:00Z'), mk('2025-11-03T02:30:00Z'), mk('2025-11-08T14:00:00Z')
    ]);
    assert.equal(r.grid.length, 7);
    assert.equal(r.grid[0].length, 24);
    assert.equal(r.grid[1][2], 2, 'two Monday 2am commits');
    assert.equal(r.grid[6][14], 1, 'one Saturday 2pm commit');
    assert.equal(r.grid[3][9], 0);

    const gridTotal = r.grid.reduce((a, row) => a + row.reduce((x, y) => x + y, 0), 0);
    assert.equal(gridTotal, r.total, 'grid must account for every commit');

    // Marginals must agree with the grid.
    for (let h = 0; h < 24; h++) {
      const col = r.grid.reduce((a, row) => a + row[h], 0);
      assert.equal(col, r.byHour[h], `hour ${h} marginal mismatch`);
    }
    for (let d = 0; d < 7; d++) {
      const row = r.grid[d].reduce((a, b) => a + b, 0);
      assert.equal(row, r.byWeekday[d], `weekday ${d} marginal mismatch`);
    }
  });

  test('grid exists even with no commits', () => {
    const r = X.commitRhythm([]);
    assert.equal(r.grid.length, 7);
    assert.equal(r.grid[0].length, 24);
    assert.ok(r.grid.every((row) => row.every((n) => n === 0)));
  });

  test('computes cadence across a span', () => {
    const r = X.commitRhythm([
      mk('2025-11-01T12:00:00Z'), mk('2025-11-03T12:00:00Z'), mk('2025-11-05T12:00:00Z')
    ]);
    assert.equal(r.cadenceDays, 2);
  });
});

/* ------------------------------------------------------------------ */
describe('languageMix', () => {
  test('monolingual has zero diversity', () => {
    const m = X.languageMix({ Rust: 1000 });
    assert.equal(m.primary, 'Rust');
    assert.equal(m.diversity, 0);
    assert.equal(m.entries[0].share, 1);
  });

  test('even split has maximal diversity', () => {
    const m = X.languageMix({ Go: 500, Python: 500 });
    assert.ok(m.diversity > 0.99);
  });

  test('sorts by size and skips empties', () => {
    const m = X.languageMix({ CSS: 10, TypeScript: 900, Shell: 0 });
    assert.equal(m.primary, 'TypeScript');
    assert.equal(m.entries.length, 2);
  });

  test('empty object is safe', () => {
    assert.equal(X.languageMix({}).primary, null);
    assert.equal(X.languageMix(null).total, 0);
  });
});

/* ------------------------------------------------------------------ */
describe('releaseCadence', () => {
  test('averages the gaps', () => {
    const r = X.releaseCadence([
      { published_at: daysAgo(10) }, { published_at: daysAgo(20) }, { published_at: daysAgo(40) }
    ], NOW);
    assert.equal(r.count, 3);
    assert.equal(Math.round(r.daysSinceLast), 10);
    assert.equal(Math.round(r.averageGapDays), 15);
  });

  test('no releases is safe', () => {
    const r = X.releaseCadence([], NOW);
    assert.equal(r.count, 0);
    assert.equal(r.daysSinceLast, null);
  });
});

/* ------------------------------------------------------------------ */
describe('scoring curves', () => {
  test('logScore is monotonic and bounded', () => {
    assert.equal(X.logScore(0, 1000), 0);
    assert.ok(X.logScore(1000, 1000) > 99.9);
    assert.ok(X.logScore(10, 1000) < X.logScore(100, 1000));
    assert.ok(X.logScore(999999, 1000) <= 100);
  });

  test('decayScore clamps at both ends', () => {
    assert.equal(X.decayScore(0, 7, 400), 100);
    assert.equal(X.decayScore(5, 7, 400), 100);
    assert.equal(X.decayScore(9999, 7, 400), 0);
    assert.ok(X.decayScore(200, 7, 400) > 0 && X.decayScore(200, 7, 400) < 100);
  });

  test('grades span the full range', () => {
    assert.equal(X.gradeFor(100).letter, 'A+');
    assert.equal(X.gradeFor(70).letter, 'B');
    assert.equal(X.gradeFor(0).letter, 'F');
  });
});

/* ------------------------------------------------------------------ */
describe('analyze', () => {
  const healthyRepo = {
    full_name: 'acme/rocket',
    html_url: 'https://github.com/acme/rocket',
    description: 'A very healthy project',
    homepage: 'https://rocket.dev',
    stargazers_count: 22000,
    forks_count: 2100,
    subscribers_count: 400,
    open_issues_count: 80,
    size: 42000,
    created_at: daysAgo(2200),
    pushed_at: daysAgo(1),
    updated_at: daysAgo(1),
    license: { spdx_id: 'MIT' },
    topics: ['rust', 'cli', 'performance'],
    has_wiki: true,
    has_pages: true,
    default_branch: 'main'
  };

  const healthyPayload = {
    now: NOW,
    repo: healthyRepo,
    contributors: Array.from({ length: 120 }, (_, i) => ({
      login: `dev${i}`, contributions: 200 - i
    })),
    commits: Array.from({ length: 60 }, (_, i) => ({
      commit: { author: { date: daysAgo(i * 0.4), name: `dev${i % 9}` } },
      author: { login: `dev${i % 9}` }
    })),
    languages: { Rust: 800000, TypeScript: 200000, Shell: 40000 },
    releases: Array.from({ length: 12 }, (_, i) => ({ published_at: daysAgo(i * 21) })),
    readme: { size: 18000 },
    community: { files: { contributing: {}, code_of_conduct: {}, issue_template: {}, readme: {} } }
  };

  const abandonedPayload = {
    now: NOW,
    repo: {
      full_name: 'ghost/abandoned',
      html_url: 'https://github.com/ghost/abandoned',
      description: '',
      stargazers_count: 12,
      forks_count: 1,
      subscribers_count: 1,
      open_issues_count: 47,
      size: 300,
      created_at: daysAgo(3000),
      pushed_at: daysAgo(1400),
      updated_at: daysAgo(1400),
      license: null,
      topics: []
    },
    contributors: [{ login: 'solo', contributions: 200 }],
    commits: [],
    languages: { PHP: 5000 },
    releases: [],
    readme: { size: 120 },
    community: null
  };

  test('healthy repo grades well', () => {
    const r = X.analyze(healthyPayload);
    assert.ok(r.overall > 70, `expected >70, got ${r.overall}`);
    assert.ok(['A+', 'A', 'B+', 'B'].includes(r.grade), `unexpected grade ${r.grade}`);
    assert.equal(r.slug, 'acme/rocket');
    assert.ok(r.bus.factor > 1);
    assert.ok(r.insights.length > 3);
    assert.match(r.verdict, /\w+/);
  });

  test('abandoned repo grades badly', () => {
    const r = X.analyze(abandonedPayload);
    assert.ok(r.overall < 45, `expected <45, got ${r.overall}`);
    assert.equal(r.bus.factor, 1);
    assert.ok(r.insights.some((i) => /license/i.test(i.text)));
    assert.ok(r.insights.some((i) => i.kind === 'bad'));
  });

  test('healthy always beats abandoned', () => {
    assert.ok(X.analyze(healthyPayload).overall > X.analyze(abandonedPayload).overall + 25);
  });

  test('archived repos are called out and penalised', () => {
    const r = X.analyze({
      ...healthyPayload,
      repo: { ...healthyRepo, archived: true }
    });
    assert.equal(r.scores.maintenance, 0);
    assert.ok(r.insights.some((i) => /archived/i.test(i.text)));
    assert.match(r.verdict, /Archived/);
  });

  test('every dimension stays within 0..100', () => {
    for (const payload of [healthyPayload, abandonedPayload]) {
      const r = X.analyze(payload);
      for (const d of r.dimensions) {
        assert.ok(d.score >= 0 && d.score <= 100, `${d.key} out of range: ${d.score}`);
      }
      assert.ok(r.overall >= 0 && r.overall <= 100);
    }
  });

  test('dimension weights sum to 1', () => {
    const total = X.DIMENSIONS.reduce((a, d) => a + d.weight, 0);
    assert.ok(Math.abs(total - 1) < 1e-9, `weights sum to ${total}`);
  });

  test('survives a payload with only the repo object', () => {
    const r = X.analyze({ now: NOW, repo: healthyRepo });
    assert.ok(r.overall > 0);
    assert.equal(r.rhythm.total, 0);
    assert.equal(r.bus.factor, 0);
  });

  test('throws without a repo payload', () => {
    assert.throws(() => X.analyze({}), /needs a GitHub repo payload/);
    assert.throws(() => X.analyze(), /needs a GitHub repo payload/);
  });

  test('report is JSON-serialisable', () => {
    const r = X.analyze(healthyPayload);
    assert.deepEqual(JSON.parse(JSON.stringify(r)).slug, r.slug);
  });

  test('is deterministic for a fixed `now`', () => {
    assert.equal(X.analyze(healthyPayload).overall, X.analyze(healthyPayload).overall);
  });
});

/* ------------------------------------------------------------------ */
describe('formatters', () => {
  test('sparkline maps range to blocks', () => {
    const s = X.sparkline([0, 1, 2, 3, 4, 5, 6, 7]);
    assert.equal(s.length, 8);
    assert.equal(s[0], '▁');
    assert.equal(s[7], '█');
  });

  test('sparkline handles all-zero and empty', () => {
    assert.equal(X.sparkline([0, 0, 0]), '▁▁▁');
    assert.equal(X.sparkline([]), '');
  });

  test('formatNumber abbreviates', () => {
    assert.equal(X.formatNumber(999), '999');
    assert.equal(X.formatNumber(1500), '1.5k');
    assert.equal(X.formatNumber(2400000), '2.4M');
  });

  test('formatBytes scales', () => {
    assert.equal(X.formatBytes(0), '0 B');
    assert.equal(X.formatBytes(2048), '2 KB');
  });

  test('relativeTime reads naturally', () => {
    assert.equal(X.relativeTime(0.2), 'today');
    assert.equal(X.relativeTime(1.5), 'yesterday');
    assert.equal(X.relativeTime(10), '10 days ago');
    assert.equal(X.relativeTime(400), '1.1 years ago');
    assert.equal(X.relativeTime(null), 'unknown');
  });

  test('endpoints are well formed', () => {
    const ep = X.endpoints('facebook', 'react');
    assert.equal(ep.repo, 'https://api.github.com/repos/facebook/react');
    assert.match(ep.commits, /\/commits\?per_page=100$/);
    assert.equal(Object.keys(ep).length, 7);
  });
});
