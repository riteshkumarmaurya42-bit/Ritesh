#!/usr/bin/env node
/**
 * 🩻 Repo X-Ray CLI
 *
 * Same scoring engine as the web app (js/xray-engine.js), rendered to your
 * terminal in colour. Zero dependencies — Node 18+ only.
 *
 *   node bin/xray.js facebook/react
 *   node bin/xray.js vercel/next.js --json
 *   node bin/xray.js sveltejs/svelte --compare vuejs/core
 *   node bin/xray.js facebook/react --markdown > react-health.md
 *
 * Set GITHUB_TOKEN to lift the 60 req/hour anonymous rate limit.
 *
 * MIT © Ritesh
 */
'use strict';

const path = require('path');
const X = require(path.join(__dirname, '..', 'js', 'xray-engine.js'));

/* ------------------------------------------------------------------ *
 * Terminal styling
 * ------------------------------------------------------------------ */
const useColor = process.stdout.isTTY && !process.env.NO_COLOR;
const C = new Proxy({
  reset: '\x1b[0m', bold: '\x1b[1m', dim: '\x1b[2m',
  red: '\x1b[31m', green: '\x1b[32m', yellow: '\x1b[33m',
  blue: '\x1b[34m', magenta: '\x1b[35m', cyan: '\x1b[36m',
  gray: '\x1b[90m', white: '\x1b[97m'
}, { get: (t, k) => (useColor ? (t[k] || '') : '') });

const paint = (code, s) => `${code}${s}${C.reset}`;
const bold = (s) => paint(C.bold, s);
const dim = (s) => paint(C.dim, s);

function scoreColor(s) {
  if (s >= 80) return C.green;
  if (s >= 65) return C.cyan;
  if (s >= 50) return C.magenta;
  if (s >= 35) return C.yellow;
  return C.red;
}
const KIND_COLOR = { good: C.green, warn: C.yellow, bad: C.red, fun: C.magenta, info: C.cyan };

/**
 * Column width of a single code point.
 *
 * Getting this right is what keeps the box borders straight. The trap is that
 * block-drawing glyphs (█ ▊ ░ ▁▂▃) live in the same neighbourhood as emoji but
 * render one column wide, while bare symbols like ⚖ and ⏰ render two.
 */
function charWidth(cp) {
  if (
    cp >= 0x1f300 ||                        // pictographs, most emoji
    (cp >= 0x1f000 && cp <= 0x1f0ff) ||     // mahjong / cards
    (cp >= 0x2600 && cp <= 0x27bf) ||       // misc symbols + dingbats
    (cp >= 0x23e9 && cp <= 0x23fa) ||       // clocks, media controls
    cp === 0x231a || cp === 0x231b ||       // ⌚ ⌛
    cp === 0x25fd || cp === 0x25fe ||
    cp === 0x2b50 || cp === 0x2b55 ||
    (cp >= 0x2b1b && cp <= 0x2b1c) ||
    (cp >= 0x1100 && cp <= 0x115f) ||       // hangul jamo
    (cp >= 0x2e80 && cp <= 0xa4cf) ||       // CJK
    (cp >= 0xac00 && cp <= 0xd7a3) ||
    (cp >= 0xff00 && cp <= 0xff60)          // fullwidth forms
  ) return 2;
  return 1;
}

