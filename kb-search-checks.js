#!/usr/bin/env node
/**
 * Honesty checks for AMT knowledge search (no Manuals/ tree clone).
 * Run: node kb-search-checks.js
 */
'use strict';
const fs = require('fs');
const path = require('path');

function fail(msg) {
  console.error('FAIL:', msg);
  process.exitCode = 1;
}
function ok(msg) { console.log('OK  ', msg); }

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
  const re = new RegExp('function\\s+' + name + '\\s*\\(');
  const m = re.exec(src);
  if (!m) throw new Error('missing function ' + name);
  const brace = src.indexOf('{', m.index);
  return src.slice(m.index, brace) + extractBalanced(src, brace);
}

function loadSearchRuntime(htmlPath) {
  const html = fs.readFileSync(htmlPath, 'utf8');
  const start = html.indexOf('<script>\n');
  const end = html.lastIndexOf('</script>');
  if (start < 0 || end < 0) throw new Error('script block not found in ' + htmlPath);
  const src = html.slice(start + 9, end);
  const names = [
    'amtNormCode', 'amtErrorHits', 'amtPartCorpus', 'amtPartHits',
    'amtManualRelPath', 'amtManualTreeCatalog', 'amtManualHits',
    'amtCodeTableHits', 'amtGuideHits', 'amtDiagSearchHonesty'
  ];
  const fns = names.map(n => extractFunction(src, n)).join('\n');
  const prelude = [
    'const FULL_ERROR_DB = ' + extractConst(src, 'FULL_ERROR_DB') + ';',
    'const PARTS_SEED = ' + extractConst(src, 'PARTS_SEED') + ';',
    'const FALLBACK_FOLDERS = ' + extractConst(src, 'FALLBACK_FOLDERS') + ';',
    'const GE_SUBFOLDERS = ' + extractConst(src, 'GE_SUBFOLDERS') + ';',
    'const GE_CT_SUBFOLDERS = ' + extractConst(src, 'GE_CT_SUBFOLDERS') + ';',
    'const SIEMENS_SUBFOLDERS = ' + extractConst(src, 'SIEMENS_SUBFOLDERS') + ';',
    'const SIEMENS_CT_SUBFOLDERS = ' + extractConst(src, 'SIEMENS_CT_SUBFOLDERS') + ';',
    'const HITACHI_SUBFOLDERS = ' + extractConst(src, 'HITACHI_SUBFOLDERS') + ';',
    'var partsDB = PARTS_SEED.slice();',
    'var explorerCache = {};',
    'const DIAG_GUIDES_SEED = ' + extractConst(src, 'DIAG_GUIDES_SEED') + ';',
    'var diagGuidesDB = [];',
    fns
  ].join('\n');
  const box = { FULL_ERROR_DB: null, PARTS_SEED: null, DIAG_GUIDES_SEED: null, amtErrorHits: null, amtPartHits: null,
    amtManualHits: null, amtCodeTableHits: null, amtDiagSearchHonesty: null, amtGuideHits: null };
  const keys = Object.keys(box);
  const fn = new Function(prelude + '\nreturn {' + keys.map(k => k + ':' + k).join(',') + '};');
  return { html, src, rt: fn() };
}

function assert(cond, msg) {
  if (!cond) fail(msg);
  else ok(msg);
}

const files = [
  path.join(__dirname, 'index.html'),
  path.join(__dirname, 'AMT-Imaging-App-standalone.html')
];

