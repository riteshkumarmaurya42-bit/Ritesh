/**
 * Site integrity tests — run with `npm test`.
 * Reuses the same checkers as `npm run lint` so CI stays in sync.
 */
'use strict';

const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const { checkHtmlFile, checkServiceWorker, collectFiles } = require('../scripts/check.js');

const ROOT = path.resolve(__dirname, '..');
const files = collectFiles();
const filesSet = new Set(files);

test('every HTML file has valid internal references', () => {
  const htmlFiles = files.filter((f) => f.endsWith('.html'));
  assert.ok(htmlFiles.length >= 5, 'expected at least 5 HTML pages');
  const problems = htmlFiles.flatMap((f) => checkHtmlFile(f, filesSet));
  assert.deepStrictEqual(problems, [], problems.join('\n'));
});

test('service worker precache list is complete and files exist', () => {
  const { problems, assets } = checkServiceWorker(path.join(ROOT, 'sw.js'), filesSet);
  assert.deepStrictEqual(problems, [], problems.join('\n'));
  assert.ok(assets.length >= 8, 'precache list looks too small');
});

test('manifest.json is installable (icons, start_url, scope)', () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, 'manifest.json'), 'utf8'));
  assert.strictEqual(manifest.start_url, './', 'start_url must be relative for GitHub Pages project sites');
  assert.strictEqual(manifest.scope, './');
  const sizes = (manifest.icons || []).map((i) => i.sizes);
  assert.ok(sizes.includes('192x192'), 'missing 192x192 icon');
  assert.ok(sizes.includes('512x512'), 'missing 512x512 icon');
  assert.ok((manifest.icons || []).some((i) => (i.purpose || '').includes('maskable')), 'missing maskable icon');
  for (const icon of manifest.icons || []) {
    assert.ok(fs.existsSync(path.join(ROOT, icon.src)), `icon missing on disk: ${icon.src}`);
  }
});

test('index.html wires up PWA + SEO essentials', () => {
  const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  assert.ok(html.includes('rel="manifest"'), 'manifest not linked');
  assert.ok(html.includes('rel="canonical"'), 'canonical URL missing');
  assert.ok(/property="og:title"/.test(html), 'Open Graph tags missing');
  assert.ok(/name="twitter:card"/.test(html), 'Twitter card missing');
  assert.ok(/name="description"/.test(html), 'meta description missing');
  assert.ok(/rel="apple-touch-icon"/.test(html), 'apple-touch-icon missing');
  assert.ok(/rel="skip"/.test(html) || /class="skip-link"/.test(html), 'skip-to-content link missing');
});

test('data/projects.json schema is valid', () => {
  const data = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'projects.json'), 'utf8'));
  assert.ok(data.features.length >= 4, 'expected the 4 feature pages');
  for (const feature of data.features) {
    assert.ok(feature.id && feature.name && feature.path, `feature missing fields: ${feature.id}`);
    assert.ok(fs.existsSync(path.join(ROOT, feature.path)), `feature path missing on disk: ${feature.path}`);
  }
  for (const [skill, value] of Object.entries(data.skills)) {
    assert.ok(typeof value === 'number' && value >= 0 && value <= 100, `skill out of range: ${skill}=${value}`);
  }
  assert.ok(data.contact.email && data.contact.github, 'contact block incomplete');
});

test('no blocking dialogs (alert/confirm/prompt) in shipped JS', () => {
  const shipped = files.filter((f) => /^js[\\/]/.test(path.relative(ROOT, f)) && f.endsWith('.js'));
  for (const f of shipped) {
    const src = fs.readFileSync(f, 'utf8');
    assert.ok(!/\b(alert|confirm|prompt)\s*\(/.test(src), `${path.relative(ROOT, f)} uses a blocking dialog`);
  }
});
