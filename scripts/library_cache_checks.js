#!/usr/bin/env node
/**
 * Manuals folder-list fallback when GitHub rate-limits the contents API,
 * and the GE service library staying out of Cache Storage.
 * Run: node scripts/library_cache_checks.js
 */
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const net = require('net');
const { spawn } = require('child_process');

const ROOT = path.join(__dirname, '..');
const ART = '/opt/cursor/artifacts';
const LIBRARY_RE = /\/kb\/ge-(?:loose|signa|error-tool)-kb\.json(?:$|\?)/;

function ok(msg) { console.log('OK  ', msg); }
function assert(cond, msg) {
  if (!cond) throw new Error(msg);
  ok(msg);
}

function extractFunction(src, name) {
  const re = new RegExp('(?:async\\s+)?function\\s+' + name + '\\s*\\(');
  const m = re.exec(src);
  if (!m) return '';
  const open = src.indexOf('{', m.index);
  let depth = 0, inStr = null, escape = false;
  for (let i = open; i < src.length; i++) {
    const ch = src[i];
    if (inStr) {
      if (escape) { escape = false; continue; }
      if (ch === '\\') { escape = true; continue; }
      if (ch === inStr) inStr = null;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === '`') { inStr = ch; continue; }
    if (ch === '{') depth++;
    else if (ch === '}') {
      depth--;
      if (depth === 0) return src.slice(m.index, i + 1);
    }
  }
  return '';
}

function staticChecks() {
  const index = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  const stand = fs.readFileSync(path.join(ROOT, 'AMT-Imaging-App-standalone.html'), 'utf8');
  const sw = fs.readFileSync(path.join(ROOT, 'sw.js'), 'utf8');
  assert(/const CACHE = 'amt-v51'/.test(sw), 'sw.js cache name is amt-v51');
  assert(sw.includes("'/kb/ge-loose-kb.json'") && sw.includes("'/kb/ge-signa-kb.json'") && sw.includes("'/kb/ge-error-tool-kb.json'"),
    'sw.js names the three library JSON files');
  assert(/if\(isLibraryKbUrl\(url\)\) return;/.test(sw) && /purgeLibraryKbCaches\(/.test(sw),
    'sw.js skips those files in fetch and purges them on activate');
  ['loadExplorer', 'showExplorerCached', 'showExplorerRateNote', 'ghLimitDetails', 'refreshExplorer'].forEach(name => {
    const a = extractFunction(index, name);
    const b = extractFunction(stand, name);
    assert(a && a === b, name + ' matches in index.html and the standalone file');
  });
  assert(index.includes('const EXPLORER_FRESH_MS = 10 * 60 * 1000') && stand.includes('const EXPLORER_FRESH_MS = 10 * 60 * 1000'),
    'a folder fetched in the last 10 minutes is not requested again');
  assert(index.includes("note.id = 'explorerCacheNote'") && index.includes("note.id = 'explorerRateNote'")
    && stand.includes("note.id = 'explorerCacheNote'") && stand.includes("note.id = 'explorerRateNote'"),
    'cached listings and the rate-limit note are marked in both app files');
  ['showExplorerCached', 'showExplorerRateNote', 'showExplorerOfflineNote'].forEach(name => {
    [['index.html', index], ['standalone', stand]].forEach(([label, src]) => {
      const fn = extractFunction(src, name) || '';
      const m = fn.match(/note\.style\.fontSize = '(\d+(?:\.\d+)?)px'/);
      assert(m && Number(m[1]) >= 14, name + ' note is at least 14px in ' + label + ' (got ' + (m ? m[1] + 'px' : 'none') + ')');
    });
  });
}

function freePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const port = server.address().port;
      server.close(() => resolve(port));
    });
  });
}

function startServer(port) {
  return new Promise((resolve, reject) => {
    const child = spawn('python3', [path.join(ROOT, 'scripts', 'serve.py'), '--bind', '127.0.0.1', '--port', String(port)], {
      cwd: ROOT,
      stdio: ['ignore', 'pipe', 'pipe']
    });
    let buf = '';
    const onData = chunk => {
      buf += chunk.toString();
      if (buf.includes('http://127.0.0.1:' + port)) resolve(child);
    };
    child.stdout.on('data', onData);
    child.stderr.on('data', onData);
    child.once('exit', code => reject(new Error('serve.py exited ' + code + '\n' + buf)));
  });
}

