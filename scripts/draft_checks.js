#!/usr/bin/env node
/**
 * Autosave drafts survive a killed browser and restore from IndexedDB.
 * Simulates a writer the same way scripts/access_checks.js does (Google writer,
 * viewOnly false), then a PIN session that must not create drafts.
 * Run: node scripts/draft_checks.js
 */
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const net = require('net');
const { spawn } = require('child_process');

const ROOT = path.join(__dirname, '..');
const ART = process.env.AMT_ARTIFACTS_DIR || '/opt/cursor/artifacts';
const WRITER = {
  name: 'Michael Jackson',
  method: 'Google',
  viewOnly: false,
  role: 'writer',
  email: 'mike.jackson@amtimagingsolutions.com'
};

function fail(msg) {
  console.error('FAIL:', msg);
  process.exit(1);
}
function ok(msg) { console.log('OK  ', msg); }
function assert(cond, msg) {
  if (!cond) fail(msg);
  else ok(msg);
}

function engineSlice(html) {
  const i = html.indexOf('// AMT form drafts.');
  const j = html.indexOf('function updatePMProgress()', i);
  if (i < 0 || j < 0) return '';
  return html.slice(i, j);
}

function capabilitySlice(html) {
  const i = html.indexOf('id="capabilitySection"');
  const j = html.indexOf('id="holdHarmlessSection"', i);
  if (i < 0 || j < 0) return '';
  return html.slice(i, j);
}

function printCapabilitySlice(html) {
  const i = html.indexOf('function printCapability()');
  const j = html.indexOf('function printRates()', i);
  if (i < 0 || j < 0) return '';
  return html.slice(i, j);
}

