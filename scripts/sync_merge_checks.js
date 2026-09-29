#!/usr/bin/env node
/**
 * Pure merge + seed-overlay checks for the AMT field app.
 * Run: node scripts/sync_merge_checks.js
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const FILES = ['index.html', 'AMT-Imaging-App-standalone.html'].map(name => path.join(ROOT, name));
const MIB = 1048576;

function fail(msg) {
  console.error('FAIL:', msg);
  process.exitCode = 1;
}
function assert(cond, msg) {
  if (!cond) fail(msg);
  else console.log('OK  ', msg);
}

function extractBalanced(src, startIdx) {
  const open = src[startIdx];
  const close = open === '{' ? '}' : open === '[' ? ']' : null;
  if (!close) throw new Error('expected [ or { at ' + startIdx);
  let depth = 0, inStr = null, escape = false;
  for (let i = startIdx; i < src.length; i++) {
    const ch = src[i];
    if (inStr) {
      if (escape) { escape = false; continue; }
      if (ch === '\\') { escape = true; continue; }
      if (ch === inStr) inStr = null;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === '`') { inStr = ch; continue; }
    if (ch === '/' && src[i + 1] === '/') {
      const nl = src.indexOf('\n', i);
      i = nl === -1 ? src.length : nl;
      continue;
    }
    if (ch === open) depth++;
    else if (ch === close) {
      depth--;
      if (depth === 0) return src.slice(startIdx, i + 1);
    }
  }
  throw new Error('unbalanced from ' + startIdx);
}

function largestScript(html) {
  let best = '';
  const re = /<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = re.exec(html))) {
    if (m[1].length > best.length) best = m[1];
  }
  return best;
}

function extractFunction(src, name) {
  const re = new RegExp('(?:async\\s+)?function\\s+' + name + '\\s*\\(');
  const m = re.exec(src);
  if (!m) throw new Error('missing function ' + name);
  const brace = src.indexOf('{', m.index);
  return src.slice(m.index, brace) + extractBalanced(src, brace);
}

function extractConst(src, name) {
  const re = new RegExp('(?:const|var|let)\\s+' + name + '\\s*=\\s*');
  const m = re.exec(src);
  if (!m) throw new Error('missing ' + name);
  return extractBalanced(src, m.index + m[0].length);
}

const htmls = FILES.map(file => fs.readFileSync(file, 'utf8'));
const srcs = htmls.map(largestScript);
const names = [
  'amtRecordTime', 'amtPendingIds', 'amtPurgeTombstones', 'mergeRecordLists',
  'amtFingerprint', 'amtAssignMissingIds', 'amtExtractOverlay', 'amtMergeSeedAndOverlay',
  'amtLoadSeedStore', 'amtWriteSeedOverlay'
];
names.forEach(name => {
  assert(extractFunction(srcs[0], name) === extractFunction(srcs[1], name), name + ' matches in both app files');
});

const prelude = [
  'const AMT_TOMBSTONE_MS = 30 * 24 * 60 * 60 * 1000;',
  'const AMT_KB_LS = "amt_kb_v29";',
  'const AMT_PARTS_LS = "amt_parts_v30";',
  'const AMT_GUIDE_LS = "amt_diagguides_v30";',
  names.map(name => extractFunction(srcs[0], name)).join('\n'),
  'const PARTS_SEED = ' + extractConst(srcs[0], 'PARTS_SEED') + ';',
  'const KB_SEED = ' + extractConst(srcs[0], 'KB_SEED') + ';',
  // Guides live in a later inline script, not the largest one.
  'const DIAG_GUIDES_SEED = ' + extractConst(htmls[0], 'DIAG_GUIDES_SEED') + ';'
].join('\n');

const rt = new Function(prelude + '\nreturn { mergeRecordLists, amtExtractOverlay, amtMergeSeedAndOverlay, amtLoadSeedStore, amtWriteSeedOverlay, amtPurgeTombstones, PARTS_SEED, KB_SEED, DIAG_GUIDES_SEED };')();

const NOW = Date.parse('2026-09-29T12:00:00.000Z');
function job(id, at, extra) {
  return Object.assign({ id: id, site: id, updatedAt: at, updatedBy: 'tech@amtimagingsolutions.com' }, extra || {});
}
function ids(list) {
  return list.map(r => r.id).sort().join(',');
}

const remoteNewer = rt.mergeRecordLists(
  [job('a', '2026-09-28T00:00:00.000Z', { site: 'local edit' })],
  [job('a', '2026-09-28T01:00:00.000Z', { site: 'remote edit' })],
  { now: NOW }
);
assert(remoteNewer.length === 1 && remoteNewer[0].site === 'remote edit', 'concurrent edit: newer remote updatedAt wins');

const localNewer = rt.mergeRecordLists(
  [job('a', '2026-09-28T02:00:00.000Z', { site: 'local edit' })],
  [job('a', '2026-09-28T01:00:00.000Z', { site: 'remote edit' })],
  { now: NOW }
);
assert(localNewer.length === 1 && localNewer[0].site === 'local edit', 'concurrent edit: newer local updatedAt wins');

const twoDevices = rt.mergeRecordLists(
  [job('device-a', '2026-09-28T00:00:00.000Z', { site: 'added on A' })],
  [job('device-b', '2026-09-28T00:00:00.000Z', { site: 'added on B' })],
  { now: NOW }
);
assert(ids(twoDevices) === 'device-a,device-b', 'offline adds on two devices are both kept');

const remoteTomb = rt.mergeRecordLists(
  [job('a', '2026-09-28T00:00:00.000Z', { site: 'live' })],
  [job('a', '2026-09-28T03:00:00.000Z', { deleted: true })],
  { now: NOW }
);
assert(remoteTomb.length === 1 && remoteTomb[0].deleted === true, 'a newer remote tombstone deletes the local record');

const localTomb = rt.mergeRecordLists(
  [job('a', '2026-09-28T03:00:00.000Z', { deleted: true })],
  [job('a', '2026-09-28T00:00:00.000Z', { site: 'live' })],
  { now: NOW }
);
assert(localTomb.length === 1 && localTomb[0].deleted === true, 'a newer local tombstone beats an older cloud copy');

const oldStamp = new Date(NOW - 31 * 24 * 60 * 60 * 1000).toISOString();
const purged = rt.mergeRecordLists([], [job('a', oldStamp, { deleted: true })], { now: NOW });
assert(purged.length === 0, 'tombstones older than 30 days are purged');

const freshStamp = new Date(NOW - 2 * 24 * 60 * 60 * 1000).toISOString();
const keptTomb = rt.mergeRecordLists([], [job('a', freshStamp, { deleted: true })], { now: NOW });
assert(keptTomb.length === 1 && keptTomb[0].deleted === true, 'a tombstone younger than 30 days is kept');

const liveOld = rt.mergeRecordLists([], [job('a', oldStamp, { site: 'still here' })], { now: NOW });
assert(liveOld.length === 1 && liveOld[0].site === 'still here', 'a live record is not purged just because it is old');

const pendingKept = rt.mergeRecordLists(
  [job('job-unsynced', '2026-09-28T15:00:00.000Z', { site: 'Offline Magnet Site', notes: 'local' })],
  [job('cloud-only', '2020-01-01T00:00:00.000Z', { site: 'Cloud Only Site' })],
  { now: NOW, pending: { 'job-unsynced': '2026-09-28T15:00:00.000Z' } }
);
assert(pendingKept.some(r => r.id === 'job-unsynced' && r.site === 'Offline Magnet Site'),
  'a stale cloud list does not drop a pending local record');
assert(pendingKept.some(r => r.id === 'cloud-only'), 'the merge still keeps the other cloud record');

const pendingStaleSameId = rt.mergeRecordLists(
  [job('job-unsynced', '2026-09-28T15:00:00.000Z', { notes: 'pending local' })],
  [job('job-unsynced', '2026-09-01T00:00:00.000Z', { notes: 'stale cloud' })],
  { now: NOW, pending: new Set(['job-unsynced']) }
);
assert(pendingStaleSameId.length === 1 && pendingStaleSameId[0].notes === 'pending local',
  'an older cloud copy does not overwrite a pending local record');

const pendingLosesToNewer = rt.mergeRecordLists(
  [job('a', '2026-09-28T00:00:00.000Z', { site: 'pending local' })],
  [job('a', '2026-09-28T05:00:00.000Z', { site: 'newer cloud' })],
  { now: NOW, pending: { a: '2026-09-28T00:00:00.000Z' } }
);
assert(pendingLosesToNewer[0].site === 'newer cloud', 'a newer cloud edit still wins over a pending local copy');

const srcLocal = [job('a', '2026-09-28T00:00:00.000Z')];
const srcRemote = [job('b', '2026-09-28T00:00:00.000Z')];
rt.mergeRecordLists(srcLocal, srcRemote, { now: NOW });
assert(srcLocal.length === 1 && srcRemote.length === 1 && !srcLocal[0].deleted, 'merge does not mutate the input lists');

function roundTrip(list) {
  return JSON.parse(JSON.stringify(list));
}

function assertCatalogOverlay(seed, label) {
  const full = rt.amtMergeSeedAndOverlay(seed, []);
  const overlay = rt.amtExtractOverlay(roundTrip(full), seed);
  assert(overlay.length === 0, label + ' seed copy migrates to an empty overlay (' + full.length + ' records)');
  const edited = Object.assign({}, full[0], { notes: 'USER-EDIT-' + label, updatedAt: '2026-09-28T00:00:00.000Z', updatedBy: 'tech@amtimagingsolutions.com' });
  const withEdit = full.map((rec, i) => i === 0 ? edited : rec);
  withEdit.push({ id: 'user_' + label, num: 'USER-1', desc: 'Added by tech', title: 'Added by tech', brand: 'GE', content: 'field note' });
  const extracted = rt.amtExtractOverlay(roundTrip(withEdit), seed);
  assert(extracted.length === 2, label + ' overlay keeps the edit and the user add');
  const back = rt.amtMergeSeedAndOverlay(seed, extracted);
  assert(back.length === full.length + 1, label + ' materialize keeps every seed plus the user add');
  const editedBack = back.find(rec => rec.id === edited.id);
  assert(editedBack && (editedBack.notes === edited.notes || editedBack.title === edited.title || editedBack.content), label + ' user edit survives materialize');
  const missing = rt.amtExtractOverlay(roundTrip(full.slice(1)), seed);
  assert(missing.length === 0, label + ' absence of a seed is not inferred as a deletion');
  const tombId = full[1] && full[1].id;
  const tombMerged = rt.amtMergeSeedAndOverlay(seed, [{ id: tombId, deleted: true, updatedAt: '2026-09-28T00:00:00.000Z' }]);
  assert(tombId && !tombMerged.some(rec => rec.id === tombId), label + ' deletion tombstone hides that seed record');
}

assertCatalogOverlay(rt.PARTS_SEED, 'parts');
assertCatalogOverlay(rt.KB_SEED, 'kb');
assertCatalogOverlay(rt.DIAG_GUIDES_SEED, 'guides');

function migrate(lsKey, seed) {
  const store = {};
  const localStorage = {
    getItem(k) { return Object.prototype.hasOwnProperty.call(store, k) ? store[k] : null; },
    setItem(k, v) { store[k] = String(v); },
    removeItem(k) { delete store[k]; }
  };
  const full = JSON.stringify(rt.amtMergeSeedAndOverlay(seed, []));
  store[lsKey] = full;
  const before = store[lsKey].length;
  const fn = new Function('localStorage', 'amtExtractOverlay', 'amtPurgeTombstones', 'amtWriteSeedOverlay', 'amtLoadSeedStore', 'seed',
    'return amtLoadSeedStore(lsKey, seed);');
  // amtLoadSeedStore closes over localStorage from its source scope, so eval it inside the fake.
  const body = [
    'const AMT_TOMBSTONE_MS = 30 * 24 * 60 * 60 * 1000;',
    extractFunction(srcs[0], 'amtPurgeTombstones'),
    extractFunction(srcs[0], 'amtRecordTime'),
    extractFunction(srcs[0], 'amtFingerprint'),
    extractFunction(srcs[0], 'amtAssignMissingIds'),
    extractFunction(srcs[0], 'amtExtractOverlay'),
    extractFunction(srcs[0], 'amtWriteSeedOverlay'),
    extractFunction(srcs[0], 'amtLoadSeedStore'),
    'const first = amtLoadSeedStore(' + JSON.stringify(lsKey) + ', seed);',
    'const afterFirst = localStorage.getItem(' + JSON.stringify(lsKey) + ');',
    'const second = amtLoadSeedStore(' + JSON.stringify(lsKey) + ', seed);',
    'const afterSecond = localStorage.getItem(' + JSON.stringify(lsKey) + ');',
    'return { first, second, afterFirst, afterSecond, before: ' + before + ' };'
  ].join('\n');
  return new Function('localStorage', 'seed', body)(localStorage, seed);
}

['amt_parts_v30', 'amt_kb_v29', 'amt_diagguides_v30'].forEach((key, i) => {
  const seed = [rt.PARTS_SEED, rt.KB_SEED, rt.DIAG_GUIDES_SEED][i];
  const result = migrate(key, seed);
  assert(result.first.length === 0 && result.second.length === 0, key + ' migration keeps no seed copies');
  assert(result.afterFirst === null && result.afterSecond === null, key + ' migration removes the stored catalog and does not rewrite it');
  assert(result.before > 1000, key + ' fixture was a real stored catalog (' + result.before + ' chars)');
});

function docBytes(items) {
  return Buffer.byteLength(JSON.stringify({
    items: items,
    updatedAt: 'server-timestamp',
    updatedBy: 'mike.jackson@amtimagingsolutions.com'
  }), 'utf8');
}
const partsItems = rt.amtMergeSeedAndOverlay(rt.PARTS_SEED, []);
const kbItems = rt.amtMergeSeedAndOverlay(rt.KB_SEED, []);
const guideItems = rt.amtMergeSeedAndOverlay(rt.DIAG_GUIDES_SEED, []);
const partsBytes = docBytes(partsItems);
const kbBytes = docBytes(kbItems);
const guideBytes = docBytes(guideItems);
function pct(n) { return (n / MIB * 100).toFixed(1) + '% of 1 MiB'; }
console.log('SIZE parts legacy cloud doc', partsBytes, 'bytes,', pct(partsBytes), '(' + partsItems.length + ' records)');
console.log('SIZE kb legacy cloud doc', kbBytes, 'bytes,', pct(kbBytes), '(' + kbItems.length + ' records)');
console.log('SIZE guides are local only', guideBytes, 'bytes,', pct(guideBytes), '(' + guideItems.length + ' records)');
assert(partsBytes < MIB && kbBytes < MIB, 'legacy full catalogs are still under the 1 MiB Firestore document limit');
const largest = Math.max(partsBytes, kbBytes);
console.log('SIZE largest cloud list if stored whole:', largest, 'bytes (' + pct(largest) + ')');

if (!process.exitCode) console.log('\nSync merge checks passed.');
process.exit(process.exitCode || 0);
