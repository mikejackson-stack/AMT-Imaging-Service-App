#!/usr/bin/env node
/**
 * PM checklist checks: Excite II content, model picker, ge_mri key stability.
 * Run: node scripts/pm_checklist_checks.js
 */
'use strict';
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.join(__dirname, '..');

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

function extractConst(src, name) {
  const re = new RegExp('(?:const|var|let)\\s+' + name + '\\s*=\\s*');
  const m = re.exec(src);
  if (!m) throw new Error('missing ' + name);
  return extractBalanced(src, m.index + m[0].length);
}

function extractFunction(src, name) {
  const re = new RegExp('(?:async\\s+)?function\\s+' + name + '\\s*\\(');
  const m = re.exec(src);
  if (!m) throw new Error('missing function ' + name);
  const brace = src.indexOf('{', m.index);
  return src.slice(m.index, brace) + extractBalanced(src, brace);
}

function scriptOf(html) {
  const start = html.indexOf('<script>\n');
  const end = html.lastIndexOf('</script>');
  if (start < 0 || end < 0) throw new Error('script block not found');
  return html.slice(start + 9, end);
}

function geMriKeys(fnSrc) {
  const keys = [];
  const labels = {};
  const re = /rRow\('([^']+)','([^']*)'|measureRow\(t,'([^']+)','([^']*)'|textAreaRow\(t,'([^']+)'/g;
  let m;
  while ((m = re.exec(fnSrc))) {
    if (m[1]) { keys.push(m[1]); labels[m[1]] = m[2]; }
    else if (m[3]) { keys.push('meas_' + m[3]); labels['meas_' + m[3]] = m[4]; }
    else if (m[5]) { keys.push(m[5]); labels[m[5]] = '(added)'; }
  }
  return { keys, labels };
}

function walkPinFiles(dir, out) {
  const skip = new Set(['Manuals', 'node_modules', '.git']);
  for (const name of fs.readdirSync(dir)) {
    if (skip.has(name)) continue;
    const p = path.join(dir, name);
    let st;
    try { st = fs.statSync(p); } catch (e) { continue; }
    if (st.isDirectory()) walkPinFiles(p, out);
    else if (/\.(html|js|mjs|py|md|json|yml|yaml|txt|sh)$/i.test(name) && st.size < 8e6) out.push(p);
  }
}

const expectedOrder = [
  'a1','a2','a3','s1','meas_he','c1','e1','e2','e4','e5','e7','s6',
  'txt_interview',
  'a4','e3','e6','e8','e9','e10','c2','c3','c4','c5','c6','r4','r5','r7',
  'l1','l2','l3','l4','l5','l6','l7','t1','t2','t3','t4','o1','o2','o3','o4','o5',
  'meas_field','c7','c8','r1','r2','r3','r6','s2','s3','s4','s5','s7','s8',
  'a5','p1','p2','p3','p4'
];

const mainHtml = spawnSync('git', ['show', 'main:index.html'], { cwd: ROOT, encoding: 'utf8', maxBuffer: 30e6 });
if (mainHtml.status !== 0 || !mainHtml.stdout) {
  console.error('FAIL: git show main:index.html failed');
  process.exit(1);
}
ok('loaded main:index.html for ge_mri key comparison');
const mainSrc = scriptOf(mainHtml.stdout);
const mainGe = mainSrc ? geMriKeys(extractFunction(mainSrc, 'buildGEMRI')) : { keys: [], labels: {} };

const exported = spawnSync('python3', [path.join(__dirname, 'pm_exii_export.py')], { encoding: 'utf8', maxBuffer: 10e6 });
if (exported.status !== 0) {
  fail('pm_exii_export.py failed\n' + (exported.stderr || ''));
}
const canon = exported.stdout ? JSON.parse(exported.stdout) : null;

const files = ['index.html', 'AMT-Imaging-App-standalone.html'].map(n => path.join(ROOT, n));
let firstTpl = null;

files.forEach(file => {
  const base = path.basename(file);
  console.log('\n== ' + base + ' ==');
  const html = fs.readFileSync(file, 'utf8');
  const src = scriptOf(html);
  assert(!/BC Technical/i.test(html), base + ' has no BC Technical name');
  assert(!/onchange="checkInjectorPMTrigger\(\)"\s+onchange="onTypeChange\(\)"/.test(html), base + ' job type select has one onchange');
  assert(/onchange="onTypeChange\(\)"/.test(html), base + ' job type select calls onTypeChange');
  const onType = extractFunction(src, 'onTypeChange');
  assert(onType.includes('pmAlert') && onType.includes('checkInjectorPMTrigger'), base + ' onTypeChange shows the PM alert and runs the injector trigger');

  const modalities = extractConst(src, 'JOB_MODALITIES');
  const mods = (new Function('return ' + modalities))();
  const optBlock = html.slice(html.indexOf('id="nj_modality"'), html.indexOf('id="nj_modality"') + 800);
  const opts = [...optBlock.matchAll(/<option>([^<]+)<\/option>/g)].map(m => m[1]);
  assert(JSON.stringify(opts) === JSON.stringify(mods), base + ' edit-job modality list matches the new-job list');

  const ge = geMriKeys(extractFunction(src, 'buildGEMRI'));
  assert(JSON.stringify(ge.keys) === JSON.stringify(expectedOrder), base + ' ge_mri items follow the five-step order');
  assert(mainGe.keys.length === 60, 'main ge_mri has 60 saved items');
  mainGe.keys.forEach(k => {
    assert(ge.labels[k] === mainGe.labels[k], base + ' kept ge_mri label for ' + k);
  });
  assert(ge.keys.includes('txt_interview'), base + ' ge_mri has the interview notes box');
  assert(ge.keys.length === mainGe.keys.length + 1, base + ' ge_mri added only the interview notes key');

  ['buildSiemensMRI','buildGECT','buildSiemensCT','buildStellant','buildSolaris','buildOptiVantage','buildEmpowerCTA'].forEach(name => {
    assert(extractFunction(src, name) === extractFunction(mainSrc, name), base + ' did not change ' + name);
  });

  const tpl = (new Function('return ' + extractConst(src, 'PM_EXII')))();
  if (!firstTpl) firstTpl = JSON.stringify(tpl);
  else assert(JSON.stringify(tpl) === firstTpl, 'standalone PM_EXII matches index.html');
  if (canon) assert(JSON.stringify(tpl) === JSON.stringify(canon), base + ' PM_EXII matches scripts/pm_exii_content.py');

  const tasks = tpl.sections.reduce((n, sec) => n + sec.groups.reduce((m, g) => m + g.tasks.length, 0), 0);
  assert(tasks === 52, base + ' has 52 Excite II tasks');
  assert(tpl.cal.length === 8 && tpl.mag.length === 6 && tpl.other.length === 1, base + ' has 8+6+1 readings');
  assert(tpl.sysinfo.length === 11, base + ' has 11 site/system fields');
  assert(tpl.nEquip === 4, base + ' has 4 test-equipment rows');
  assert(tpl.interviewN === 5, base + ' has 5 interview rows');
  const ids = [];
  tpl.sections.forEach(sec => sec.groups.forEach(g => g.tasks.forEach(t => {
    ids.push(t.id);
    assert(t.text && (t.interval === 'Bi-monthly' || t.interval === '6 months'), base + ' task ' + t.id + ' keeps wording and interval');
  })));
  assert(new Set(ids).size === ids.length, base + ' task ids are unique');
  assert(tpl.sections[0].title.indexOf('SECTION 3') === 0 && tpl.sections[1].title.indexOf('SECTION 4') === 0, base + ' task sections stay in cleaning-then-scanning order');
  assert(/in 1C\./.test(tpl.sections[1].groups[0].tasks[0].text), base + ' gradcal task points at Section 1C');
  assert(/Section 1E/.test(tpl.sections[1].groups[1].tasks[0].text), base + ' RF power task points at Section 1E');
  assert(tpl.cal.some(r => r.spec === 'per OEM spec') || tpl.mag.some(r => r.spec === 'per OEM spec'), base + ' keeps per OEM spec where no limit is given');

  const rt = new Function(
    'const MODALITY_CL_MAP = ' + extractConst(src, 'MODALITY_CL_MAP') + ';\n' +
    extractFunction(src, 'suggestChecklistForJob') + '\n' +
    extractFunction(src, 'inferGECTQuarter') + '\n' +
    'return {suggestChecklistForJob:suggestChecklistForJob, inferGECTQuarter:inferGECTQuarter};'
  )();
  const pick = (modality, model) => rt.suggestChecklistForJob({ modality, model });
  [
    ['Signa HDxt 16.x', 'ge_mr_exii', false],
    ['Signa Excite II 1.5T', 'ge_mr_exii', false],
    ['Excite HD 1.5T', 'ge_mr_exii', false],
    ['HDx 15.x', 'ge_mr_exii', false],
    ['Signa HDe', 'ge_mr_exii', false],
    ['Signa HDxt 3T 16x', 'ge_mr_exii', false],
    ['Signa Excite 12x', 'ge_mr_exii', false],
    ['Signa Excite HDxt 15x', 'ge_mr_exii', false]
  ].forEach(([model, type, confirm]) => {
    const got = pick('GE MRI', model);
    assert(got.type === type && got.confirm === confirm, 'GE MRI "' + model + '" -> ' + type);
  });
  [
    ['Signa Excite', true],
    ['Excite Plus', true],
    ['Signa Excite 1.5T', true]
  ].forEach(([model, confirm]) => {
    const got = pick('GE MRI', model);
    assert(got.type === 'ge_mri' && got.confirm === confirm, 'plain Excite "' + model + '" asks for confirmation');
  });
  [
    'Signa LX 9.1', 'LX 9x', 'Signa Excite 10x', 'Discovery MR750', 'Discovery 750 24x',
    'Optima MR450w', 'Signa Voyager', 'Signa Premier', 'SIGNA Premier XT', 'Signa Sprint',
    'Signa Creator', 'Explorer SV25', 'Artist EVO', 'Signa Pioneer', 'Signa Hero'
  ].forEach(model => {
    const got = pick('GE MRI', model);
    assert(got.type === 'ge_mri' && got.confirm === false, 'GE MRI "' + model + '" stays on ge_mri');
  });
  assert(pick('Siemens MRI', 'Aera').type === 'siemens_mri', 'Siemens MRI stays on siemens_mri');
  assert(pick('GE CT', 'Revolution').type === 'ge_ct', 'GE CT stays on ge_ct');
  assert(pick('Philips MRI', 'Ingenia').type === 'ge_mri', 'Philips MRI stays on the generic GE MRI checklist');
  assert(pick('Hitachi MRI', 'Airis').type === '' && pick('Hitachi MRI', 'Airis').confirm === false, 'Hitachi MRI is not auto-picked');

  const q3 = rt.inferGECTQuarter({ ge_ct: { ge_ct_q3_g1: 'pass', ge_ct_q3_g2: 'fail', ge_ct_meas_q3_tube: '10' } });
  assert(q3 === 'q3', 'a saved Q3 GE CT checklist infers quarter q3');
  const q1 = rt.inferGECTQuarter({ ge_ct: { ge_ct_q1_g1: 'pass' } });
  assert(q1 === 'q1', 'a saved Q1 GE CT checklist infers quarter q1');
  assert(rt.inferGECTQuarter({ ge_ct: {} }) === null, 'an empty GE CT state does not invent a quarter');

  assert(/state:slice/.test(extractFunction(src, 'savePMChecklist')), base + ' saves only the active checklist state');
  assert(/gectQuarter/.test(extractFunction(src, 'savePMChecklist')), base + ' saves the GE CT quarter');
  assert(/bindPMJob/.test(extractFunction(src, 'onPMJobChange')), base + ' job link uses the job-aware picker');
  assert(/_pmSkipDraft=true/.test(extractFunction(src, 'loadPMForJob')), base + ' opening a job PM skips the previous draft');
  assert(/pmFreezePrint/.test(extractFunction(src, 'printPMChecklist')), base + ' print freezes every field type');
  assert(/querySelector\('table, \.cl-exii'\)/.test(extractFunction(src, 'printPMChecklist')), base + ' print allows the Excite II form, which is not a table');
});

const pinRe = /sha256\(\s*['"]\d{4}_amt_salt_|['"]\d{4}['"]\s*,\s*['"](?:mikejackson|antoniojackson|candelariojuarez|emilyoliveros)['"]/;
const pinFiles = [];
walkPinFiles(ROOT, pinFiles);
let pinHits = 0;
pinFiles.forEach(p => {
  const text = fs.readFileSync(p, 'utf8');
  if (pinRe.test(text)) {
    pinHits++;
    fail('plaintext PIN pattern in ' + path.relative(ROOT, p));
  }
});
assert(pinHits === 0, 'no plaintext staff PIN remains in the working tree');

if (!process.exitCode) console.log('\nPM checklist checks passed.');
process.exit(process.exitCode || 0);
