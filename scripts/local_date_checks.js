#!/usr/bin/env node
/**
 * Calendar dates must follow the device's local day, not UTC.
 * At 11:30 PM America/New_York, toISOString() is already the next day.
 * Run: node scripts/local_date_checks.js
 */
'use strict';
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.join(__dirname, '..');

function fail(msg) {
  console.error('FAIL:', msg);
  process.exit(1);
}
function ok(msg) { console.log('OK  ', msg); }

const files = ['index.html', 'AMT-Imaging-App-standalone.html'];
let fn = null;
files.forEach(name => {
  const html = fs.readFileSync(path.join(ROOT, name), 'utf8');
  if (/toISOString\(\)\.slice\(0,\s*10\)/.test(html)) {
    fail(name + ' still fills a date with toISOString().slice(0,10)');
  }
  const m = html.match(/function localISODate\(d\)\{\n  const dt=d\?new Date\(d\):new Date\(\);\n  const y=dt\.getFullYear\(\);\n  const m=String\(dt\.getMonth\(\)\+1\)\.padStart\(2,'0'\);\n  const day=String\(dt\.getDate\(\)\)\.padStart\(2,'0'\);\n  return y\+'-'\+m\+'-'\+day;\n\}/);
  if (!m) fail(name + ' localISODate must build YYYY-MM-DD from getFullYear, getMonth, and getDate');
  if (!fn) fn = m[0];
  else if (fn !== m[0]) fail('localISODate differs between index.html and the standalone file');
  if (!/d\.value=localISODate\(now\)/.test(html)) fail(name + ' bootApp does not default Service Date with localISODate');
  if (!/el\.value=localISODate\(now\)/.test(html)) fail(name + ' bootApp does not default invoice, expense, and distribution dates locally');
  if (!/function setPMDate\(\)\{const el=document\.getElementById\('pm_date'\);if\(el&&!el\.value\)el\.value=localISODate\(\);\}/.test(html)) {
    fail(name + ' PM checklist date is not the local day');
  }
  if (!/dueDt\.setDate\(dueDt\.getDate\(\)\+30\)/.test(html) || !/localISODate\(dueDt\)/.test(html)) {
    fail(name + ' invoice due date is not a local calendar offset');
  }
  if (!/inv\.paidDate=localISODate\(\)/.test(html)) fail(name + ' paid date is not local');
  if (!/if\(d && !d\.value\) d\.value = localISODate\(\)/.test(html)) fail(name + ' hold-harmless sign-off date is not local');
  if (!/if\(dateEl\) dateEl\.value = localISODate\(\)/.test(html)) fail(name + ' hold-harmless default date is not local');
  ok(name + ' defaults today from the local calendar');
});

const child = `
${fn}
const fixed = Date.parse('2026-09-30T03:30:00.000Z');
const Real = Date;
class FakeDate extends Real {
  constructor(...args) {
    if (args.length === 0) super(fixed);
    else super(...args);
  }
  static now() { return fixed; }
}
global.Date = FakeDate;
const probe = new Date();
const utc = probe.toISOString().slice(0, 10);
const local = probe.getFullYear() + '-' + String(probe.getMonth() + 1).padStart(2, '0') + '-' + String(probe.getDate()).padStart(2, '0');
if (probe.getTimezoneOffset() !== 240) {
  console.error('expected EDT (offset 240) at 11:30 PM America/New_York, got ' + probe.getTimezoneOffset());
  process.exit(2);
}
if (utc !== '2026-09-30') {
  console.error('UTC date should already be the next day, got ' + utc);
  process.exit(3);
}
if (local !== '2026-09-29') {
  console.error('local date should be 2026-09-29, got ' + local);
  process.exit(4);
}
const got = localISODate();
if (got !== '2026-09-29') {
  console.error('localISODate returned ' + got);
  process.exit(5);
}
const dueDt = new Date();
dueDt.setDate(dueDt.getDate() + 30);
const due = localISODate(dueDt);
const dueLocal = dueDt.getFullYear() + '-' + String(dueDt.getMonth() + 1).padStart(2, '0') + '-' + String(dueDt.getDate()).padStart(2, '0');
if (due !== dueLocal || due === utc) {
  console.error('due date ' + due + ' local ' + dueLocal);
  process.exit(6);
}
console.log(got);
`;

const r = spawnSync(process.execPath, ['-e', child], {
  env: Object.assign({}, process.env, { TZ: 'America/New_York' }),
  encoding: 'utf8'
});
if (r.status !== 0) {
  fail('11:30 PM America/New_York simulation\n' + (r.stderr || '') + (r.stdout || ''));
}
const printed = (r.stdout || '').trim();
if (printed !== '2026-09-29') fail('expected local date 2026-09-29 at 11:30 PM ET, got ' + printed);
ok('11:30 PM America/New_York yields local date 2026-09-29');