function killTree(pid) {
  let kids = '';
  try { kids = fs.readFileSync('/proc/' + pid + '/task/' + pid + '/children', 'utf8'); } catch (e) { kids = ''; }
  kids.trim().split(/\s+/).filter(Boolean).forEach(k => killTree(Number(k)));
  try { process.kill(pid, 'SIGKILL'); } catch (e) {}
}

async function bootWriter(page) {
  await page.evaluate(() => {
    doLogin('Michael Jackson', 'Google', false, { role: 'writer', email: 'mike.jackson@amtimagingsolutions.com' });
  });
  await page.waitForFunction(() => {
    const u = (typeof currentUser !== 'undefined' && currentUser) || {};
    return u.method === 'Google' && u.role === 'writer' && document.getElementById('mainApp') && document.getElementById('mainApp').style.display !== 'none';
  });
}

async function pollUntil(fn, timeout, label) {
  const start = Date.now();
  let last;
  while (Date.now() - start < timeout) {
    last = await fn();
    if (last === true) return;
    await new Promise(resolve => setTimeout(resolve, 250));
  }
  throw new Error(label + ': ' + JSON.stringify(last));
}

async function cacheSnapshot(page) {
  return page.evaluate(async () => {
    const names = await caches.keys();
    const urls = [];
    for (const name of names) {
      const cache = await caches.open(name);
      const reqs = await cache.keys();
      reqs.forEach(req => urls.push(name + ' ' + req.url));
    }
    const controlled = !!(navigator.serviceWorker && navigator.serviceWorker.controller);
    return { names: names, urls: urls, controlled: controlled };
  });
}