function staticChecks() {
  const index = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  const stand = fs.readFileSync(path.join(ROOT, 'AMT-Imaging-App-standalone.html'), 'utf8');
  const sw = fs.readFileSync(path.join(ROOT, 'sw.js'), 'utf8');
  assert(/const CACHE = 'amt-v57'/.test(sw), 'sw.js cache name is amt-v57');
  assert(sw.includes('./AMT-Capability-Statement.pdf'), 'service worker precaches the capability PDF');
  const pages = fs.readFileSync(path.join(ROOT, '.github/workflows/pages.yml'), 'utf8');
  const serve = fs.readFileSync(path.join(ROOT, 'scripts/serve.py'), 'utf8');
  assert(pages.includes('AMT-Capability-Statement.pdf'), 'Pages deploy publishes the capability PDF');
  assert(serve.includes('AMT-Capability-Statement.pdf'), 'local server publishes the capability PDF');
  assert(capabilitySlice(index) && capabilitySlice(index) === capabilitySlice(stand), 'capability statement matches in both app files');
  const printed = printCapabilitySlice(index);
  assert(printed && printed === printCapabilitySlice(stand), 'printCapability matches in both app files');
  assert(printed.includes('window.print()') && printed.includes('size:letter'), 'printCapability still prints a letter-size sheet');
  [index, stand].forEach(html => {
    assert(html.includes("indexedDB.open('amtDrafts'"), 'opens IndexedDB amtDrafts');
    assert(html.includes("createObjectStore('drafts'"), 'creates the drafts store');
    assert(html.includes('Restore unsaved entry from '), 'restore prompt copy');
    assert(html.includes('amt_pm_draft_v32'), 'mentions the legacy PM draft key');
    assert(!html.includes("localStorage.setItem('amt_pm_draft_v32'"), 'does not write the legacy PM draft');
    assert(!html.includes('localStorage.setItem(PM_DRAFT_KEY'), 'does not write PM_DRAFT_KEY');
    assert(html.includes("addEventListener('pagehide'"), 'flushes drafts on pagehide');
    assert(html.includes('if(document.hidden)'), 'flushes drafts when the page is hidden');
    assert(html.includes('isWriterSession()'), 'drafts follow the writer session');
    assert(html.includes(', 1000)'), 'draft debounce is about one second');
    assert(html.includes('flushDraftKey(key)'), 'a job switch commits the draft key captured when typing started');
    assert(html.includes('draftKeyForModal'), 'closing a form flushes that form draft');
    assert(!html.includes('Manuals/amt_logo.png'), 'capability logo does not use the missing Manuals path');
    assert(html.includes('id="capabilityLogo"'), 'capability statement has a logo image');
    assert(html.includes("'capabilityLogo'"), 'capability logo uses the embedded logo');
    const cap = capabilitySlice(html);
    [
      'G8R8SNJJ66Z8',
      '20G67',
      '811219 (primary)',
      '811210',
      '07/29/2026',
      'Florida LLC',
      '25+ years of hands-on field service: founder has worked on MRI and CT systems since 1999',
      'Florida: Tito Juarez',
      'Texas &amp; Georgia: Antonio Jackson',
      'Engineering lead: Mike Jackson',
      'Other locations: case by case',
      'AMT was founded in April 2026',
      'Also SBA-certified VOSB &middot; Florida Certified VBE &middot; SAM.gov Active',
      'Florida Certified Veteran Business Enterprise (VBE). 51%',
      'valid through 05/20/2028',
      'Honorably discharged USMC Sergeant (1993–1999); maintained sensor and ground-radio electronics.',
      'vendor-neutral, no equipment sales',
      'href="AMT-Capability-Statement.pdf"'
    ].forEach(phrase => assert(cap.includes(phrase), 'capability statement includes ' + phrase));
    [
      'Significantly lower rates',
      'Former USMC',
      '25+ years field service experience',
      'Willing to travel',
      'competitive pricing'
    ].forEach(phrase => assert(!cap.includes(phrase), 'capability statement omits ' + phrase));
    assert(!/\bEIN\b/.test(cap), 'capability statement omits an EIN');
    assert(!/past performance/i.test(cap), 'capability statement omits past performance');
  });
  assert(engineSlice(index) && engineSlice(index) === engineSlice(stand), 'draft engine matches in index.html and the standalone file');
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

function browserPid(userDataDir) {
  const ids = fs.readdirSync('/proc').filter(name => /^\d+$/.test(name));
  const chrome = [];
  ids.forEach(pid => {
    let cmd = '';
    let status = '';
    try {
      cmd = fs.readFileSync('/proc/' + pid + '/cmdline', 'utf8');
      status = fs.readFileSync('/proc/' + pid + '/status', 'utf8');
    } catch (e) { return; }
    if (!cmd.includes(userDataDir) || !/chrom/i.test(cmd)) return;
    const ppid = Number((status.match(/^PPid:\s+(\d+)/m) || [])[1] || 0);
    chrome.push({ pid: Number(pid), ppid });
  });
  const mine = new Set(chrome.map(p => p.pid));
  const roots = chrome.filter(p => !mine.has(p.ppid));
  if (!roots.length) return 0;
  return roots[0].pid;
}

function clearProfileLocks(dir) {
  ['SingletonLock', 'SingletonCookie', 'SingletonSocket'].forEach(name => {
    try { fs.rmSync(path.join(dir, name), { force: true }); } catch (e) {}
  });
}

async function launch(playwright, userDataDir) {
  const opts = {
    headless: true,
    viewport: { width: 390, height: 844 },
    serviceWorkers: 'block',
    args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu']
  };
  const chrome = process.env.CHROME_PATH || '/usr/bin/google-chrome';
  if (fs.existsSync(chrome)) opts.executablePath = chrome;
  let context;
  try {
    context = await playwright.chromium.launchPersistentContext(userDataDir, opts);
  } catch (e) {
    delete opts.serviceWorkers;
    context = await playwright.chromium.launchPersistentContext(userDataDir, opts);
  }
  let blocked = 0;
  const leaked = [];
  const blockWrite = req => {
    if (req.method() === 'GET' || req.method() === 'HEAD') return false;
    return /firebase|firestore|identitytoolkit|securetoken/i.test(req.url());
  };
  await context.route('**/*', route => {
    const req = route.request();
    if (blockWrite(req)) {
      blocked += 1;
      return route.abort();
    }
    return route.continue();
  });
  context.on('requestfinished', req => {
    if (blockWrite(req)) leaked.push(req.method() + ' ' + req.url());
  });
  const page = context.pages()[0] || await context.newPage();
  page.setDefaultTimeout(20000);
  page.on('dialog', dialog => {
    const t = dialog.type();
    if (t === 'confirm' || t === 'beforeunload' || t === 'prompt') dialog.dismiss();
    else dialog.accept();
  });
  page.on('pageerror', err => console.log('PAGEERROR', err && err.message ? err.message : err));
  return { context, page, leaked: () => leaked.slice(), blocked: () => blocked };
}

async function openApp(page, origin) {
  await page.goto(origin + '/', { waitUntil: 'domcontentloaded', timeout: 180000 });
  await page.waitForFunction(() => typeof doLogin === 'function' && typeof installDraftAutosave === 'function');
}

async function bootWriter(page) {
  // Firebase calls handleAuthedUser(null) when this simulated Google session has no
  // Firebase user, which clears currentUser. Hold that callback in the page only.
  await page.evaluate(writer => {
    if (!window.__amtDraftAuthHold) {
      window.__amtDraftAuthHold = true;
      const orig = handleAuthedUser;
      handleAuthedUser = function(user) {
        if (!user && window.__amtDraftAuthHold) return;
        return orig.apply(this, arguments);
      };
    }
    doLogin(writer.name, writer.method, writer.viewOnly, { role: writer.role, email: writer.email });
    const u = currentUser || {};
    if (u.method !== 'Google' || u.role !== 'writer' || u.viewOnly !== false || u.email !== writer.email) {
      throw new Error('writer session mismatch ' + JSON.stringify(u));
    }
  }, WRITER);
  await page.waitForFunction(writer => {
    const u = currentUser || {};
    return u.method === 'Google' && u.role === 'writer' && u.viewOnly === false && u.email === writer.email && draftsAllowed();
  }, WRITER);
}

async function readDraft(page, key) {
  return page.evaluate(key => {
    return new Promise(resolve => {
      let req;
      try { req = indexedDB.open('amtDrafts'); }
      catch (e) { resolve(null); return; }
      req.onerror = () => resolve(null);
      req.onsuccess = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains('drafts')) { resolve(null); return; }
        const tx = db.transaction('drafts', 'readonly');
        const g = tx.objectStore('drafts').get(key);
        g.onsuccess = () => resolve(g.result || null);
        g.onerror = () => resolve(null);
      };
    });
  }, key);
}

