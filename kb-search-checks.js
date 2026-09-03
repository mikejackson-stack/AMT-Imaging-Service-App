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

  const familyGuide = (rt.DIAG_GUIDES_SEED || []).find(g => g.id === 'dg_ge_mri_ct_family');
  assert(!!familyGuide, 'DIAG_GUIDES_SEED includes GE MRI / CT family guide');
  assert(familyGuide && /GE MRI family/.test(familyGuide.title) && /GE CT family/.test(familyGuide.title),
    'family guide title includes GE MRI family and GE CT family');
  assert(familyGuide && /NOT FRU interchange/i.test(familyGuide.title) && /NOT FRU interchange/i.test(familyGuide.content),
    'family guide states shared family is NOT FRU interchange');
  assert(familyGuide && /About-screen product name/.test(familyGuide.content)
    && /full software label/i.test(familyGuide.content)
    && /Guided Install short name/.test(familyGuide.content)
    && /upgrade-kit \/ FMI PN/i.test(familyGuide.content)
    && /GOC \+ DAS/.test(familyGuide.content)
    && /If any is missing, stop/.test(familyGuide.content),
    'family guide has identify-first checklist');
  assert(familyGuide && /VERIFIED MRI/.test(familyGuide.content)
    && /2023 OEM SM title/.test(familyGuide.content)
    && /SV25\.3_R05_2127\.a/.test(familyGuide.content)
    && /SignaCreatorExplorer/.test(familyGuide.content)
    && /5877347/.test(familyGuide.content)
    && /SV29\.2/.test(familyGuide.content)
    && /MR30\.1/.test(familyGuide.content)
    && /Tang A/.test(familyGuide.content),
    'family guide keeps verified MRI software facts');
  assert(familyGuide && /NOT VERIFIED/.test(familyGuide.content)
    && /FRU overlap/.test(familyGuide.content)
    && /Pioneer \/ Voyager files packed/.test(familyGuide.content),
    'family guide keeps not-verified FRU / Pioneer-Voyager caveats');
  assert(familyGuide && /Other MRI clusters/.test(familyGuide.content)
    && /DV22/.test(familyGuide.content)
    && /MP24/.test(familyGuide.content)
    && /Architect upgrade PDF/.test(familyGuide.content),
    'family guide keeps other sourced MRI clusters short');
  assert(familyGuide && /VERIFIED CT/.test(familyGuide.content)
    && /2360027-300 Rev 15/.test(familyGuide.content)
    && /CONFIGUIRATIONS\.pdf/.test(familyGuide.content)
    && /06MW29\.4/.test(familyGuide.content)
    && /07MW18\.4/.test(familyGuide.content),
    'family guide keeps LightSpeed / GOC / DARC / VCT verified CT facts');
  assert(familyGuide && /CT UNKNOWN/.test(familyGuide.content)
    && /Brivo CT/.test(familyGuide.content)
    && /EOSL years/.test(familyGuide.content)
    && /LS3X 8-slice/.test(familyGuide.content),
    'family guide keeps CT unknowns');
  assert(familyGuide && /GE MRI familiy/.test((familyGuide.tags || []).join(' '))
    && /GE MRI familiy/.test(familyGuide.content),
    'family guide indexes the familiy misspelling');
  assert(familyGuide && !/FRUs? (are|is) interchangeable/i.test(familyGuide.content)
    && !/same FRU/i.test(familyGuide.content.replace(/NOT VERIFIED[\s\S]*?(?=### Other MRI clusters)/, '')),
    'family guide does not claim FRU interchange as a verified fact');

  ['GE MRI family', 'GE MRI familiy', 'GE CT family', 'SIGNA Creator', 'SIGNA Explorer',
   'SIGNA Star', 'SIGNA Aviator', 'SV25', 'SV29.2', 'MR30.1', 'LightSpeed family', 'GOC', 'DARC'].forEach(q => {
    const hits = rt.amtGuideHits(q, rt.DIAG_GUIDES_SEED);
    assert(hits.some(g => g.id === 'dg_ge_mri_ct_family'),
      'amtGuideHits("' + q + '") hits GE MRI / CT family guide');
  });

  const siemensGuide = (rt.DIAG_GUIDES_SEED || []).find(g => g.id === 'dg_siemens_mri_ct_family');
  const geStill = (rt.DIAG_GUIDES_SEED || []).find(g => g.id === 'dg_ge_mri_ct_family');
  assert(!!siemensGuide, 'DIAG_GUIDES_SEED includes Siemens MRI / CT family guide');
  assert(!!geStill && /NOT FRU interchange/i.test(geStill.content),
    'GE MRI / CT family guide remains intact beside the Siemens guide');
  assert(siemensGuide && siemensGuide.title === 'Siemens MRI / CT family guide',
    'Siemens family guide uses the sourced title');
  assert(siemensGuide && /NOT FRU interchange/i.test(siemensGuide.content)
    && /Shared SW ≠ shared FRU/.test(siemensGuide.content)
    && /Shared XA ≠ FRU interchange/.test(siemensGuide.content),
    'Siemens family guide states shared family is NOT FRU interchange');
  assert(siemensGuide && /About \/ Help-Info name/.test(siemensGuide.content)
    && /Fit vs non-Fit/.test(siemensGuide.content)
    && /Dot vs non-Dot/.test(siemensGuide.content)
    && /full software label/i.test(siemensGuide.content)
    && /Magnet \/ gantry \/ Tim/.test(siemensGuide.content)
    && /System ID \/ serial \/ service key/.test(siemensGuide.content)
    && /SM part number/.test(siemensGuide.content)
    && /If any is missing, stop/.test(siemensGuide.content),
    'Siemens family guide has identify-first checklist');
  assert(siemensGuide && /VA30A/.test(siemensGuide.content)
    && /syngo MR A30/.test(siemensGuide.content)
    && /NUMARIS\/4 VA30A/.test(siemensGuide.content)
    && /MR-000\.816\.27/.test(siemensGuide.content)
    && /M6-020/.test(siemensGuide.content)
    && /B19 \/ B19B/.test(siemensGuide.content)
    && /XA50/.test(siemensGuide.content)
    && /Espree is not on that DICOM table/.test(siemensGuide.content)
    && /M7 manuals/.test(siemensGuide.content)
    && /Avanto→Avanto fit/.test(siemensGuide.content)
    && /Verio→Skyra fit/.test(siemensGuide.content)
    && /Trio→Prisma fit/.test(siemensGuide.content)
    && /NUMARIS\/4 VD13A/.test(siemensGuide.content)
    && /ESSENZA \/ Spectra \/ Prisma/.test(siemensGuide.content)
    && /Vida \/ Sola \/ Altea \/ Lumina/.test(siemensGuide.content),
    'Siemens family guide keeps verified MRI software facts');
  assert(siemensGuide && /SOMARIS\/5 VB42B/.test(siemensGuide.content)
    && /Emotion Duo/.test(siemensGuide.content)
    && /C2-015/.test(siemensGuide.content)
    && /C2-028/.test(siemensGuide.content)
    && /go\.Now/.test(siemensGuide.content)
    && /GO All = Mobile/.test(siemensGuide.content),
    'Siemens family guide keeps verified CT facts');
  assert(siemensGuide && /UNKNOWN/.test(siemensGuide.content)
    && /FRU interchange inside those pairs/.test(siemensGuide.content)
    && /Espree beyond B19B/.test(siemensGuide.content)
    && /NUMARIS string for XA/.test(siemensGuide.content)
    && /Definition AS/.test(siemensGuide.content)
    && /README stubs/.test(siemensGuide.content)
    && /EOSL years/.test(siemensGuide.content),
    'Siemens family guide keeps unknowns');
  const sTags = (siemensGuide.tags || []).join(' ');
  assert(/Seimens family/.test(sTags) && /Seimens MRI family/.test(sTags)
    && /Seimens family/.test(siemensGuide.content)
    && /Seimens MRI family/.test(siemensGuide.content),
    'Siemens family guide indexes Seimens misspellings');
  assert(siemensGuide && !/Avanto FRUs fit Espree/i.test(siemensGuide.content.replace(/do not assume Avanto FRUs fit Espree/i, ''))
    && !/one FRU family/.test(siemensGuide.content.replace(/not one FRU family/, '')),
    'Siemens family guide does not claim FRU interchange as a verified fact');

  ['Siemens family', 'Seimens family', 'Siemens MRI family', 'Seimens MRI family',
   'MAGNETOM', 'SOMATOM', 'syngo MR', 'NUMARIS', 'VB19', 'XA30'].forEach(q => {
    const hits = rt.amtGuideHits(q, rt.DIAG_GUIDES_SEED);
    assert(hits.some(g => g.id === 'dg_siemens_mri_ct_family'),
      'amtGuideHits("' + q + '") hits Siemens MRI / CT family guide');
  });
});

const sw = fs.readFileSync(path.join(__dirname, 'sw.js'), 'utf8');
assert(/const CACHE = 'amt-v35'/.test(sw), 'sw.js cache name is amt-v35');

if (process.exitCode) {
  console.log('\nSome checks failed.');
  process.exit(1);
}
console.log('\nAll kb-search honesty checks passed.');