async function main() {
  staticChecks();
  let playwright;
  try { playwright = require('playwright'); }
  catch (e) { throw new Error('Playwright is not installed (' + e.message + ')'); }

  fs.mkdirSync(ART, { recursive: true });
  const port = await freePort();
  const server = await startServer(port);
  const origin = 'http://127.0.0.1:' + port;
  const resetSec = Math.floor(Date.now() / 1000) + 45 * 60;
  let ghHits = 0;
  let browser = null;
  try {
    const chrome = process.env.CHROME_PATH || '/usr/bin/google-chrome';
    const launchOpts = {
      headless: true,
      args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu']
    };
    if (fs.existsSync(chrome)) launchOpts.executablePath = chrome;
    browser = await playwright.chromium.launch(launchOpts);
    const context = await browser.newContext({ viewport: { width: 1100, height: 900 } });
    await context.addInitScript(() => {
      window.__amtHoldAuth = true;
      const realRegister = navigator.serviceWorker.register.bind(navigator.serviceWorker);
      window.__amtRealSwRegister = realRegister;
      navigator.serviceWorker.register = function() {
        if (window.__amtAllowSw) return realRegister('./sw.js');
        return Promise.resolve({});
      };
      const timer = setInterval(() => {
        if (typeof handleAuthedUser !== 'function' || handleAuthedUser.__held) return;
        const orig = handleAuthedUser;
        function held(user) {
          if (!user && window.__amtHoldAuth) return;
          return orig.apply(this, arguments);
        }
        held.__held = true;
        handleAuthedUser = held;
        clearInterval(timer);
      }, 0);
    });
    await context.route('https://api.github.com/**', route => {
      ghHits += 1;
      return route.fulfill({
        status: 403,
        contentType: 'application/json',
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Expose-Headers': 'X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset, Retry-After',
          'X-RateLimit-Limit': '60',
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(resetSec)
        },
        body: JSON.stringify({ message: 'API rate limit exceeded for this IP' })
      });
    });
    const page = context.pages()[0] || await context.newPage();
    page.setDefaultTimeout(30000);
    page.on('dialog', dialog => dialog.dismiss());
    page.on('pageerror', err => console.log('PAGEERROR', err && err.message ? err.message : err));

    await page.goto(origin + '/', { waitUntil: 'domcontentloaded', timeout: 180000 });
    await page.waitForFunction(() => typeof loadExplorer === 'function' && typeof kbSearch === 'function');
    await bootWriter(page);
    await page.evaluate(() => { window.initManuals = function(){}; });

    const freshHits = ghHits;
    const fresh = await page.evaluate(async () => {
      const ts = Date.now();
      explorerCache = { '': { ts: ts, data: [{ name: 'FreshCachedFolder', type: 'dir' }] } };
      saveExplorerCache(explorerCache);
      await loadExplorer('');
      const grid = document.getElementById('explorerGrid');
      return {
        text: grid ? grid.textContent : '',
        note: !!document.getElementById('explorerCacheNote'),
        ts: ts
      };
    });
    assert(ghHits === freshHits, 'a folder fetched in the last 10 minutes does not call GitHub');
    assert(fresh.text.includes('FreshCachedFolder'), 'fresh cache renders the saved folder');
    ok('10-minute cache skips the contents API');

    const staleTs = Date.now() - 15 * 60 * 1000;
    const beforeStale = ghHits;
    const stale = await page.evaluate(async (ts) => {
      explorerCache = { '': { ts: ts, data: [{ name: 'CachedRateLimitFolder', type: 'dir' }] } };
      saveExplorerCache(explorerCache);
      await loadExplorer('');
      const note = document.getElementById('explorerCacheNote');
      const grid = document.getElementById('explorerGrid');
      return {
        hitsNote: !!(note && note.textContent),
        fontPx: note ? parseFloat(getComputedStyle(note).fontSize) : 0,
        note: note ? note.textContent : '',
        expected: new Date(ts).toLocaleString(),
        grid: grid ? grid.textContent : '',
        rate: !!document.getElementById('explorerRateNote')
      };
    }, staleTs);
    assert(ghHits > beforeStale, 'a stale folder still asks GitHub');
    assert(stale.grid.includes('CachedRateLimitFolder'), 'mocked 403 shows the cached folder list');
    assert(/cached/i.test(stale.note) && stale.note.includes(stale.expected) && !stale.rate,
      'cached listing notes when it was last refreshed: ' + stale.note);
    assert(stale.fontPx >= 14, 'cached-list note renders at 14px or larger (got ' + stale.fontPx + 'px)');
    await page.evaluate(() => { showTab('manuals'); setKBTab('files'); });
    await page.locator('#explorerCacheNote').screenshot({ path: path.join(ART, 'explorer-cached-403.png') });
    ok('403 falls back to the cached folder list');

    const empty = await page.evaluate(async (reset) => {
      explorerCache = {};
      saveExplorerCache({});
      await loadExplorer('');
      const note = document.getElementById('explorerRateNote');
      const grid = document.getElementById('explorerGrid');
      return {
        text: note ? note.textContent : '',
        reset: note ? note.getAttribute('data-reset') : '',
        remaining: note ? note.getAttribute('data-remaining') : '',
        fontPx: note ? parseFloat(getComputedStyle(note).fontSize) : 0,
        expected: new Date(Number(reset) * 1000).toLocaleString(),
        grid: grid ? grid.textContent : '',
        cacheNote: !!document.getElementById('explorerCacheNote')
      };
    }, resetSec);
    assert(!empty.cacheNote && !empty.grid.includes('CachedRateLimitFolder'), 'no-cache 403 does not invent a folder list');
    assert(empty.fontPx >= 14, 'rate-limit note renders at 14px or larger (got ' + empty.fontPx + 'px)');
    assert(empty.remaining === '0' && empty.reset === String(resetSec),
      'no-cache message reads X-RateLimit-Remaining and Reset (remaining=' + empty.remaining + ', reset=' + empty.reset + ')');
    assert(empty.text.includes(empty.expected) && /limiting folder lists/i.test(empty.text) && empty.text.trim().length > 40,
      'no-cache message includes the reset time: ' + empty.text);
    await page.locator('#explorerRateNote').screenshot({ path: path.join(ART, 'explorer-rate-limit-nocache.png') });
    ok('403 with no cache shows the reset time');

    await page.evaluate(async () => {
      const lib = location.origin + '/kb/ge-error-tool-kb.json';
      await (await caches.open('amt-v47')).put(lib, new Response('old-library'));
      await (await caches.open('amt-v51')).put(lib, new Response('current-library'));
      window.__amtAllowSw = true;
      const reg = await window.__amtRealSwRegister('./sw.js');
      const worker = reg.installing || reg.waiting || reg.active;
      if (worker && worker.state !== 'activated') {
        await new Promise(resolve => {
          worker.addEventListener('statechange', function onState() {
            if (worker.state === 'activated' || worker.state === 'redundant') {
              worker.removeEventListener('statechange', onState);
              resolve();
            }
          });
        });
      }
    });
    await pollUntil(async () => {
      const snap = await cacheSnapshot(page);
      const library = snap.urls.filter(u => LIBRARY_RE.test(u));
      if (snap.names.indexOf('amt-v47') !== -1) return { names: snap.names, library: library };
      if (snap.names.indexOf('amt-v51') === -1) return { names: snap.names, library: library };
      if (library.length) return { names: snap.names, library: library };
      if (!snap.controlled) return { names: snap.names, library: library, controlled: false };
      return true;
    }, 20000, 'activate did not drop cached library JSON');
    ok('activate removed cached library JSON from the old and current caches');

    const controlled = await page.evaluate(() => !!(navigator.serviceWorker && navigator.serviceWorker.controller));
    if (!controlled) {
      await page.reload({ waitUntil: 'domcontentloaded', timeout: 180000 });
      await page.waitForFunction(() => typeof kbSearch === 'function');
      await bootWriter(page);
    }
    await page.evaluate(() => { showTab('manuals'); kbSearch('2247373'); });
    await page.waitForFunction(() => {
      const el = document.getElementById('errResults');
      const text = el ? el.textContent : '';
      return text.indexOf('2247373') !== -1 && text.indexOf('UTNS') !== -1;
    }, null, { timeout: 180000 });
    await pollUntil(() => page.evaluate(() => new Promise(resolve => {
      let req;
      try { req = indexedDB.open('amt-ge-loose'); }
      catch (e) { resolve(false); return; }
      req.onerror = () => resolve(false);
      req.onsuccess = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains('kv')) { resolve(false); return; }
        const g = db.transaction('kv', 'readonly').objectStore('kv').get('errtool');
        g.onsuccess = () => resolve(!!(g.result && String(g.result.text).indexOf('ge_errtool_2247373') !== -1));
        g.onerror = () => resolve(false);
      };
    })), 180000, 'IndexedDB did not store the Error Message Tool library');
    await page.evaluate(() => fetch('./rates.json').then(r => r.text()));
    const onlineCaches = await cacheSnapshot(page);
    const libraryUrls = onlineCaches.urls.filter(u => LIBRARY_RE.test(u));
    assert(onlineCaches.controlled, 'search ran while the service worker controlled the page');
    assert(onlineCaches.urls.some(u => /rates\.json/.test(u)), 'other same-origin GETs are still cached: ' + onlineCaches.urls.join(' | '));
    assert(libraryUrls.length === 0, 'Cache Storage has no library KB entries after a search: ' + libraryUrls.join(' | '));
    ok('library JSON stayed out of Cache Storage');

    await context.setOffline(true);
    await page.reload({ waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForFunction(() => typeof kbSearch === 'function', null, { timeout: 30000 });
    await page.evaluate(() => {
      if (!currentUser && typeof tryAutoLogin === 'function') tryAutoLogin();
      if (!currentUser) doLogin('Michael Jackson', 'Google', false, { role: 'writer', email: 'mike.jackson@amtimagingsolutions.com' });
      if (typeof showTab === 'function') showTab('manuals');
      kbSearch('2247373');
    });
    await page.waitForFunction(() => {
      const el = document.getElementById('errResults');
      const text = el ? el.textContent : '';
      return text.indexOf('2247373') !== -1 && text.indexOf('UTNS') !== -1;
    }, null, { timeout: 180000 });
    const offlineText = await page.evaluate(() => {
      const el = document.getElementById('errResults');
      return el ? el.textContent.slice(0, 400) : '';
    });
    assert(offlineText.includes('2247373') && offlineText.includes('UTNS'), 'offline search finds 2247373: ' + offlineText);
    await page.locator('#errResults').screenshot({ path: path.join(ART, 'offline-search-2247373.png') });
    ok('offline search still finds 2247373 from IndexedDB');
  } finally {
    if (browser) {
      try { await browser.close(); } catch (e) {}
    }
    killTree(server.pid);
  }
}

main().catch(err => {
  console.error('FAIL:', err && err.stack ? err.stack : String(err));
  process.exit(1);
});
