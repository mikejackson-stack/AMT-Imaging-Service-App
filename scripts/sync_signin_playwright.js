#!/usr/bin/env node
/**
 * Sign-in must not replace a local unsynced job with the cloud list.
 * Firestore is stubbed. A request to a real Firebase backend fails the test.
 * Run: node scripts/sync_signin_playwright.js
 */
'use strict';
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const ROOT = path.join(__dirname, '..');
const ARTIFACTS = '/opt/cursor/artifacts';
const CHROME = process.env.CHROME_PATH || '/usr/bin/google-chrome';

const LOCAL_JOB = {
  id: 'job-unsynced',
  site: 'Offline Magnet Site',
  type: 'Repair',
  status: 'Scheduled',
  date: '2026-09-28',
  created: '2026-09-28T15:00:00.000Z',
  updatedAt: '2026-09-28T15:00:00.000Z',
  updated: '2026-09-28T15:00:00.000Z',
  updatedBy: 'mike.jackson@amtimagingsolutions.com',
  notes: 'Entered offline before sign-in'
};

const FIREBASE_STUB = `
(function () {
  if (window.__amtFirebaseStub) return;
  window.__amtFirebaseStub = true;
  window.__amtCloudWrites = [];
  var USER = {
    email: 'mike.jackson@amtimagingsolutions.com',
    emailVerified: true,
    providerData: [{ providerId: 'google.com' }]
  };
  var CLOUD_JOB = {
    id: 'cloud-only',
    site: 'Cloud Only Site',
    type: 'Repair',
    status: 'Scheduled',
    date: '2020-01-01',
    updatedAt: '2020-01-01T00:00:00.000Z'
  };
  function snap(id, data) {
    return {
      exists: data != null,
      id: id,
      data: function () { return data || {}; },
      forEach: function () {}
    };
  }
  function dataFor(docPath) {
    var id = String(docPath || '').split('/').pop();
    if (id === 'jobs') return snap(id, { items: [CLOUD_JOB] });
    return snap(id, null);
  }
  function refFor(docPath) {
    var ref = {
      id: String(docPath).split('/').pop(),
      path: docPath,
      collection: function (name) { return collFor(docPath + '/' + name); },
      get: function () { return Promise.resolve(dataFor(docPath)); },
      set: function (body) {
        window.__amtCloudWrites.push({ path: docPath, body: body });
        return Promise.resolve();
      },
      onSnapshot: function (cb) {
        setTimeout(function () { try { cb(dataFor(docPath)); } catch (e) { console.error(e); } }, 0);
        return function () {};
      }
    };
    return ref;
  }
  function collFor(collPath) {
    return {
      doc: function (id) { return refFor(collPath + '/' + id); },
      get: function () {
        return Promise.resolve({ empty: true, docs: [], forEach: function () {} });
      }
    };
  }
  function functionsApi() {
    return {
      useEmulator: function () {},
      httpsCallable: function () {
        return function () { return Promise.resolve({ data: {} }); };
      }
    };
  }
  var db = {
    collection: function (name) { return collFor(name); },
    settings: function () {},
    enablePersistence: function () { return Promise.resolve(); },
    runTransaction: function (fn) {
      var tx = {
        get: function (ref) { return ref.get(); },
        set: function (ref, body) { ref.set(body); }
      };
      return Promise.resolve().then(function () { return fn(tx); });
    }
  };
  function auth() {
    return {
      currentUser: USER,
      onAuthStateChanged: function (cb) {
        setTimeout(function () { try { cb(USER); } catch (e) { console.error(e); } }, 0);
        return function () {};
      },
      signOut: function () { return Promise.resolve(); }
    };
  }
  var firebase = function () {};
  firebase.initializeApp = function () { return { functions: functionsApi }; };
  firebase.auth = auth;
  firebase.auth.GoogleAuthProvider = { credential: function () { return {}; } };
  firebase.firestore = function () { return db; };
  firebase.firestore.FieldValue = { serverTimestamp: function () { return { '.sv': 'timestamp' }; } };
  firebase.app = function () { return { functions: functionsApi }; };
  window.firebase = firebase;
})();
`;

