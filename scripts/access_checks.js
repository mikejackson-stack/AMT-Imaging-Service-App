#!/usr/bin/env node
/**
 * Access-control checks: rules match ACCESS_CONFIG, no shipped PINs or hashes,
 * and a PIN session cannot write.
 * Run: node scripts/access_checks.js
 */
'use strict';
const fs = require('fs');
const path = require('path');
const { loadAccessConfig, renderRules } = require('./gen-firestore-rules');

const ROOT = path.join(__dirname, '..');
const EXPECTED_WRITERS = [
  'antonio@amtimagingsolutions.com',
  'tito@amtimagingsolutions.com',
  'mike.jackson@amtimagingsolutions.com',
  'misemilyoliveros@icloud.com',
  'mjackson212@gmail.com'
];

function fail(msg) {
  console.error('FAIL:', msg);
  process.exitCode = 1;
}
function ok(msg) { console.log('OK  ', msg); }
function assert(cond, msg) {
  if (!cond) fail(msg);
  else ok(msg);
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

function extractFunction(src, name) {
  const re = new RegExp('(?:async\\s+)?function\\s+' + name + '\\s*\\(');
  const m = re.exec(src);
  if (!m) throw new Error('missing function ' + name);
  const brace = src.indexOf('{', m.index);
  return src.slice(m.index, brace) + extractBalanced(src, brace);
}

function largestScript(html) {
  const re = /<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi;
  let best = '';
  let m;
  while ((m = re.exec(html))) {
    if (m[1].length > best.length) best = m[1];
  }
  return best;
}

function walk(dir, out) {
  const skip = new Set(['Manuals', 'node_modules', '.git']);
  for (const name of fs.readdirSync(dir)) {
    if (skip.has(name)) continue;
    const p = path.join(dir, name);
    let st;
    try { st = fs.statSync(p); } catch (e) { continue; }
    if (st.isDirectory()) walk(p, out);
    else if (/\.(html|js|mjs|py|md|json|yml|yaml|txt|sh|rules)$/i.test(name) && st.size < 8e6) out.push(p);
  }
}

const cfg = loadAccessConfig();
assert(JSON.stringify(cfg.WRITERS) === JSON.stringify(EXPECTED_WRITERS), 'WRITERS are the five staff emails, lowercase');
assert(Array.isArray(cfg.READERS) && cfg.READERS.length === 0, 'READERS is empty');
assert(cfg.PIN_ITERATIONS >= 100000, 'PIN_ITERATIONS is at least 100000');
cfg.STAFF.forEach(staff => {
  staff.emails.forEach(email => {
    const listed = cfg.WRITERS.includes(email) || cfg.READERS.includes(email);
    assert(listed, staff.id + ' email ' + email + ' is on WRITERS or READERS');
  });
});

const rulesPath = path.join(ROOT, 'firestore.rules');
const rules = fs.readFileSync(rulesPath, 'utf8');
const generated = renderRules(cfg);
assert(rules === generated, 'firestore.rules matches access-config.js');
assert(rules.includes('request.auth.token.email.lower()'), 'rules lowercase the email');
assert(rules.includes('email_verified == true'), 'rules require a verified email');
assert(/allow read, write: if false;/.test(rules), 'rules default deny');
assert(rules.includes('match /pinHashes/{staffId}'), 'pinHashes is a writer-only collection');
EXPECTED_WRITERS.forEach(email => assert(rules.includes("'" + email + "'"), 'rules include ' + email));

const firebaseJson = JSON.parse(fs.readFileSync(path.join(ROOT, 'firebase.json'), 'utf8'));
assert(firebaseJson.firestore && firebaseJson.firestore.rules === 'firestore.rules', 'firebase.json points at firestore.rules');
assert(!firebaseJson.database && !firebaseJson.storage, 'firebase.json does not publish unused database or storage rules');
assert(!fs.existsSync(path.join(ROOT, 'database.rules.json')), 'no Realtime Database rules file');
assert(!fs.existsSync(path.join(ROOT, 'storage.rules')), 'no Storage rules file');

const guard = fs.readFileSync(path.join(ROOT, 'functions', 'query-guard.js'), 'utf8');
EXPECTED_WRITERS.forEach(email => assert(guard.includes("'" + email + "'"), 'askGrok allow-list includes ' + email));

const pages = fs.readFileSync(path.join(ROOT, '.github', 'workflows', 'pages.yml'), 'utf8');
const serve = fs.readFileSync(path.join(ROOT, 'scripts', 'serve.py'), 'utf8');
assert(pages.includes('access-config.js'), 'Pages deploy publishes access-config.js');
assert(serve.includes('access-config.js'), 'local server publishes access-config.js');

const sw = fs.readFileSync(path.join(ROOT, 'sw.js'), 'utf8');
assert(/const CACHE = 'amt-v45'/.test(sw), 'sw.js cache name is amt-v45');
assert(sw.includes('access-config.js'), 'service worker caches access-config.js');

const appFiles = ['index.html', 'AMT-Imaging-App-standalone.html'].map(name => path.join(ROOT, name));
const scripts = appFiles.map(file => largestScript(fs.readFileSync(file, 'utf8')));
['sendEmailLink', 'saveStaffPin', 'isPinSession', 'pbkdf2Pin', 'handleAuthedUser', 'signOutFirebaseAuth', 'syncViewOnlyLayout', 'myOwnerKey', 'isAdminOwner', 'visibleOwnerData'].forEach(name => {
  const bodies = scripts.map(src => extractFunction(src, name));
  assert(bodies[0] === bodies[1], name + ' matches in index.html and the standalone file');
});
scripts.forEach((src, i) => {
  const base = path.basename(appFiles[i]);
  assert(fs.readFileSync(appFiles[i], 'utf8').includes('src="access-config.js"'), base + ' loads access-config.js');
  assert(extractFunction(src, 'cloudPush').includes('isPinSession()'), base + ' cloudPush refuses a PIN session');
  assert(extractFunction(src, 'writeGuard').includes("method==='PIN'") || extractFunction(src, 'writeGuard').includes('isPinSession()'), base + ' writeGuard refuses a PIN session');
  assert(extractFunction(src, 'logout').includes('signOutFirebaseAuth()'), base + ' logout still signs out of Firebase');
  const html = fs.readFileSync(appFiles[i], 'utf8');
  assert(html.includes('view-only-open'), base + ' keeps the view-only banner below the top bar');
  const savePin = extractFunction(src, 'saveStaffPin');
  const mismatchAt = savePin.indexOf('The two entries do not match.');
  const hostedAt = savePin.indexOf('Sign in on the hosted app before saving a PIN.');
  assert(mismatchAt > 0 && hostedAt > mismatchAt, base + ' checks the PIN entries before requiring the hosted app');
  const submit = extractFunction(src, 'submitPin');
  const cacheAt = submit.indexOf('A writer must sign in once on this device before PIN unlock works.');
  const formatAt = submit.indexOf('Enter the PIN set for that name.');
  assert(cacheAt > 0 && formatAt > cacheAt, base + ' explains a missing PIN cache before a format error');
});

const pinLiteral = /(?:\bpin\b|\bPIN\b)[^\n]{0,80}['"]\d{4,6}['"]|['"]\d{4,6}['"][^\n]{0,80}(?:\bpin\b|\bPIN\b)|sha256\(\s*['"]\d{4,6}_amt_salt_|(michael|antonio|candelario|emily)\s*:\s*['"][a-f0-9]{64}['"]/i;
const files = [];
walk(ROOT, files);
let secrets = 0;
files.forEach(file => {
  const rel = path.relative(ROOT, file);
  const text = fs.readFileSync(file, 'utf8');
  if (text.includes('PIN_HASHES' + '_DEFAULT')) {
    secrets++;
    fail('shipped PIN hash table in ' + rel);
  }
  if (rel.endsWith('.html') && text.includes('_amt_salt_')) {
    secrets++;
    fail('old PIN salt scheme in ' + rel);
  }
  const lines = text.split(/\n/);
  lines.forEach((line, idx) => {
    if (line.includes('\\d')) return;
    if (pinLiteral.test(line)) {
      secrets++;
      fail('PIN literal or hash in ' + rel + ':' + (idx + 1));
    }
  });
});
assert(secrets === 0, 'no shipped PIN hash table, PIN literals, or staff PIN hashes in the tree');

function runPinGuards(src) {
  const cloudPush = extractFunction(src, 'cloudPush');
  const writeGuard = extractFunction(src, 'writeGuard');
  const isPinSession = extractFunction(src, 'isPinSession');
  const isViewOnly = extractFunction(src, 'isViewOnly');
  const isWriterSession = extractFunction(src, 'isWriterSession');
  const accessRole = extractFunction(src, 'accessRole');
  const notePinFailure = extractFunction(src, 'notePinFailure');
  const readPinLock = extractFunction(src, 'readPinLock');
  const writePinLock = extractFunction(src, 'writePinLock');
  const clearPinLock = extractFunction(src, 'clearPinLock');
  const pinAttemptsLeft = extractFunction(src, 'pinAttemptsLeft');
  const script = `
    const ACCESS_CONFIG = ${JSON.stringify({
      WRITERS: cfg.WRITERS,
      READERS: cfg.READERS,
      PIN_ITERATIONS: cfg.PIN_ITERATIONS,
      PIN_CACHE_KEY: cfg.PIN_CACHE_KEY,
      PIN_LOCK_KEY: cfg.PIN_LOCK_KEY,
      PIN_MAX_FAILS: cfg.PIN_MAX_FAILS,
      PIN_LOCK_BASE_MS: cfg.PIN_LOCK_BASE_MS
    })};
    const store = {};
    const localStorage = {
      getItem(k){ return Object.prototype.hasOwnProperty.call(store, k) ? store[k] : null; },
      setItem(k,v){ store[k] = String(v); },
      removeItem(k){ delete store[k]; }
    };
    let currentUser = null;
    let fbReady = true;
    let pushed = [];
    const fbAuth = { currentUser: { email: 'mike.jackson@amtimagingsolutions.com', emailVerified: true } };
    function chain(){
      return {
        collection(){ return chain(); },
        doc(){ return chain(); },
        set(data){ pushed.push(data); return Promise.resolve(); }
      };
    }
    const fbDb = { collection(){ return chain(); } };
    const firebase = { firestore: { FieldValue: { serverTimestamp(){ return 'ts'; } } } };
    const CLOUD_COLLECTIONS = { jobs: { get(){ return [{ id: 'j1' }]; } } };
    function alert(){}
    ${accessRole}
    ${isPinSession}
    ${isViewOnly}
    ${isWriterSession}
    ${cloudPush}
    ${writeGuard}
    ${readPinLock}
    ${writePinLock}
    ${notePinFailure}
    ${clearPinLock}
    ${pinAttemptsLeft}
    const role = accessRole('MJackson212@gmail.com');
    currentUser = { name: 'Antonio Jackson', method: 'PIN', viewOnly: false, role: 'writer' };
    const pinWrite = writeGuard('Save Job');
    cloudPush('jobs');
    const pinPushes = pushed.length;
    currentUser = { name: 'Michael Jackson', method: 'Google', viewOnly: false, role: 'writer', email: 'mike.jackson@amtimagingsolutions.com' };
    const writerWrite = writeGuard('Save Job');
    cloudPush('jobs');
    const writerPushes = pushed.length;
    currentUser = { name: 'Reader', method: 'Google', viewOnly: true, role: 'reader' };
    cloudPush('jobs');
    const readerPushes = pushed.length;
    clearPinLock();
    let lock = null;
    for (let i = 0; i < 5; i++) lock = notePinFailure(1_000_000);
    const firstLock = lock.lockUntil - 1_000_000;
    const leftAfter = pinAttemptsLeft(lock, 1_000_000);
    lock = notePinFailure(lock.lockUntil + 1);
    for (let i = 1; i < 5; i++) lock = notePinFailure(lock.lockUntil + 1);
    const secondLock = lock.lockUntil - (lock.lockUntil);
    return { role, pinWrite, pinPushes, writerWrite, writerPushes, readerPushes, firstLock, leftAfter, multiplier: lock.multiplier, secondUntil: lock.lockUntil };
  `;
  return new Function(script)();
}

const guardResult = runPinGuards(scripts[0]);
assert(guardResult.role === 'writer', 'accessRole compares emails without case');
assert(guardResult.pinWrite === false, 'a PIN session cannot pass writeGuard, even if viewOnly was forced false');
assert(guardResult.pinPushes === 0, 'a PIN session cannot cloudPush while a Firebase user is still signed in');
assert(guardResult.writerWrite === true && guardResult.writerPushes === 1, 'a writer session can write');
assert(guardResult.readerPushes === 1, 'a reader session does not add a cloud write');
assert(guardResult.firstLock === cfg.PIN_LOCK_BASE_MS, 'five wrong PINs lock the device for 15 minutes');
assert(guardResult.leftAfter === 0, 'a locked device shows no attempts left');
assert(guardResult.multiplier === 4, 'the next lock doubles, then the following failure cycle doubles again');

const second = runPinGuards(scripts[1]);
assert(second.pinPushes === 0 && second.pinWrite === false, 'standalone PIN session cannot write');

if (!process.exitCode) console.log('\nAccess checks passed.');
process.exit(process.exitCode || 0);