/** Visible width of a styled string: ANSI stripped, emoji counted as 2. */
function width(s) {
  const plain = String(s).replace(/\x1b\[[0-9;]*m/g, '');
  const chars = Array.from(plain);
  let w = 0;
  for (let i = 0; i < chars.length; i++) {
    const cp = chars[i].codePointAt(0);
    if (cp === 0x200d) { i++; continue; }                 // ZWJ: skip the joined glyph
    if (cp >= 0xfe00 && cp <= 0xfe0f) continue;           // variation selector: no width
    if (cp >= 0x0300 && cp <= 0x036f) continue;           // combining marks
    // A variation-selector-16 promotes the previous glyph to emoji presentation.
    const next = chars[i + 1];
    if (next && next.codePointAt(0) === 0xfe0f) { w += 2; continue; }
    w += charWidth(cp);
  }
  return w;
}

/** Pad/truncate a styled string to an exact column count. */
function fit(s, cols) {
  const w = width(s);
  if (w <= cols) return s + ' '.repeat(cols - w);
  // Truncate on visible characters while preserving trailing reset.
  const chars = Array.from(String(s));
  let out = '', acc = 0;
  for (const ch of chars) {
    const cw = width(ch);
    if (acc + cw > cols - 1) break;
    out += ch; acc += cw;
  }
  return out + '…' + ' '.repeat(Math.max(0, cols - acc - 1)) + C.reset;
}

const INNER = 74;                       // columns between the vertical borders
function line(char = '─') { return char.repeat(INNER); }
function boxTop(title) {
  const t = `─ ${title} `;
  return dim('┌') + dim('─') + bold(` ${title} `) + dim('─'.repeat(Math.max(0, INNER - width(t) - 1)) + '┐');
}
function boxSep() { return dim('├' + line() + '┤'); }
function boxRow(content) {
  return dim('│') + fit(' ' + content, INNER) + dim('│');
}
function boxBot() { return dim('└' + line() + '┘'); }

function bar(score, len = 28) {
  const filled = Math.round((score / 100) * len);
  return paint(scoreColor(score), '█'.repeat(filled)) + dim('░'.repeat(Math.max(0, len - filled)));
}

/** Big ASCII letters for the final grade. */
const BIG = {
  A: [' ▄▀█ ', '█▀▀█ ', '█  █ '],
  B: ['█▀▄  ', '█▀▄  ', '█▄▀  '],
  C: [' ▄▀▀ ', '█    ', ' ▀▄▄ '],
  D: ['█▀▄  ', '█ █  ', '█▄▀  '],
  F: ['█▀▀  ', '█▀   ', '█    '],
  '+': [' ▄  ', '▀█▀ ', ' ▀  ']
};
function bigGrade(g, color) {
  const rows = ['', '', ''];
  for (const ch of g) {
    const art = BIG[ch] || ['   ', '   ', '   '];
    for (let i = 0; i < 3; i++) rows[i] += art[i];
  }
  return rows.map((r) => paint(color, r));
}

function wrap(text, w) {
  const words = String(text).split(/\s+/);
  const out = [];
  let cur = '';
  for (const word of words) {
    if (width(cur + ' ' + word) > w && cur) { out.push(cur); cur = word; }
    else cur = cur ? cur + ' ' + word : word;
  }
  if (cur) out.push(cur);
  return out;
}

/* ------------------------------------------------------------------ *
 * GitHub fetching
 * ------------------------------------------------------------------ */
const TOKEN = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;

async function api(url, optional = false) {
  const headers = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'repo-xray-cli'
  };
  if (TOKEN) headers.Authorization = `Bearer ${TOKEN}`;

  let res;
  try {
    res = await fetch(url, { headers });
  } catch (e) {
    if (optional) return null;
    throw new Error(`network error reaching GitHub (${e.message})`);
  }

  if (res.status === 404) {
    if (optional) return null;
    throw new Error('repository not found — check the owner/repo spelling');
  }
  if (res.status === 403 || res.status === 429) {
    const reset = res.headers.get('x-ratelimit-reset');
    const when = reset ? new Date(reset * 1000).toLocaleTimeString() : 'soon';
    throw new Error(
      `GitHub rate limit hit (resets ${when}). ` +
      (TOKEN ? '' : 'Set GITHUB_TOKEN to get 5,000 requests/hour.')
    );
  }
  if (!res.ok) {
    if (optional) return null;
    throw new Error(`GitHub returned ${res.status}`);
  }
  return res.json();
}

async function scan(slugStr) {
  const slug = X.parseRepoInput(slugStr);
  if (!slug || !slug.repo) throw new Error(`cannot parse "${slugStr}" — expected owner/repo`);
  const ep = X.endpoints(slug.owner, slug.repo);

  const repo = await api(ep.repo);
  const [contributors, commits, languages, releases, readme, community] = await Promise.all([
    api(ep.contributors, true),
    api(ep.commits, true),
    api(ep.languages, true),
    api(ep.releases, true),
    api(ep.readme, true),
    api(ep.community, true)
  ]);

  const report = X.analyze({
    repo,
    contributors: Array.isArray(contributors) ? contributors : [],
    commits: Array.isArray(commits) ? commits : [],
    languages: languages || {},
    releases: Array.isArray(releases) ? releases : [],
    readme,
    community
  });
  report._contributors = Array.isArray(contributors) ? contributors.slice(0, 6) : [];
  return report;
}

/* ------------------------------------------------------------------ *
 * Rendering
 * ------------------------------------------------------------------ */
