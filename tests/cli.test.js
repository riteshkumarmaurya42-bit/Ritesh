/**
 * CLI tests — verifies the non-interactive flags that make bin/ritesh-cli.js
 * scriptable and testable.
 */
'use strict';

const test = require('node:test');
const assert = require('node:assert');
const { spawnSync } = require('node:child_process');
const path = require('path');

const CLI = path.join(__dirname, '..', 'bin', 'ritesh-cli.js');
const pkg = require('../package.json');

function run(args) {
  return spawnSync(process.execPath, [CLI, ...args], { encoding: 'utf8', timeout: 15000 });
}

test('--version prints the package version', () => {
  const res = run(['--version']);
  assert.strictEqual(res.status, 0);
  assert.strictEqual(res.stdout.trim(), pkg.version);
});

test('--help documents available commands', () => {
  const res = run(['--help']);
  assert.strictEqual(res.status, 0);
  for (const cmd of ['about', 'skills', 'projects', 'contact', '--version', '--json']) {
    assert.ok(res.stdout.includes(cmd), `help output should mention "${cmd}"`);
  }
});

test('--json emits valid, complete profile data', () => {
  const res = run(['--json']);
  assert.strictEqual(res.status, 0);
  const data = JSON.parse(res.stdout);
  assert.ok(data.name && data.role && data.bio, 'profile fields missing');
  assert.ok(Array.isArray(data.stack) && data.stack.length > 0, 'stack missing');
  assert.ok(data.contact && data.contact.email && data.contact.github, 'contact missing');
});