files.forEach(file => {
  console.log('\n== ' + path.basename(file) + ' ==');
  const { html, src, rt } = loadSearchRuntime(file);

  const e501 = rt.FULL_ERROR_DB.find(e => String(e.code) === 'E501');
  assert(e501 && /cold head/i.test(e501.desc || ''), 'E501 is in FULL_ERROR_DB (GE cold head)');

  const err501 = rt.amtErrorHits('e501');
  assert(err501.some(e => e.code === 'E501'), 'amtErrorHits("e501") hits the error table');

  const code501 = rt.amtCodeTableHits('E501');
  assert(code501.some(e => e.code === 'E501'), 'amtCodeTableHits("E501") hits the error table');

  const code410 = rt.amtCodeTableHits('E410');
  assert(code410.some(e => e.code === 'E410'), 'amtCodeTableHits("E410") hits the error table');

  const honesty501 = rt.amtDiagSearchHonesty('E501', []);
  assert(honesty501.errorCount >= 1 && honesty501.uniquelyZero === false,
    'Guides path does not uniquely claim 0 for E501 (error table hit, empty guide corpus)');

  const honesty410 = rt.amtDiagSearchHonesty('E410', []);
  assert(honesty410.errorCount >= 1 && honesty410.uniquelyZero === false,
    'Guides path does not uniquely claim 0 for E410');

  const gradientDump = rt.amtCodeTableHits('gradient');
  assert(gradientDump.length === 0,
    'amtCodeTableHits("gradient") does not dump the error table into Guides');

  const emptyQ = rt.amtCodeTableHits('');
  assert(emptyQ.length === 0, 'empty Guides query does not dump the error table');

  const part210 = rt.amtPartHits('2107246');
  assert(part210.some(p => String(p.num).includes('2107246')),
    'parts slice hits PARTS_SEED number 2107246');

  const partCpu = rt.amtPartHits('2294300-16');
  assert(partCpu.some(p => String(p.num) === '2294300-16'),
    'parts slice hits PARTS_SEED number 2294300-16');

  const manualsAvanto = rt.amtManualHits('avanto');
  assert(manualsAvanto.some(m => /avanto/i.test(m.name) || /avanto/i.test(m.path)),
    'manuals slice hits fallback folder Avanto');

  const fakeCache = {
    'GE': { ts: Date.now(), data: [
      { name: 'Cryo_Service.htm', path: 'Manuals/GE/Cryo_Service.htm', type: 'file' }
    ]}
  };
  const manualsFile = rt.amtManualHits('cryo_service', fakeCache);
  assert(manualsFile.some(m => /cryo_service/i.test(m.name) || /cryo_service/i.test(m.path)),
    'manuals slice hits explorer-cache file Cryo_Service.htm');

  const kb = extractFunction(src, 'kbSearch');
  const errAt = kb.indexOf('Error Code Reference');
  const partsAt = kb.indexOf('🔩 Parts');
  const manualsAt = kb.indexOf('📁 Manuals');
  const guidesAt = kb.indexOf('Reference Guides');
  assert(errAt >= 0 && partsAt > errAt && manualsAt > partsAt && guidesAt > manualsAt,
    'kbSearch renders error cards first, then parts, then manuals, then guides');

  const dg = extractFunction(src, 'renderDiagGuides');
  assert(dg.includes('amtCodeTableHits') && dg.includes('No diagnostic guide titled') && dg.includes('errHits'),
    'renderDiagGuides surfaces error-table hits instead of a unique 0-guides miss');
  assert(dg.includes('!guides.length && !errHits.length'),
    'Guides empty state requires both zero guides and zero error-table hits');

  const login = /Field Service Management · v35/.test(html);
  const top = /Field Service · v35/.test(html);
  const appVer = /const APP_VERSION='v35'/.test(src);
  assert(login && top && appVer, 'version strings are v35 (login, top bar, APP_VERSION)');

  assert(/PIN login cannot call the backup search/.test(src),
    'Ask Grok UI blocks PIN (requires Firebase Auth currentUser)');
  assert(/httpsCallable\('askGrok'/.test(src),
    'Ask Grok uses the staff-only Firebase callable');
  assert(!/defineSecret\s*\(\s*['"]XAI_API_KEY['"]\s*\)/.test(src),
    'app HTML does not embed the functions secret binding');

  const leakGuide = (rt.DIAG_GUIDES_SEED || []).find(g => g.id === 'dg_explorer_sv25_leak_detector');
  assert(!!leakGuide, 'DIAG_GUIDES_SEED includes GE Explorer SV25 leak detector guide');
  assert(leakGuide && /pin 8 to pin 9/i.test(leakGuide.content) && /pins 1 and 2/i.test(leakGuide.content),
    'leak detector guide has cabinet-monitor pin measurements');
  assert(leakGuide && /8\.2 MOhms/i.test(leakGuide.content) && /5 MOhms to 13 MOhms/i.test(leakGuide.content),
    'leak detector guide has OEM resistance ranges');
  assert(leakGuide && /Wet sensor strip/i.test(leakGuide.content) && /Disconnected sensor strip/i.test(leakGuide.content),
    'leak detector guide has visible Table 1 rows');
  assert(leakGuide && !/Bent connector pin/i.test(leakGuide.content),
    'leak detector guide does not invent cut-off Table 1 rows');

  ['leak detector', 'leak sensor', 'Explorer SV25', 'coolant leak'].forEach(q => {
    const hits = rt.amtGuideHits(q, rt.DIAG_GUIDES_SEED);
    assert(hits.some(g => g.id === 'dg_explorer_sv25_leak_detector'),
      'amtGuideHits("' + q + '") hits Explorer SV25 leak detector guide');
  });
});

const sw = fs.readFileSync(path.join(__dirname, 'sw.js'), 'utf8');
assert(/const CACHE = 'amt-v35'/.test(sw), 'sw.js cache name is amt-v35');

if (process.exitCode) {
  console.log('\nSome checks failed.');
  process.exit(1);
}
console.log('\nAll kb-search honesty checks passed.');