function render(r) {
  const f = r.facts;
  const col = scoreColor(r.overall);
  const out = [];

  out.push('');
  out.push(boxTop('🩻  REPO X-RAY'));
  out.push(boxRow(''));

  const art = bigGrade(r.grade, col);
  const meta = [
    bold(r.slug),
    dim(r.description ? r.description.slice(0, 44) : 'no description'),
    `${paint(col, r.overall.toFixed(1) + '/100')} ${dim('·')} ${paint(col, r.tone)}`
  ];
  for (let i = 0; i < 3; i++) out.push(boxRow(`${art[i]}   ${meta[i] || ''}`));

  out.push(boxRow(''));
  out.push(boxSep());
  out.push(boxRow(bold('HEALTH DIMENSIONS')));
  out.push(boxRow(''));
  for (const d of r.dimensions) {
    const label = `${d.label}`.padEnd(14);
    const val = paint(scoreColor(d.score), String(Math.round(d.score)).padStart(3));
    out.push(boxRow(`${label}${bar(d.score)} ${val}  ${dim(Math.round(d.weight * 100) + '%')}`));
  }

  out.push(boxRow(''));
  out.push(boxSep());
  out.push(boxRow(bold('FACTS')));
  out.push(boxRow(''));
  out.push(boxRow(
    `${dim('stars')} ${X.formatNumber(f.stars).padEnd(8)}` +
    `${dim('forks')} ${X.formatNumber(f.forks).padEnd(8)}` +
    `${dim('issues')} ${X.formatNumber(f.openIssues).padEnd(8)}` +
    `${dim('age')} ${f.ageYears}y`
  ));
  out.push(boxRow(
    `${dim('license')} ${(f.license || 'none').padEnd(12)}` +
    `${dim('pushed')} ${X.relativeTime(f.pushedAgoDays).padEnd(14)}` +
    `${dim('size')} ${X.formatBytes(f.sizeKB * 1024)}`
  ));

  /* rhythm */
  if (r.rhythm.total) {
    const rh = r.rhythm;
    out.push(boxRow(''));
    out.push(boxSep());
    out.push(boxRow(bold('COMMIT RHYTHM') + dim(`  last ${rh.total} commits, contributor local time`)));
    out.push(boxRow(''));
    out.push(boxRow(paint(C.magenta, X.sparkline(rh.byHour)) + dim('  00h ────────────────► 23h')));
    out.push(boxRow(
      `${dim('chronotype')} ${bold(rh.chronotype)}  ` +
      `${dim('peak')} ${rh.peakDay}s  ` +
      `${dim('night')} ${Math.round(rh.nightShare * 100)}%  ` +
      `${dim('weekend')} ${Math.round(rh.weekendShare * 100)}%`
    ));
    if (rh.cadenceDays != null) {
      const cad = rh.cadenceDays < 1
        ? `${Math.round(rh.cadenceDays * 24)}h`
        : `${rh.cadenceDays.toFixed(1)}d`;
      out.push(boxRow(`${dim('cadence')} one commit every ${bold(cad)}`));
    }
    // Punch card: 7 rows × 24 hours, shaded by commit density.
    out.push(boxRow(''));
    const SHADE = [' ', '·', '░', '▒', '▓', '█'];
    let peak = 1;
    for (const row of rh.grid) for (const n of row) if (n > peak) peak = n;
    const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    rh.grid.forEach((row, d) => {
      const cells = row.map((n) => {
        if (!n) return dim(SHADE[0]);
        const i = Math.min(SHADE.length - 1, 1 + Math.round(Math.sqrt(n / peak) * (SHADE.length - 2)));
        return paint(i >= 4 ? C.magenta : C.blue, SHADE[i]);
      }).join('');
      out.push(boxRow(`${dim(DAYS[d])} ${cells} ${dim(String(rh.byWeekday[d]).padStart(3))}`));
    });
    // Hour axis. Each grid column is one character wide starting at column 4,
    // so a label for hour h begins exactly at index 4 + h.
    const GUTTER = 4;
    let ticks = ' '.repeat(GUTTER);
    let labels = ' '.repeat(GUTTER);
    for (let h = 0; h < 24; h++) {
      ticks += h % 3 === 0 ? '┬' : '─';
      if (h % 6 === 0) labels = labels.padEnd(GUTTER + h) + String(h);
    }
    out.push(boxRow(dim(ticks)));
    out.push(boxRow(dim(labels.padEnd(GUTTER + 26) + 'hour of day')));
  }

  /* bus factor */
  if (r.bus.contributorCount) {
    const b = r.bus;
    const bcol = b.factor === 1 ? C.red : b.factor <= 3 ? C.yellow : C.green;
    out.push(boxRow(''));
    out.push(boxSep());
    out.push(boxRow(bold('BUS FACTOR ') + paint(bcol, String(b.factor)) +
      dim(` of ${b.contributorCount} contributors · gini ${b.gini.toFixed(2)}`)));
    out.push(boxRow(''));
    const top = r._contributors[0] ? r._contributors[0].contributions : 1;
    for (const c of r._contributors) {
      const w = Math.round((c.contributions / top) * 24);
      out.push(boxRow(
        `${c.login.slice(0, 20).padEnd(21)}` +
        paint(C.magenta, '▊'.repeat(Math.max(1, w))) +
        dim(' ' + X.formatNumber(c.contributions))
      ));
    }
  }

  /* languages */
  if (r.languages.entries.length) {
    out.push(boxRow(''));
    out.push(boxSep());
    out.push(boxRow(bold('LANGUAGES') + dim(`  diversity ${r.languages.diversity.toFixed(2)}`)));
    out.push(boxRow(''));
    for (const l of r.languages.entries.slice(0, 5)) {
      out.push(boxRow(
        `${l.name.slice(0, 16).padEnd(17)}` +
        paint(C.cyan, '▊'.repeat(Math.max(1, Math.round(l.share * 30)))) +
        dim(` ${(l.share * 100).toFixed(1)}%`)
      ));
    }
  }

  /* insights */
  out.push(boxRow(''));
  out.push(boxSep());
  out.push(boxRow(bold('INSIGHTS')));
  out.push(boxRow(''));
  for (const n of r.insights) {
    const lines = wrap(n.text, INNER - 8);
    lines.forEach((l, i) => {
      out.push(boxRow(i === 0 ? `${n.icon} ${paint(KIND_COLOR[n.kind] || C.white, l)}`
                              : `   ${paint(KIND_COLOR[n.kind] || C.white, l)}`));
    });
  }

  /* verdict */
  out.push(boxRow(''));
  out.push(boxSep());
  out.push(boxRow(bold('VERDICT')));
  out.push(boxRow(''));
  wrap(r.verdict, INNER - 4).forEach((l) => out.push(boxRow(paint(col, l))));
  out.push(boxRow(''));
  out.push(boxBot());
  out.push(dim(`  ${r.url}   ·   xray v${r.version}   ·   ${new Date(r.generatedAt).toLocaleString()}`));
  out.push('');

  return out.join('\n');
}