async function waitDraft(page, key, pred, budget) {
  const deadline = Date.now() + (budget || 10000);
  let last = null;
  while (Date.now() < deadline) {
    last = await readDraft(page, key);
    if (last && (!pred || pred(last))) return last;
    await page.waitForTimeout(50);
  }
  throw new Error('draft ' + key + ' not ready: ' + JSON.stringify(last));
}

async function waitGone(page, key) {
  const deadline = Date.now() + 10000;
  let last = null;
  while (Date.now() < deadline) {
    last = await readDraft(page, key);
    if (!last) return;
    await page.waitForTimeout(200);
  }
  throw new Error('draft ' + key + ' still present: ' + JSON.stringify(last));
}

async function promptText(page) {
  const loc = page.locator('.draft-restore p').first();
  await loc.waitFor({ state: 'visible' });
  return loc.innerText();
}

async function assertTouchTargets(page) {
  const boxes = await page.locator('.draft-restore .btn').evaluateAll(els => els.map(el => {
    const r = el.getBoundingClientRect();
    return { h: r.height, w: r.width, text: (el.textContent || '').trim() };
  }));
  assert(boxes.length >= 2, 'restore prompt has Restore and Discard buttons');
  boxes.forEach(box => {
    assert(box.h >= 43.5 && box.w >= 43.5, box.text + ' meets the 44px touch target (got ' + box.w + 'x' + box.h + ')');
  });
  const labels = boxes.map(b => b.text);
  assert(labels.indexOf('Restore') >= 0 && labels.indexOf('Discard') >= 0, 'buttons read Restore and Discard');
}