const GIS_STUB = `
window.google = window.google || {};
window.google.accounts = window.google.accounts || {};
window.google.accounts.id = {
  initialize: function () {},
  renderButton: function () {},
  prompt: function () {}
};
`;

const LEAK_RE = /firestore\.googleapis\.com|firebaseio\.com|identitytoolkit|securetoken\.googleapis|firebaseinstallations/i;

function fail(msg) {
  console.error('FAIL:', msg);
  process.exitCode = 1;
}

function startServer() {
  return new Promise((resolve, reject) => {
    const port = 18080 + Math.floor(Math.random() * 2000);
    const child = spawn('python3', ['scripts/serve.py', '--port', String(port), '--bind', '127.0.0.1'], {
      cwd: ROOT,
      stdio: ['ignore', 'pipe', 'pipe']
    });
    let buf = '';
    let started = false;
    const timer = setTimeout(() => {
      child.kill();
      reject(new Error('dev server did not start: ' + buf));
    }, 20000);
    child.stdout.on('data', chunk => {
      buf += chunk.toString();
      if (!started && buf.includes('http://127.0.0.1:' + port)) {
        started = true;
        clearTimeout(timer);
        resolve({ child, url: 'http://127.0.0.1:' + port + '/' });
      }
    });
    child.stderr.on('data', chunk => { buf += chunk.toString(); });
    child.on('exit', code => {
      clearTimeout(timer);
      if (!started) reject(new Error('dev server exited ' + code + ': ' + buf));
    });
  });
}

