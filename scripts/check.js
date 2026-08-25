#!/usr/bin/env node
/**
 * Dependency-free repo health checks.
 *
 * Usage: npm run lint
 *
 * Checks:
 *   1. JS syntax      — `node --check` on every .js file
 *   2. JSON validity  — every .json file parses
 *   3. Internal links — every relative href/src in HTML resolves to a real file
 *   4. Anchor targets — every href="#id" has a matching id in the same document
 *   5. Service worker — precache list entries exist; core assets are covered
 *   6. Manifest       — referenced icons exist
 *   7. Quality gates  — no alert()/confirm()/prompt() in shipped JS;
 *                       flags placeholder content (ritesh@example.com) as warnings
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const SKIP_DIRS = new Set(['.git', 'node_modules']);

/* ---------- Shared helpers (also used by tests/) ---------- */

function collectFiles(dir = ROOT, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) collectFiles(full, out);
    else out.push(full);
  }
  return out;
}

function checkHtmlFile(htmlPath, filesSet) {
  const problems = [];
  // Only check markup — attribute-like strings inside <script> (e.g. regex
  // replacement patterns like href="$2") are not real references.
  const html = fs.readFileSync(htmlPath, 'utf8').replace(/<script[\s\S]*?<\/script>/gi, '');
  const rel = path.relative(ROOT, htmlPath);
  const attrRe = /(?:\bhref|\bsrc)\s*=\s*["']([^"']+)["']/g;
  let m;
  while ((m = attrRe.exec(html))) {
    const url = m[1].trim();
    if (/^(https?:|data:|mailto:|tel:|#$|javascript:)/i.test(url)) continue;
    if (url.startsWith('#')) {
      const id = url.slice(1);
      if (id && !new RegExp(`\\bid\\s*=\\s*["']${id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["']`).test(html)) {
        problems.push(`${rel}: anchor target "#${id}" has no matching id`);
      }
      continue;
    }
    const clean = url.split('#')[0].split('?')[0];
    if (!clean) continue;
    const target = path.resolve(path.dirname(htmlPath), clean);
    if (!filesSet.has(target)) problems.push(`${rel}: broken reference "${url}"`);
  }
  return problems;
}

function checkServiceWorker(swPath, filesSet) {
  const problems = [];
  const src = fs.readFileSync(swPath, 'utf8');
  const assetRe = /'(\.\/[^']+)'/g;
  const assets = [];
  let m;
  while ((m = assetRe.exec(src))) assets.push(m[1]);
  for (const a of assets) {
    if (!filesSet.has(path.resolve(ROOT, a.slice(2)))) problems.push(`sw.js: precached asset missing on disk: ${a}`);
  }
  const required = [
    './index.html', './css/style.css',
    './js/main.js', './js/particles.js', './js/effects.js',
    './manifest.json', './404.html',
  ];
  for (const r of required) {
    if (!assets.includes(r)) problems.push(`sw.js: core asset not precached: ${r}`);
  }
  return { problems, assets };
}

/* ---------- Main ---------- */

function runChecks() {
  const files = collectFiles();
  const filesSet = new Set(files);
  const errors = [];
  const warnings = [];

  // 1. JS syntax
  for (const f of files.filter((f) => f.endsWith('.js'))) {
    const res = spawnSync(process.execPath, ['--check', f], { encoding: 'utf8' });
    if (res.status !== 0) errors.push(`Syntax error in ${path.relative(ROOT, f)}:\n${res.stderr.trim()}`);
  }

  // 2. JSON validity
  for (const f of files.filter((f) => f.endsWith('.json') && !f.endsWith('package-lock.json'))) {
    try {
      JSON.parse(fs.readFileSync(f, 'utf8'));
    } catch (e) {
      errors.push(`Invalid JSON in ${path.relative(ROOT, f)}: ${e.message}`);
    }
  }

  // 3 + 4. HTML links & anchors
  for (const f of files.filter((f) => f.endsWith('.html'))) {
    errors.push(...checkHtmlFile(f, filesSet));
  }

  // 5. Service worker precache
  const sw = path.join(ROOT, 'sw.js');
  if (fs.existsSync(sw)) errors.push(...checkServiceWorker(sw, filesSet).problems);

  // 6. Manifest icons
  const manifestPath = path.join(ROOT, 'manifest.json');
  if (fs.existsSync(manifestPath)) {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    for (const icon of manifest.icons || []) {
      if (!filesSet.has(path.join(ROOT, icon.src))) errors.push(`manifest.json: icon missing: ${icon.src}`);
    }
  }

  // 7. Quality gates
  const shippedJs = files.filter((f) => /^(js|bin)\//.test(path.relative(ROOT, f)) && f.endsWith('.js'));
  for (const f of shippedJs) {
    const src = fs.readFileSync(f, 'utf8');
    if (/\b(alert|confirm|prompt)\s*\(/.test(src)) errors.push(`${path.relative(ROOT, f)}: blocking dialog (${RegExp.lastMatch || 'alert'} found) — use showToast() instead`);
  }
  for (const f of files.filter((f) => /\.(html|js|json|md)$/.test(f) && !f.includes('node_modules'))) {
    if (fs.readFileSync(f, 'utf8').includes('ritesh@example.com')) {
      warnings.push(`${path.relative(ROOT, f)}: contains placeholder email "ritesh@example.com" — replace with your real address before shipping`);
    }
  }

  return { errors, warnings, fileCount: files.length };
}

function printReport({ errors, warnings, fileCount }) {
  if (warnings.length) {
    console.log('\n⚠️  Warnings');
    for (const w of warnings) console.log(`   ${w}`);
  }
  if (errors.length) {
    console.error(`\n❌ ${errors.length} error(s):`);
    for (const e of errors) console.error(`   ${e}`);
    console.error(`\nLint failed across ${fileCount} files.`);
    process.exitCode = 1;
  } else {
    console.log(`\n✅ All checks passed (${fileCount} files, ${warnings.length} warning${warnings.length === 1 ? '' : 's'}).`);
  }
}

if (require.main === module) {
  printReport(runChecks());
}

module.exports = { collectFiles, checkHtmlFile, checkServiceWorker, runChecks };