async function main() {
  staticChecks();
  let playwright;
  try { playwright = require('playwright'); }
  catch (e) { fail('Playwright is not installed (' + e.message + ')'); }

  fs.mkdirSync(ART, { recursive: true });
  const port = await freePort();
  const server = await startServer(port);
  const origin = 'http://127.0.0.1:' + port;
  const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'amt-draft-'));
  let session = null;
  try {
    session = await launch(playwright, userDataDir);
    let page = session.page;
    await openApp(page, origin);

    await page.evaluate(() => {
      localStorage.setItem('amt_pm_draft_v32', JSON.stringify({
        type: 'ge_mri',
        state: { ge_mri: { ge_mri_a1: 'fail' } },
        site: 'Legacy Site',
        notes: 'from the old key',
        jobId: '',
        ts: Date.now()
      }));
    });
    await bootWriter(page);
    const logoOk = await page.evaluate(() => {
      const el = document.getElementById('capabilityLogo');
      const src = (el && el.src) || '';
      return src.indexOf('data:image/png;base64,') === 0;
    });
    assert(logoOk, 'capability statement logo is the embedded image');
    await page.evaluate(() => showTab('rates'));
    await page.locator('#capabilityLogo').scrollIntoViewIfNeeded();
    await page.locator('#capabilitySection').screenshot({ path: path.join(ART, 'capability-logo.png') });
    ok('capability statement shows the embedded logo');
    await page.waitForFunction(() => localStorage.getItem('amt_pm_draft_v32') === null);
    ok('legacy amt_pm_draft_v32 migrated and removed');
    const legacy = await waitDraft(page, 'pm:standalone', rec => rec.fields && rec.fields.site === 'Legacy Site');
    assert(legacy.email === WRITER.email, 'migrated PM draft stores the writer email');
    await page.evaluate(() => showTab('pm'));
    const legacyPrompt = await promptText(page);
    assert(/^Restore unsaved entry from .+\?$/.test(legacyPrompt), 'legacy draft asks to restore: ' + legacyPrompt);
    await page.click('.draft-restore [data-draft-discard]');
    await waitGone(page, 'pm:standalone');
    ok('Discard clears the migrated PM draft');

    await page.evaluate(() => showTab('newjob'));
    await page.fill('#nj_site', 'Draft Hospital');
    await page.selectOption('#nj_type', { label: 'Repair' });
    await page.fill('#nj_notes', 'half typed coil');
    await page.fill('#nj_location', 'Miami, FL');
    await page.fill('#nj_miles', '150');
    const job = await waitDraft(page, 'job:new', rec => rec.fields && rec.fields.nj_site === 'Draft Hospital' && rec.fields.nj_type === 'Repair' && rec.fields.nj_notes === 'half typed coil' && rec.fields.nj_miles === '150');
    assert(job.email === WRITER.email, 'new job draft stores the writer email');
    ok('new job draft committed before the browser dies');

    await page.evaluate(() => { showTab('money'); setMoneyTab('expenses'); });
    await page.click('#msp-expenses .btn-warning');
    await page.fill('#exp_desc', 'Helium top-off');
    await page.fill('#exp_amount', '42.5');
    const expense = await waitDraft(page, 'expense:new', rec => rec.fields && rec.fields.exp_desc === 'Helium top-off' && String(rec.fields.exp_amount) === '42.5');
    assert(expense.email === WRITER.email, 'expense draft stores the writer email');
    await page.evaluate(() => closeModal('expenseModal'));
    ok('expense draft committed before the browser dies');

    await page.evaluate(() => showTab('pm'));
    await page.selectOption('#pm_type_sel', 'ge_mri');
    await page.locator('#pm_checklist_area input[type="radio"][value="pass"]').first().click();
    await page.locator('#pm_checklist_area .cl-measure input').first().fill('77');
    await page.fill('#pm_notes', 'helium watch');
    const pm = await waitDraft(page, 'pm:standalone', rec => {
      const st = rec.fields && rec.fields.state && rec.fields.state.ge_mri;
      return rec.fields && rec.fields.notes === 'helium watch' && rec.fields.type === 'ge_mri' && st && Object.keys(st).some(k => st[k] === 'pass') && Object.keys(st).some(k => st[k] === '77');
    });
    assert(pm.email === WRITER.email, 'PM draft stores the writer email');
    ok('PM checklist draft committed before the browser dies');

    await page.evaluate(() => {
      jobs.push({ id: 'pm-job-a', site: 'Alpha Site', type: 'PM', date: '2026-09-01', modality: 'GE CT', model: 'Revolution' });
      jobs.push({ id: 'pm-job-b', site: 'Beta Site', type: 'PM', date: '2026-09-02', modality: 'GE CT', model: 'Revolution' });
      loadPMForJob('pm-job-a');
    });
    await page.waitForFunction(() => (document.getElementById('pm_jobLink') || {}).value === 'pm-job-a');
    await page.fill('#pm_notes', 'alpha last keystroke');
    await page.evaluate(() => loadPMForJob('pm-job-b'));
    const switched = await waitDraft(page, 'pm:pm-job-a', rec => rec.fields && rec.fields.notes === 'alpha last keystroke', 800);
    assert(switched.fields.jobId === 'pm-job-a', 'switching jobs keeps the previous job id on that draft');
    ok('switching PM jobs flushes the previous draft before the debounce');

    await page.evaluate(() => { showTab('money'); setMoneyTab('invoices'); openInvoiceModal(); });
    await page.fill('#inv_client', 'Flush Client');
    await page.evaluate(() => closeModal('invoiceModal'));
    const flushedInv = await waitDraft(page, 'invoice:new', rec => rec.fields && rec.fields.inv_client === 'Flush Client', 800);
    assert(flushedInv.fields.inv_client === 'Flush Client', 'closing the invoice form keeps the last keystrokes');
    await page.evaluate(() => clearDraft('invoice:new'));
    ok('closing a form flushes its draft before the debounce');

    const pid = browserPid(userDataDir);
    if (!pid) fail('browser process is missing');
    killTree(pid);
    session = null;
    await new Promise(r => setTimeout(r, 800));
    clearProfileLocks(userDataDir);
    ok('killed the browser process');

    session = await launch(playwright, userDataDir);
    page = session.page;
    await openApp(page, origin);
    await bootWriter(page);

    await page.evaluate(() => showTab('newjob'));
    const jobPrompt = await promptText(page);
    assert(/^Restore unsaved entry from .+\?$/.test(jobPrompt), 'new job restore prompt: ' + jobPrompt);
    await assertTouchTargets(page);
    await page.locator('.draft-restore').scrollIntoViewIfNeeded();
    await page.locator('.draft-restore').screenshot({ path: path.join(ART, 'draft-restore-prompt-390.png') });
    await page.screenshot({ path: path.join(ART, 'draft-restore-newjob-390.png') });
    ok('captured the new-job restore prompt at 390px');
    await page.click('.draft-restore [data-draft-restore]');
    assert(await page.inputValue('#nj_site') === 'Draft Hospital', 'Restore refills the site');
    assert(await page.inputValue('#nj_type') === 'Repair', 'Restore refills the job type');
    assert(await page.inputValue('#nj_notes') === 'half typed coil', 'Restore refills the notes');
    assert(await page.inputValue('#nj_location') === 'Miami, FL', 'Restore refills the location');
    assert(await page.inputValue('#nj_miles') === '150', 'Restore refills the miles');
    const mileageShown = await page.locator('#mileageDisplay').evaluate(el => getComputedStyle(el).display !== 'none');
    assert(mileageShown, 'restored miles re-run mileage calculation');
    await page.click('#panel-newjob .btn-success');
    await waitGone(page, 'job:new');
    ok('Save clears the new job draft');

    await page.evaluate(() => { showTab('money'); setMoneyTab('expenses'); });
    await page.click('#msp-expenses .btn-warning');
    const expPrompt = await promptText(page);
    assert(/^Restore unsaved entry from .+\?$/.test(expPrompt), 'expense restore prompt: ' + expPrompt);
    await page.locator('.draft-restore').screenshot({ path: path.join(ART, 'draft-restore-expense-390.png') });
    await page.click('.draft-restore [data-draft-discard]');
    await waitGone(page, 'expense:new');
    await page.evaluate(() => closeModal('expenseModal'));
    await page.click('#msp-expenses .btn-warning');
    await page.waitForTimeout(800);
    assert(await page.locator('.draft-restore').count() === 0, 'Discard keeps the expense form from prompting again');
    await page.evaluate(() => closeModal('expenseModal'));
    ok('Discard clears the expense draft');

    await page.evaluate(() => showTab('pm'));
    const pmPrompt = await promptText(page);
    assert(/^Restore unsaved entry from .+\?$/.test(pmPrompt), 'PM restore prompt: ' + pmPrompt);
    await page.locator('.draft-restore').screenshot({ path: path.join(ART, 'draft-restore-pm-390.png') });
    await page.screenshot({ path: path.join(ART, 'draft-restore-pm-screen-390.png') });
    await page.click('.draft-restore [data-draft-restore]');
    assert(await page.inputValue('#pm_notes') === 'helium watch', 'Restore refills PM notes');
    assert(await page.inputValue('#pm_type_sel') === 'ge_mri', 'Restore re-selects the checklist');
    assert(await page.locator('#pm_checklist_area .cl-measure input').first().inputValue() === '77', 'Restore refills the PM reading');
    assert(await page.locator('#pm_checklist_area input[type="radio"][value="pass"]:checked').count() >= 1, 'Restore refills the PM pass mark');
    ok('Restore refills PM marks and readings');

    await page.evaluate(() => {
      doLogin('Antonio Jackson', 'PIN', true);
      activeCLType = '';
    });
    const pinUser = await page.evaluate(() => ({ method: currentUser && currentUser.method, viewOnly: currentUser && currentUser.viewOnly, role: currentUser && currentUser.role }));
    assert(pinUser.method === 'PIN' && pinUser.viewOnly === true, 'PIN session is view-only');
    await page.evaluate(() => showTab('pm'));
    await page.waitForTimeout(1200);
    assert(await page.locator('.draft-restore').count() === 0, 'PIN mode shows no restore prompt');
    await page.evaluate(() => showTab('newjob'));
    await page.evaluate(() => {
      const el = document.getElementById('nj_site');
      el.disabled = false;
      el.value = 'PIN must not draft';
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    });
    await page.waitForTimeout(1500);
    assert(await readDraft(page, 'job:new') == null, 'PIN mode creates no new job draft');
    ok('PIN mode creates no drafts and shows no prompts');

    const leaked = session.leaked();
    assert(leaked.length === 0, 'no non-GET Firestore or Firebase call completed: ' + leaked.join(', '));
    ok('blocked ' + session.blocked() + ' non-GET Firebase/Firestore calls');
  } catch (err) {
    if (session && session.page) {
      try { await session.page.screenshot({ path: path.join(ART, 'draft-checks-failure.png'), fullPage: true }); } catch (e) {}
    }
    fail(err && err.stack ? err.stack : String(err));
  } finally {
    if (session) {
      try { await session.context.close(); } catch (e) {}
    }
    try { server.kill('SIGTERM'); } catch (e) {}
  }
}

main().catch(err => fail(err && err.stack ? err.stack : String(err)));