async function main() {
  if (!fs.existsSync(CHROME)) {
    fail('Chrome not found at ' + CHROME);
    process.exit(process.exitCode || 1);
  }
  let playwright;
  try {
    playwright = require('playwright-core');
  } catch (e) {
    fail('playwright-core is not installed. check.sh installs it outside the repo.');
    process.exit(1);
  }
  fs.mkdirSync(ARTIFACTS, { recursive: true });
  const server = await startServer();
  const leaks = [];
  const pageErrors = [];
  let browser;
  try {
    browser = await playwright.chromium.launch({
      executablePath: CHROME,
      headless: true,
      args: ['--no-sandbox', '--disable-dev-shm-usage']
    });
    const context = await browser.newContext({
      viewport: { width: 1280, height: 800 },
      serviceWorkers: 'block'
    });
    const page = await context.newPage();
    page.setDefaultTimeout(30000);
    page.on('pageerror', err => pageErrors.push(String(err && err.message || err)));
    await page.route('**/*', route => {
      const url = route.request().url();
      let host = '';
      try { host = new URL(url).hostname; } catch (e) { host = ''; }
      if (host === '127.0.0.1' || host === 'localhost') return route.continue();
      if (LEAK_RE.test(url)) {
        leaks.push(url);
        return route.abort();
      }
      if (/gstatic\.com\/firebasejs\//.test(url)) {
        return route.fulfill({ status: 200, contentType: 'application/javascript', body: FIREBASE_STUB });
      }
      if (/accounts\.google\.com\/gsi\/client/.test(url)) {
        return route.fulfill({ status: 200, contentType: 'application/javascript', body: GIS_STUB });
      }
      if (/jspdf/.test(url)) {
        return route.fulfill({ status: 200, contentType: 'application/javascript', body: 'window.jspdf={jsPDF:function(){}};' });
      }
      return route.abort();
    });
    await page.addInitScript(job => {
      localStorage.setItem('amt_jobs_v29', JSON.stringify([job]));
      localStorage.setItem('amt_sync_pending_v47', JSON.stringify({ jobs: { 'job-unsynced': job.updatedAt } }));
    }, LOCAL_JOB);

    await page.goto(server.url, { waitUntil: 'domcontentloaded' });
    await page.locator('#mainApp').waitFor({ state: 'visible', timeout: 20000 });
    await page.locator('#recentJobsList').getByText('Offline Magnet Site').waitFor({ timeout: 20000 });
    await page.locator('#desktopNav [data-tab="jobs"]').click();
    await page.locator('#panel-jobs.active').waitFor({ timeout: 10000 });
    await page.locator('#jobList').getByText('Cloud Only Site').waitFor({ timeout: 20000 });
    await page.locator('#jobList').getByText('Offline Magnet Site').waitFor({ timeout: 5000 });
    const shot = path.join(ARTIFACTS, 'signin-keeps-unsynced-job.png');
    await page.screenshot({ path: shot, fullPage: false });
    await page.waitForFunction(() => {
      return (window.__amtCloudWrites || []).some(function (w) {
        return String(w.path || '').endsWith('/jobs') && w.body && Array.isArray(w.body.items) &&
          w.body.items.some(function (item) { return item && item.id === 'job-unsynced'; });
      });
    }, null, { timeout: 20000 });

    const report = await page.evaluate(() => {
      const jobs = JSON.parse(localStorage.getItem('amt_jobs_v29') || '[]');
      const writes = (window.__amtCloudWrites || []).filter(w => String(w.path || '').endsWith('/jobs'));
      const parts = (typeof partsDB !== 'undefined' && Array.isArray(partsDB)) ? partsDB : [];
      return {
        jobIds: jobs.map(j => j && j.id),
        unsynced: jobs.find(j => j && j.id === 'job-unsynced') || null,
        cloudOnly: jobs.some(j => j && j.id === 'cloud-only'),
        partsKey: localStorage.getItem('amt_parts_v30'),
        kbKey: localStorage.getItem('amt_kb_v29'),
        guidesKey: localStorage.getItem('amt_diagguides_v30'),
        hasPart: parts.some(p => p && (p.num === '2107246' || p.num === '2294300-16')),
        partCount: parts.length,
        writeCount: writes.length,
        userName: (document.getElementById('userName2') || {}).textContent || ''
      };
    });

    await page.locator('#desktopNav [data-tab="manuals"]').click();
    await page.getByText('GE LCC Magnet Rampdown Procedure', { exact: false }).first().waitFor({ timeout: 20000 });
    const guidesKeyAfter = await page.evaluate(() => localStorage.getItem('amt_diagguides_v30'));

    fs.writeFileSync(path.join(ARTIFACTS, 'signin-sync-report.json'), JSON.stringify({
      report: report,
      guidesKeyAfter: guidesKeyAfter,
      leaks: leaks,
      pageErrors: pageErrors
    }, null, 2));

    const unsyncedOk = report.unsynced && report.unsynced.site === 'Offline Magnet Site' &&
      report.unsynced.notes === 'Entered offline before sign-in';
    if (!unsyncedOk) fail('local unsynced job was dropped or overwritten: ' + JSON.stringify(report.unsynced));
    else console.log('OK   sign-in kept the local unsynced job');
    if (!report.cloudOnly) fail('cloud-only job was not merged in');
    else console.log('OK   sign-in merged the cloud-only job');
    if (report.partsKey !== null || report.kbKey !== null || guidesKeyAfter !== null) {
      fail('seed catalogs were written to localStorage: ' + JSON.stringify({
        parts: report.partsKey && report.partsKey.length,
        kb: report.kbKey && report.kbKey.length,
        guides: guidesKeyAfter && guidesKeyAfter.length
      }));
    } else console.log('OK   seed catalogs were not written to localStorage');
    if (!report.hasPart || report.partCount < 100) fail('built-in parts are not in memory (' + report.partCount + ')');
    else console.log('OK   built-in parts stay in memory (' + report.partCount + ')');
    if (!/Michael Jackson/.test(report.userName)) fail('expected the writer session, saw ' + report.userName);
    else console.log('OK   Google writer session signed in');
    if (leaks.length) fail('real Firebase traffic leaked: ' + leaks.join(', '));
    else console.log('OK   no real Firestore or Auth network writes');
    if (pageErrors.length) fail('page errors: ' + pageErrors.join(' | '));
    else console.log('OK   page produced no script errors');
    console.log('Screenshot:', shot);
  } finally {
    if (browser) await browser.close().catch(() => {});
    if (server && server.child && !server.child.killed) server.child.kill();
  }
  if (process.exitCode) process.exit(process.exitCode);
  console.log('\nSign-in sync check passed.');
}

main().catch(err => {
  console.error('FAIL:', err && err.stack || err);
  process.exit(1);
});