function renderCompare(a, b) {
  const out = [''];
  out.push(boxTop('⚔️  HEAD TO HEAD'));
  out.push(boxRow(''));
  out.push(boxRow(
    `${paint(scoreColor(a.overall), bold(a.grade.padEnd(3)))} ${a.slug.slice(0, 26).padEnd(27)}` +
    dim('vs  ') +
    `${paint(scoreColor(b.overall), bold(b.grade.padEnd(3)))} ${b.slug.slice(0, 26)}`
  ));
  out.push(boxRow(
    dim(`${a.overall.toFixed(1)}`.padEnd(31)) + '    ' + dim(`${b.overall.toFixed(1)}`)
  ));
  out.push(boxRow(''));
  out.push(boxSep());
  out.push(boxRow(''));

  a.dimensions.forEach((d, i) => {
    const bs = b.dimensions[i].score;
    const L = Math.round((d.score / 100) * 14);
    const R = Math.round((bs / 100) * 14);
    const left = dim('░'.repeat(14 - L)) + paint(scoreColor(d.score), '█'.repeat(L));
    const right = paint(scoreColor(bs), '█'.repeat(R)) + dim('░'.repeat(14 - R));
    const winner = d.score > bs ? '◄' : d.score < bs ? '►' : '=';
    out.push(boxRow(
      `${String(Math.round(d.score)).padStart(3)} ${left} ` +
      `${dim(d.label.slice(0, 13).padStart(13))} ${paint(C.yellow, winner)} ` +
      `${right} ${String(Math.round(bs)).padStart(3)}`
    ));
  });

  const winner = a.overall >= b.overall ? a : b;
  out.push(boxRow(''));
  out.push(boxSep());
  out.push(boxRow(''));
  out.push(boxRow(`🏆 ${bold(winner.slug)} ${dim('wins by ' + Math.abs(a.overall - b.overall).toFixed(1) + ' points')}`));
  wrap(winner.verdict, INNER - 4).forEach((l) => out.push(boxRow(dim(l))));
  out.push(boxRow(''));
  out.push(boxBot());
  out.push('');
  return out.join('\n');
}

function renderMarkdown(r) {
  const f = r.facts;
  const L = [];
  L.push(`# 🩻 Repo X-Ray — ${r.slug}`);
  L.push('');
  L.push(`**Grade ${r.grade}** (${r.overall.toFixed(1)}/100) — ${r.tone}`);
  L.push('');
  L.push(`> ${r.verdict}`);
  L.push('');
  L.push('| Dimension | Score | Weight |');
  L.push('|---|---:|---:|');
  r.dimensions.forEach((d) => L.push(`| ${d.icon} ${d.label} | ${Math.round(d.score)} | ${Math.round(d.weight * 100)}% |`));
  L.push('');
  L.push(`⭐ ${X.formatNumber(f.stars)} · 🍴 ${X.formatNumber(f.forks)} · 🐛 ${X.formatNumber(f.openIssues)} open · ` +
         `⚖️ ${f.license || 'no license'} · 📤 last push ${X.relativeTime(f.pushedAgoDays)}`);
  L.push('');
  L.push(`**Bus factor:** ${r.bus.factor} of ${r.bus.contributorCount} contributors ` +
         `(top owns ${Math.round(r.bus.topShare * 100)}%, Gini ${r.bus.gini.toFixed(2)})`);
  if (r.rhythm.total) {
    L.push('');
    L.push(`**Rhythm:** ${r.rhythm.chronotype} · peak ${r.rhythm.peakDay}s · ` +
           `${Math.round(r.rhythm.nightShare * 100)}% after dark · ${Math.round(r.rhythm.weekendShare * 100)}% weekends`);
    L.push('');
    L.push('```');
    L.push(`${X.sparkline(r.rhythm.byHour)}   00h → 23h`);
    L.push('```');
  }
  L.push('');
  L.push('### Insights');
  r.insights.forEach((n) => L.push(`- ${n.icon} ${n.text}`));
  L.push('');
  L.push(`*Generated by Repo X-Ray v${r.version} — \`node bin/xray.js ${r.slug}\`*`);
  return L.join('\n');
}

/* ------------------------------------------------------------------ *
 * CLI
 * ------------------------------------------------------------------ */
const HELP = `
${bold('🩻  Repo X-Ray')} ${dim('— GitHub repository health, risk and rhythm')}

${bold('USAGE')}
  node bin/xray.js <owner/repo> [options]

${bold('OPTIONS')}
  --compare <owner/repo>   Head-to-head against another repo
  --json                   Emit the raw report as JSON
  --markdown, --md         Emit a Markdown report (great for PR comments)
  --no-color               Disable ANSI colour
  --help, -h               Show this help

${bold('EXAMPLES')}
  node bin/xray.js facebook/react
  node bin/xray.js https://github.com/vercel/next.js
  node bin/xray.js sveltejs/svelte --compare vuejs/core
  node bin/xray.js astral-sh/ruff --md > ruff-health.md

${bold('ENVIRONMENT')}
  GITHUB_TOKEN   Optional. Lifts the rate limit from 60 to 5,000 req/hour.

${dim('The same engine powers the web version: features/xray.html')}
`;

async function main() {
  const argv = process.argv.slice(2);
  if (!argv.length || argv.includes('--help') || argv.includes('-h')) {
    console.log(HELP);
    process.exit(argv.length ? 0 : 1);
  }

  const flag = (name) => {
    const i = argv.indexOf(name);
    return i !== -1 && argv[i + 1] ? argv[i + 1] : null;
  };
  const target = argv.find((a) => !a.startsWith('-') && argv[argv.indexOf(a) - 1] !== '--compare');
  const compare = flag('--compare');
  const asJson = argv.includes('--json');
  const asMd = argv.includes('--markdown') || argv.includes('--md');

  if (!target) { console.error('✖ no repository given. Try --help'); process.exit(1); }

  const quiet = asJson || asMd;
  if (!quiet) process.stderr.write(dim(`  scanning ${target}…\r`));

  try {
    const report = await scan(target);
    if (!quiet) process.stderr.write(' '.repeat(60) + '\r');

    if (asJson) { console.log(JSON.stringify(report, null, 2)); return; }
    if (asMd) { console.log(renderMarkdown(report)); return; }

    console.log(render(report));

    if (compare) {
      process.stderr.write(dim(`  scanning ${compare}…\r`));
      const other = await scan(compare);
      process.stderr.write(' '.repeat(60) + '\r');
      console.log(renderCompare(report, other));
    }
  } catch (e) {
    process.stderr.write(' '.repeat(60) + '\r');
    console.error(`${paint(C.red, '✖')} ${e.message}`);
    process.exit(1);
  }
}

if (require.main === module) main();
module.exports = { scan, render, renderMarkdown, renderCompare };
