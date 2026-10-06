#!/usr/bin/env node
/**
 * Honesty checks for AMT knowledge search (no Manuals/ tree clone).
 * Run: node kb-search-checks.js
 */
'use strict';
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

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
  const re = new RegExp('(?:async\\s+)?function\\s+' + name + '\\s*\\(');
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
    'amtCodeTableHits', 'amtGuideHits', 'amtDiagSearchHonesty',
    'amtGeLooseSystem', 'amtGeLooseHay', 'amtGeLooseHits'
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
    'const ALL_SYSTEMS_SUBFOLDERS = ' + extractConst(src, 'ALL_SYSTEMS_SUBFOLDERS') + ';',
    'const GE_LOOSE_FILES = ' + extractConst(src, 'GE_LOOSE_FILES') + ';',
    'var partsDB = PARTS_SEED.slice();',
    'var explorerCache = {};',
    'const DIAG_GUIDES_SEED = ' + extractConst(src, 'DIAG_GUIDES_SEED') + ';',
    'var diagGuidesDB = [];',
    fns
  ].join('\n');
  const box = { FULL_ERROR_DB: null, PARTS_SEED: null, DIAG_GUIDES_SEED: null, amtErrorHits: null, amtPartHits: null,
    amtManualHits: null, amtCodeTableHits: null, amtDiagSearchHonesty: null, amtGuideHits: null,
    amtGeLooseSystem: null, amtGeLooseHits: null, GE_LOOSE_FILES: null };
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

  assert(/fbAuth\.currentUser/.test(src) && /PIN unlock cannot call the backup search/.test(src),
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
  assert(/seed wins so LIVE SHIP revisions replace cached copies/.test(src),
    'loadDiagGuides replaces cached seed guides so LIVE revisions ship');
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
  assert(siemensGuide && /CoS last-look SHIP rev 2/.test(siemensGuide.content)
    && /LIBRARY = AMT SM/.test(siemensGuide.content)
    && /OEM-PUBLIC = OEM public/.test(siemensGuide.content)
    && /FDA = 510/.test(siemensGuide.content)
    && /Aera→Sola Fit/.test(siemensGuide.content)
    && /Skyra→Vida Fit/.test(siemensGuide.content)
    && /Prisma→Cima\.X Fit/.test(siemensGuide.content)
    && /LIBRARY\+OEM/.test(siemensGuide.content)
    && /BioMatrix/.test(siemensGuide.content)
    && /Free\.Max 0\.55T 80cm DryCool/.test(siemensGuide.content)
    && /Free\.Star 60cm/.test(siemensGuide.content)
    && /Spirit/.test(siemensGuide.content)
    && /Not on the VB42B list/.test(siemensGuide.content)
    && /VC50 FDA/.test(siemensGuide.content)
    && /SOMARIS\/7/.test(siemensGuide.content)
    && /first DSCT C2-028/.test(siemensGuide.content)
    && /AS \/ Edge single/.test(siemensGuide.content)
    && /Flash \/ Drive \/ Force dual/.test(siemensGuide.content)
    && /SOMARIS\/10/.test(siemensGuide.content)
    && /Chronon/.test(siemensGuide.content)
    && /Athlon/.test(siemensGuide.content)
    && /X\.cite/.test(siemensGuide.content)
    && /X\.ceed/.test(siemensGuide.content)
    && /Vectron \+ StellarInfinity/.test(siemensGuide.content)
    && /82cm/.test(siemensGuide.content)
    && /Pro\.Pulse/.test(siemensGuide.content)
    && /2×Athlon DS/.test(siemensGuide.content)
    && /QuantaMax photon-counting ≠ SOMATOM EID/.test(siemensGuide.content)
    && /syngo CT VD \/ VE/.test(siemensGuide.content)
    && /Not found/.test(siemensGuide.content),
    'Siemens family guide ships CoS last-look rev 2 MRI/CT facts with source tags');
  assert(siemensGuide && /UNKNOWN/.test(siemensGuide.content)
    && /Fit FRU lists \/ eligibility/.test(siemensGuide.content)
    && /Espree beyond B19B/.test(siemensGuide.content)
    && /Shared FRU first Definition vs Flash/.test(siemensGuide.content)
    && /Edge Plus Stellar vs StellarInfinity wording/.test(siemensGuide.content)
    && /NAEOTOM OS string/.test(siemensGuide.content)
    && /\bEOSL\b/.test(siemensGuide.content)
    && !/FRU interchange inside those pairs/.test(siemensGuide.content)
    && !/NUMARIS string for XA/.test(siemensGuide.content)
    && !/README stubs/.test(siemensGuide.content),
    'Siemens family guide keeps rev 2 unknowns');
  assert(geStill && /CoS last-look SHIP/.test(geStill.content) && !/SHIP rev 2/.test(geStill.content)
    && /SIGNA Creator \/ Explorer 1\.5T/.test(geStill.content)
    && /2360027-300 Rev 15/.test(geStill.content),
    'GE MRI / CT family guide body stays on rev 1 (unchanged)');
  const sTags = (siemensGuide.tags || []).join(' ');
  assert(/Seimens family/.test(sTags) && /Seimens MRI family/.test(sTags)
    && /Seimens family/.test(siemensGuide.content)
    && /Seimens MRI family/.test(siemensGuide.content),
    'Siemens family guide indexes Seimens misspellings');
  assert(/BioMatrix/.test(sTags) && /Free\.Max/.test(sTags) && /Sola Fit/.test(sTags)
    && /SOMARIS\/7/.test(sTags) && /SOMARIS\/10/.test(sTags)
    && /NAEOTOM/.test(sTags) && /Pro\.Pulse/.test(sTags),
    'Siemens family guide indexes rev 2 search aliases');
  assert(siemensGuide && !/Avanto FRUs fit Espree/i.test(siemensGuide.content.replace(/do not assume Avanto FRUs fit Espree/i, ''))
    && !/one FRU family/.test(siemensGuide.content.replace(/not one FRU family/, ''))
    && !/FRUs? (are|is) interchangeable/i.test(siemensGuide.content)
    && !/photon-counting = SOMATOM EID/.test(siemensGuide.content),
    'Siemens family guide does not claim FRU interchange as a verified fact');

  ['Siemens family', 'Seimens family', 'Siemens MRI family', 'Seimens MRI family',
   'MAGNETOM', 'SOMATOM', 'syngo MR', 'NUMARIS', 'VB19', 'XA30',
   'BioMatrix', 'Free.Max', 'Sola Fit', 'SOMARIS/7', 'SOMARIS/10', 'NAEOTOM', 'Pro.Pulse'].forEach(q => {
    const hits = rt.amtGuideHits(q, rt.DIAG_GUIDES_SEED);
    assert(hits.some(g => g.id === 'dg_siemens_mri_ct_family'),
      'amtGuideHits("' + q + '") hits Siemens MRI / CT family guide');
  });

  const msupGuide = (rt.DIAG_GUIDES_SEED || []).find(g => g.id === 'dg_siemens_msup_firmware_mode_quench');
  assert(!!msupGuide, 'DIAG_GUIDES_SEED includes Siemens MSUP firmware-mode post-quench field guide');
  assert(msupGuide && msupGuide.system === 'Siemens MRI', 'MSUP quench guide is tagged Siemens MRI');
  assert(msupGuide && /field note/i.test(msupGuide.content) && /Little/.test(msupGuide.content) && /Rich/.test(msupGuide.content),
    'MSUP quench guide attributes source as field note (Mike / Little / Rich)');
  assert(msupGuide && /Power off MSUP/.test(msupGuide.content)
    && /restart the MARS/.test(msupGuide.content)
    && /Pressure heater control/.test(msupGuide.content)
    && /15\.4 psia/.test(msupGuide.content)
    && /Automatic/.test(msupGuide.content)
    && /PHAP/.test(msupGuide.content)
    && /≥30 minutes|>=30 minutes|30 minutes/.test(msupGuide.content),
    'MSUP quench guide keeps numbered reset + monitoring facts from the field note');
  assert(msupGuide && !/NFPA|Joint Commission|FDA|ISO 9001/.test(msupGuide.content),
    'MSUP quench guide does not cite NFPA-99 / Joint Commission / FDA / ISO 9001');
  assert(msupGuide && !/FRU interchange/i.test(msupGuide.content.replace(/no part numbers or FRU interchange claimed/i,'')),
    'MSUP quench guide does not invent FRU interchange');
  ['MSUP', 'firmware mode', 'quench', 'pressure heater', 'MARS', 'PHAP', '15.4 psia'].forEach(q => {
    const hits = rt.amtGuideHits(q, rt.DIAG_GUIDES_SEED);
    assert(hits.some(g => g.id === 'dg_siemens_msup_firmware_mode_quench'),
      'amtGuideHits("' + q + '") hits MSUP firmware-mode post-quench guide');
  });

  const artGuide = (rt.DIAG_GUIDES_SEED || []).find(g => g.id === 'dg_mri_magnet_coil_image_artifacts');
  assert(!!artGuide, 'DIAG_GUIDES_SEED includes GE + Siemens MRI magnet/coil image-artifact guide');
  assert(artGuide && artGuide.system === 'GE + Siemens MRI', 'image-artifact guide system is GE + Siemens MRI');
  assert(artGuide && /\bGE\b/.test(artGuide.content) && /Siemens/.test(artGuide.content)
    && /MR Field Notes/.test(artGuide.content)
    && /Avanto\/Espree RF Troubleshooting Guide/.test(artGuide.content)
    && /Field practice \(unsourced\)/.test(artGuide.content)
    && /CTL/.test(artGuide.content)
    && /lumbar/.test(artGuide.content)
    && /small animal/.test(artGuide.content)
    && /moderate confidence/.test(artGuide.content)
    && /No Phase Wrap/.test(artGuide.content),
    'image-artifact guide names GE and Siemens and keeps cited field-guide phrases');
  assert(artGuide && /### 22\./.test(artGuide.content), 'image-artifact guide includes entry 22');
  assert(artGuide && !/NFPA|Joint Commission|\bFDA\b|ISO 9001/i.test(artGuide.content),
    'image-artifact guide does not cite NFPA-99 / Joint Commission / FDA / ISO 9001');
  assert(artGuide && !/FRU interchange/i.test(artGuide.content.replace(/no part numbers or FRU interchange claimed/i,'')),
    'image-artifact guide does not invent FRU interchange');
  assert(artGuide && !/Philips|Canon|Toshiba/i.test(artGuide.content),
    'image-artifact guide does not name Philips, Canon, or Toshiba');
  assert(/function amtGuideOnSys/.test(src) && /GE \+ Siemens MRI/.test(src),
    'GE + Siemens MRI guides are included under both GE MRI and Siemens MRI pills');
  ['CTL lumbar small animal', 'zipper RF leak', 'fat sat shim', 'spike white pixel', 'No Phase Wrap wrap', 'AutoCoilSelect'].forEach(q => {
    const hits = rt.amtGuideHits(q, rt.DIAG_GUIDES_SEED);
    assert(hits.some(g => g.id === 'dg_mri_magnet_coil_image_artifacts'),
      'amtGuideHits("' + q + '") hits MRI magnet/coil image-artifact guide');
  });

  const ltl4 = (rt.DIAG_GUIDES_SEED || []).find(g => g.id === 'dg_ge_mr_ellis_watts_ltl4_heat_exchanger');
  assert(!!ltl4, 'DIAG_GUIDES_SEED includes the Ellis & Watts LTL-4 heat exchanger guide');
  assert(ltl4 && ltl4.title === 'Ellis & Watts LTL-4 Heat Exchanger (GE MR mobiles, gradient coil cooling)' && ltl4.system === 'GE MRI',
    'LTL-4 guide title and system');
  const ltl4Facts = ['31 C (88 F) triggers the warmer than normal error', '36 C (97 F) will inhibit scanning',
    'gedit /usr/g/service/log/pcft.log', '(note the space between gedit and the first /)', '/usr/g/service/bin/startBoreViewer',
    'It works on 16.x and above for sure.', 'It does not work on 11.x and below.', 'Not tested on 12.x-15.x yet.',
    '110VAC +/- 10% single phase power', 'Current draw is 12.5A running with a max 75A start-up draw', 'at least 12-3 wire', '20A circuit',
    '50/50 glycol and maximum 52 F (11 C)', 'ambient temp up to 113 F', '3.3 GPM +/- 0.3 GPM', '35% Ethylyne glycol, 65% distilled water',
    '10-50 restarts of the LTL-4', 'Maximum outlet pressure is 60 PSI', 'Over 60 PSI = air bubbles', 'only operate 30 seconds',
    'If the pump/motor are not turning:', 'Cover on = short.  Cover off = open.', 'OK level = short.  Low level = open.',
    'below 100 F (37 C)', 'below 80 F (27 C)', 'water temp is below 100F', 'Flow under 1GPM will cause the pump to shut off',
    'Cycling power resets the time delay', 'At 100 lbs with 4 coolant lines attached', 'DOC1738330'];
  ltl4Facts.forEach(f => assert(ltl4 && ltl4.content.includes(f), 'LTL-4 guide keeps Mike\'s text exactly: ' + f));
  assert(ltl4 && ltl4.content.includes('(https://raw.githack.com/mikejackson-stack/AMT-GE-Manuals/main/Ellis%20Watts%20LTL-4/Ellis_Watts_LTL-4_Gradient_Water_Heat_Exchanger_Manual_ENG-457_Rev9.pdf)')
    && ltl4.content.includes('(https://www.scribd.com/document/366769606/Gradient-Water-Heat-Exchanger-Technical-Manual)')
    && ltl4.content.includes('(https://customer-doc.cloud.gehealthcare.com/#/cdp/dashboard)'),
    'LTL-4 guide links the AMT-GE-Manuals PDF (raw.githack) with Scribd and GE CDL backups');
  const ltl4Md = fs.readFileSync(path.join(__dirname, 'Manuals/All_Systems/Field_Guides/Ellis-Watts-LTL-4-heat-exchanger.md'), 'utf8').replace(/\n+$/, '');
  assert(ltl4 && ltl4.content === ltl4Md, 'LTL-4 seed content matches Manuals/All_Systems/Field_Guides/Ellis-Watts-LTL-4-heat-exchanger.md');
  ['LTL-4', 'LTL4', 'Ellis Watts', 'Ellis & Watts', 'heat exchanger', 'gradient cooling', 'patient comfort warmer than normal', 'pcft', 'coolant loss'].forEach(q => {
    const hits = rt.amtGuideHits(q, rt.DIAG_GUIDES_SEED);
    assert(hits.some(g => g.id === 'dg_ge_mr_ellis_watts_ltl4_heat_exchanger'),
      'amtGuideHits("' + q + '") hits the Ellis & Watts LTL-4 guide');
  });

  const pmTpl = (rt.DIAG_GUIDES_SEED || []).find(g => g.id === 'dg_amt_pm_service_agreement_template_v2');
  assert(!!pmTpl, 'DIAG_GUIDES_SEED includes the AMT PM Service Agreement Template (v2)');
  assert(pmTpl && pmTpl.title === 'AMT PM Service Agreement Template (v2)' && pmTpl.category === 'Templates' && pmTpl.readOnly === true,
    'PM agreement template title, category Templates, readOnly');
  const pmMd = fs.readFileSync(path.join(__dirname, 'Manuals/All_Systems/Templates/AMT_PM_Service_Agreement_Template_v2.md'), 'utf8').replace(/\n+$/, '');
  assert(pmTpl && pmTpl.content.includes(pmMd), 'PM agreement seed content contains Manuals/All_Systems/Templates/AMT_PM_Service_Agreement_Template_v2.md verbatim');
  assert(pmTpl && !pmTpl.content.includes('Houston'), 'PM agreement seed has no Houston');
  const mikeNote = 'NOTE FOR ' + 'MIKE';
  const notPart = 'NOT PART OF THE ' + 'AGREEMENT';
  const deleteNote = 'Delete this ' + 'note';
  [pmMd, pmTpl ? pmTpl.content : ''].forEach((t, i) => {
    const where = i ? 'seed' : 'md';
    assert(!t.includes(mikeNote) && !t.includes(notPart) && !t.includes(deleteNote),
      'PM agreement ' + where + ' has no internal note block');
    assert(!/\$\s?\d/.test(t), 'PM agreement ' + where + ' has no filled-in $ amounts');
    assert(!/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/.test(t), 'PM agreement ' + where + ' has no email addresses');
    assert(!/\(?\d{3}\)?[-. ]\d{3}[-. ]\d{4}/.test(t), 'PM agreement ' + where + ' has no phone numbers');
    assert(!/\d+ [A-Za-z ]+ (St|Street|Ave|Avenue|Rd|Road|Blvd|Dr|Drive|Ln|Lane|Ct|Pkwy|Hwy)\b/.test(t), 'PM agreement ' + where + ' has no street addresses');
  });
  ['## 1. Parties, Recitals, and Effective Date', '## 6. Corrective and Repair Work', '## 13. General Terms', '# Exhibit A: Equipment Schedule',
    '# Exhibit D: Business Associate Agreement', '$[__] per hour', 'Agreement No. [BLANK]'].forEach(f =>
    assert(pmTpl && pmTpl.content.includes(f), 'PM agreement template keeps: ' + f));
  ['service agreement', 'PM contract', 'agreement template', 'PM service agreement', 'contract template'].forEach(q => {
    const hits = rt.amtGuideHits(q, rt.DIAG_GUIDES_SEED);
    assert(hits.some(g => g.id === 'dg_amt_pm_service_agreement_template_v2'),
      'amtGuideHits("' + q + '") hits the AMT PM Service Agreement Template');
  });

  assert(artGuide && /2422232-1EN/.test(artGuide.content) && /2415542/.test(artGuide.content)
    && /9\.1 kg/.test(artGuide.content) && /2417403/.test(artGuide.content)
    && /no minimum patient size or weight/i.test(artGuide.content)
    && /#page=21/.test(artGuide.content) && /#page=32/.test(artGuide.content)
    && /#page=39/.test(artGuide.content),
    'image-artifact guide cites 2422232-1EN and keeps 2417403 missing');
  assert(artGuide && /moderate confidence, about 70%/.test(artGuide.content),
    'image-artifact guide keeps the CTL usage/positioning verdict');
  assert(/data-sys="GE Ultrasound"/.test(html) && /data-sys="GE Other"/.test(html),
    'guides pills include GE Ultrasound and GE Other');
  assert(/function openGeLoosePdf/.test(src) && /#page=/.test(src) && /kb\/ge-loose-kb\.json/.test(src),
    'loose library opens PDFs through ghOpenUrl with a page fragment');
  const ghOpenUrl = new Function(
    'const GH = ' + extractConst(src, 'GH') + ';\n'
    + extractFunction(src, 'ghIsHtmlManual') + '\n'
    + extractFunction(src, 'ghIsOfficeManual') + '\n'
    + extractFunction(src, 'ghOpenUrl') + '\n'
    + extractFunction(src, 'ghManualUrl') + '\n'
    + 'return {ghOpenUrl: ghOpenUrl, ghManualUrl: ghManualUrl};'
  )();
  const premierBase = 'https://raw.githack.com/mikejackson-stack/AMT-GE-Manuals/main/Signa%20PreMier/';
  const premierHtm = ghOpenUrl.ghOpenUrl('GE/Premier/index.htm');
  const premierHtml = ghOpenUrl.ghOpenUrl('GE/Premier/root/t_CalibratingHighOrderShim.HTML');
  const premierPdf = ghOpenUrl.ghOpenUrl('GE/Premier/root/figures/coil.pdf');
  const otherHtm = ghOpenUrl.ghOpenUrl('GE/Artist_EVO/index.htm');
  const loosePdf = ghOpenUrl.ghOpenUrl('GE/Loose/Operator Guide.pdf');
  assert(premierHtm === premierBase + 'index.htm',
    'Premier index.htm opens from AMT-GE-Manuals');
  assert(premierHtml === premierBase + 'root/t_CalibratingHighOrderShim.HTML',
    'Premier root HTML opens from AMT-GE-Manuals');
  assert(premierPdf === premierBase + 'root/figures/coil.pdf',
    'Premier PDFs under the set open from AMT-GE-Manuals on raw.githack');
  [
    'ACR_Accreditation_Scan_Measurements.pdf',
    'PAC-leakage-current-measurements.pdf',
    'ReplacementCalibrationRetestMatrix_Premier.pdf',
    'SIGNA_Premier_XT_MDP_Install_Operation_Service.pdf'
  ].forEach(name => {
    const kept = ghOpenUrl.ghOpenUrl('GE/Premier/' + name);
    assert(kept === 'https://rawcdn.githack.com/mikejackson-stack/AMT-Imaging-Service-App/main/Manuals/GE/Premier/' + name,
      'Premier loose PDF stays on this repo: ' + name);
  });
  assert(otherHtm === 'https://raw.githack.com/mikejackson-stack/AMT-Imaging-Service-App/main/Manuals/GE/Artist_EVO/index.htm',
    'ghOpenUrl returns raw.githack for other .htm manuals');
  assert(loosePdf === 'https://rawcdn.githack.com/mikejackson-stack/AMT-Imaging-Service-App/main/Manuals/GE/Loose/Operator%20Guide.pdf'
    && !/https:\/\/raw\.githack\.com\//.test(loosePdf),
    'ghOpenUrl returns rawcdn for .pdf');
  const office = ghOpenUrl.ghOpenUrl('Training Info/note.docx');
  const officeSrc = decodeURIComponent((office.split('src=')[1] || ''));
  assert(office.startsWith('https://view.officeapps.live.com/op/view.aspx?src=')
    && officeSrc === 'https://raw.githack.com/mikejackson-stack/AMT-Imaging-Service-App/main/Manuals/Training%20Info/note.docx',
    'Office viewer src uses raw.githack');
  assert(ghOpenUrl.ghManualUrl('GE/Premier/index.htm') === premierHtm,
    'ghManualUrl uses the same host rule as ghOpenUrl');
  assert(ghOpenUrl.ghManualUrl('') === '#', 'empty ghManualUrl stays a placeholder');
  assert(/var urls = \[rel, 'https:\/\/raw\.githack\.com\/'\+remoteBase, 'https:\/\/rawcdn\.githack\.com\/'\+remoteBase\]/.test(src),
    'kb loader still tries same-origin, then raw.githack, then rawcdn');
  assert(artGuide && /https:\/\/rawcdn\.githack\.com\/mikejackson-stack\/AMT-Imaging-Service-App\/main\/Manuals\/GE\/Loose\//.test(artGuide.content)
    && /#page=21/.test(artGuide.content),
    'existing PDF open_page links stay on rawcdn');
  assert(!/ge_2422232-1en_001/.test(src),
    'the 2.8 MB loose-entry corpus is not inlined in the app script');
  assert(Array.isArray(rt.GE_LOOSE_FILES) && rt.GE_LOOSE_FILES.length === 30,
    'GE loose browse list has 30 manuals');
  assert(rt.amtManualHits('versana').some(m => /GE\/Loose\//i.test(m.path) && /versana/i.test(m.name)),
    'manuals catalog lists the Versana loose PDF');
  assert(rt.amtManualHits('loose service').some(m => m.path === 'GE/Loose'),
    'GE browse fallback includes the Loose folder');
});

const looseEntries = JSON.parse(fs.readFileSync(path.join(__dirname, 'kb/ge-loose-kb.json'), 'utf8'));
const looseManifest = JSON.parse(fs.readFileSync(path.join(__dirname, 'kb/ge-loose-file-manifest.json'), 'utf8'));
assert(Array.isArray(looseEntries) && looseEntries.length === 2569, 'loose library has 2569 entries');
assert(Array.isArray(looseManifest) && looseManifest.length === 30, 'loose manifest has 30 files');

const { rt: looseRt, src: looseSrc } = loadSearchRuntime(path.join(__dirname, 'index.html'));
const rev = (looseSrc.match(/const GE_LOOSE_KB_REV = '([0-9a-f]+)'/) || [])[1];
const crypto = require('crypto');
const jsonSha = crypto.createHash('sha256').update(fs.readFileSync(path.join(__dirname, 'kb/ge-loose-kb.json'))).digest('hex');
assert(rev && jsonSha === rev, 'GE_LOOSE_KB_REV matches kb/ge-loose-kb.json sha256');

const byDoc = {};
looseEntries.forEach(e => { (byDoc[e.doc] || (byDoc[e.doc] = [])).push(e); });
Object.keys(byDoc).forEach(doc => {
  const hits = looseRt.amtGeLooseHits(doc, looseEntries, '');
  assert(hits.some(h => h.doc === doc), 'sample entry for doc ' + doc + ' is findable');
});

function looseCount(q, sys) {
  return looseRt.amtGeLooseHits(q, looseEntries, sys).length;
}
assert(looseCount('2415542', 'GE MRI') > 0 && looseCount('2415542', 'GE Ultrasound') === 0,
  "search '2415542' hits GE MRI and not GE Ultrasound");
assert(looseCount('HDCTL', 'GE MRI') > 0, "search 'HDCTL' hits GE MRI");
assert(looseCount('DOC2202091', 'GE MRI') > 0, "search 'DOC2202091' hits GE MRI");
assert(looseRt.amtGeLooseSystem('PET/MR') === 'GE MRI' && looseRt.amtGeLooseSystem('MRI') === 'GE MRI',
  'PET/MR and MRI modalities map to GE MRI');
assert(looseCount('DOC1807517', 'GE MRI') > 0 && looseCount('DOC1807517', 'GE Other') === 0,
  'existing PET/MR loose entries stay searchable as GE MRI');
assert(looseCount('Lytron', '') === 0, "search 'Lytron' is not in this batch");
assert(looseCount('F-50L', 'GE MRI') > 0 && looseCount('F-50L', 'GE Ultrasound') === 0,
  "search 'F-50L' hits GE MRI");
assert(looseCount('TEAL PDU', 'GE Other') > 0 && looseCount('TEAL PDU', 'GE MRI') === 0,
  "search 'TEAL PDU' is GE Other, not GE MRI");
assert(looseCount('Versana', 'GE Ultrasound') > 0 && looseCount('Versana', 'GE MRI') === 0,
  "search 'Versana' hits GE Ultrasound and not GE MRI");

const preserved = looseRt.amtGeLooseHits('2415542', looseEntries, 'GE MRI')
  .find(e => e.doc === '2422232-1EN' && String(e.body || '').includes('2415542'));
assert(!!preserved, '2415542 entry text is unchanged in the library JSON');

const paths = new Set(looseManifest.map(m => m.target_path));
looseEntries.forEach(e => {
  if (!paths.has(e.pdf_path)) fail('entry pdf_path not in manifest: ' + e.pdf_path);
});
if (!process.exitCode) ok('every loose entry pdf_path is in the file manifest');

const loosePy = spawnSync('python3', [path.join(__dirname, 'scripts/ge_loose_checks.py')], { encoding: 'utf8' });
const looseOut = ((loosePy.stdout || '') + (loosePy.stderr || '')).trim();
if (loosePy.status !== 0) fail('ge loose file checks failed\n' + looseOut);
else ok(looseOut.split('\n').slice(-1)[0] || 'ge loose file checks');

const signaPath = path.join(__dirname, 'kb/ge-signa-kb.json');
const signaEntries = JSON.parse(fs.readFileSync(signaPath, 'utf8'));
const signaSha = crypto.createHash('sha256').update(fs.readFileSync(signaPath)).digest('hex');
const signaRev = (looseSrc.match(/const GE_SIGNA_KB_REV = '([0-9a-f]+)'/) || [])[1];
assert(Array.isArray(signaEntries) && signaEntries.length === 9731, 'Signa library has 9731 entries');
assert(signaRev === '0efd8a6db4acef6c15e3040964acea2a1e8d20b72c3f7becd597ce4f87e484f1' && signaSha === signaRev,
  'GE_SIGNA_KB_REV matches kb/ge-signa-kb.json sha256');
const signaMod = {};
const signaSys = {};
signaEntries.forEach(e => {
  signaMod[e.modality] = (signaMod[e.modality] || 0) + 1;
  signaSys[e.product_system] = (signaSys[e.product_system] || 0) + 1;
  if (!e.open_url || !String(e.open_url).startsWith('https://raw.githack.com/mikejackson-stack/AMT-GE-Manuals/main/')) {
    fail('Signa entry missing AMT-GE-Manuals open_url: ' + e.id);
  }
});
assert(signaMod.MRI === 7957 && signaMod['PET/MR'] === 1774 && Object.keys(signaMod).length === 2,
  'Signa modalities are MRI 7957 and PET/MR 1774');
console.log('Signa entries by product_system:');
Object.keys(signaSys).sort((a, b) => signaSys[b] - signaSys[a]).forEach(k => {
  console.log('  ' + signaSys[k] + '\t' + k);
});

const combined = looseEntries.concat(signaEntries);
function combinedHits(q, sys) {
  return looseRt.amtGeLooseHits(q, combined, sys);
}
const rfHits = combinedHits('RF screen room door', '');
assert(rfHits.length > 0 && rfHits.every(e => String(e.open_url || '').includes('/AMT-GE-Manuals/')),
  "search 'RF screen room door' is Signa HTML pages");
const coldHits = combinedHits('cold head', '');
assert(coldHits.some(e => String(e.open_url || '').includes('/AMT-GE-Manuals/'))
  && coldHits.some(e => !e.open_url && /Manuals\/GE\/Loose\//.test(e.pdf_path || '')),
  "search 'cold head' returns Signa pages and loose PDFs");
const petHits = combinedHits('PETMR', 'GE MRI');
assert(petHits.some(e => e.modality === 'PET/MR' && String(e.open_url || '').includes('/AMT-GE-Manuals/')),
  "search 'PETMR' under GE MRI includes Signa PET/MR pages");
const sprintEntries = signaEntries.filter(e => String(e.pdf_path || '').startsWith('Signa Sprint/root/'));
assert(sprintEntries.length === 857 && sprintEntries.every(e => e.doc === '5982163-8EN' && e.modality === 'MRI'
  && String(e.open_url).startsWith('https://raw.githack.com/mikejackson-stack/AMT-GE-Manuals/main/Signa%20Sprint/root/')),
  'Signa Sprint has 857 entries (5982163-8EN) opening from AMT-GE-Manuals/Signa Sprint/root/');
['Sprint', 'SIGNA Sprint', 'Sprint Select Evo'].forEach(q => {
  const hits = combinedHits(q, 'GE MRI');
  assert(hits.filter(e => String(e.pdf_path || '').startsWith('Signa Sprint/')).length === 857,
    "search '" + q + "' under GE MRI returns all 857 Signa Sprint pages");
});
assert(combinedHits('Sprint', 'GE Ultrasound').length === 0, "search 'Sprint' has no GE Ultrasound hits");

const errToolPath = path.join(__dirname, 'kb/ge-error-tool-kb.json');
const errToolEntries = JSON.parse(fs.readFileSync(errToolPath, 'utf8'));
const errToolSha = crypto.createHash('sha256').update(fs.readFileSync(errToolPath)).digest('hex');
const errToolRev = (looseSrc.match(/const GE_ERRTOOL_KB_REV = '([0-9a-f]+)'/) || [])[1];
assert(Array.isArray(errToolEntries) && errToolEntries.length === 14313, 'Error Message Tool library has 14313 entries');
assert(errToolRev === '822bb1293333ab0914901ef6497a6ead6f7ab56b600bc17b8827b46ddca18da6' && errToolSha === errToolRev,
  'GE_ERRTOOL_KB_REV matches kb/ge-error-tool-kb.json sha256');
assert(new Set(errToolEntries.map(e => e.id)).size === errToolEntries.length
  && errToolEntries.every(e => e.modality === 'MRI' && e.category === 'fault_code' && e.doc === 'Error Message Tool'
    && String(e.open_url).startsWith('https://raw.githack.com/mikejackson-stack/AMT-GE-Manuals/main/GE%20Error%20Message%20Tool/root/ermes_')
    && String(e.open_url).endsWith('#' + e.anchor)),
  'Error Message Tool entries are unique MRI fault codes opening their #BM anchor in AMT-GE-Manuals');
const combinedErr = combined.concat(errToolEntries);
function errHits(q, sys) { return looseRt.amtGeLooseHits(q, combinedErr, sys); }
['2247373', '75004:2247373', '75004 : 2247373'].forEach(q => {
  const hits = errHits(q, 'GE MRI');
  assert(hits.length > 0 && hits[0].id === 'ge_errtool_2247373' && /UTNS\/Receiver Gain diagnostic failed/.test(hits[0].body),
    "search '" + q + "' under GE MRI puts Error Message Tool code 2247373 first");
});
assert(errHits('EM_ERROR_UTNS_GAIN_LEVEL', '')[0].id === 'ge_errtool_2247373', 'search by Ermes symbol finds 2247373');
assert(errHits('4000', 'GE MRI')[0].id === 'ge_errtool_4000', "search '4000' puts the exact Ermes code first");
assert(errHits('2247373', 'GE Ultrasound').length === 0, "search '2247373' has no GE Ultrasound hits");

const cardRt = new Function(
  'function amtAttr(s){ return String(s||"").replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;"); }\n'
  + 'function amtEscHtml(s){ return String(s==null?"":s).replace(/[&<>"\']/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;","\\"":"&quot;","\'":"&#39;"}[c]; }); }\n'
  + extractFunction(looseSrc, 'amtGeLooseSystem') + '\n'
  + extractFunction(looseSrc, 'amtGeLooseCatLabel') + '\n'
  + extractFunction(looseSrc, 'amtGeLooseCite') + '\n'
  + extractFunction(looseSrc, 'amtGeLooseCardHtml') + '\n'
  + extractFunction(looseSrc, 'amtGeLooseListHasSigna') + '\n'
  + extractFunction(looseSrc, 'amtGeLooseShown') + '\n'
  + extractFunction(looseSrc, 'amtGeLooseCardsHtml') + '\n'
  + 'return {amtGeLooseCardHtml: amtGeLooseCardHtml, amtGeLooseCardsHtml: amtGeLooseCardsHtml, amtGeLooseCite: amtGeLooseCite};'
)();
const rfCard = cardRt.amtGeLooseCardHtml(rfHits[0]);
assert(rfCard.includes('>Open page<') && rfCard.includes('data-open-url="' + rfHits[0].open_url + '"')
  && rfCard.includes(rfHits[0].doc) && rfCard.includes(rfHits[0].pdf_file)
  && !rfCard.includes('if the viewer does not jump') && !rfCard.includes('#page=') && !rfCard.includes('data-rel='),
  'Signa card opens the exact HTML URL and skips the PDF page note');
const anchored = signaEntries.find(e => String(e.open_url).includes('#'));
const anchorCard = cardRt.amtGeLooseCardHtml(anchored);
assert(anchorCard.includes('data-open-url="' + anchored.open_url + '"') && !anchorCard.includes('#page='),
  'Signa anchor stays on open_url and is not rewritten as #page=');
const petCards = cardRt.amtGeLooseCardsHtml(petHits);
assert(petCards.includes('Narrow the search.') && !petCards.includes('Manuals, GE, Loose'),
  'overflow hint stays generic when Signa entries are in the list');
const coldCards = cardRt.amtGeLooseCardsHtml(coldHits);
assert(coldCards.includes('>Open page<') && coldCards.includes('https://raw.githack.com/mikejackson-stack/AMT-GE-Manuals/')
  && coldCards.includes('Open PDF'),
  "search 'cold head' shows a Signa Open page card and a loose PDF card");
const tealCards = cardRt.amtGeLooseCardsHtml(looseRt.amtGeLooseHits('TEAL PDU', looseEntries, 'GE Other'));
assert(tealCards.includes('open the PDF from Manuals, GE, Loose.') && tealCards.includes('Open PDF'),
  'loose-only overflow still points at Manuals, GE, Loose');
const loosePdfEntry = looseRt.amtGeLooseHits('2415542', looseEntries, 'GE MRI')
  .find(e => e.doc === '2422232-1EN');
const looseCard = cardRt.amtGeLooseCardHtml(loosePdfEntry);
assert(looseCard.includes('Open PDF') && looseCard.includes('data-rel=') && looseCard.includes('if the viewer does not jump'),
  'loose PDF card still cites a page and opens through the PDF path');

const opened = [];
const openPdf = new Function(
  'window', 'ghOpenUrl',
  extractFunction(looseSrc, 'openGeLoosePdf') + '\nreturn openGeLoosePdf;'
)({ open: function(url, target, feat){ opened.push({ url: url, target: target, feat: feat }); } },
  function(rel){ return 'https://rawcdn.githack.com/mikejackson-stack/AMT-Imaging-Service-App/main/Manuals/' + rel; });
openPdf({ getAttribute: function(name){ return name === 'data-open-url' ? anchored.open_url : ''; } });
openPdf({ getAttribute: function(name){
  if (name === 'data-open-url') return '';
  if (name === 'data-rel') return 'GE/Loose/Operator Guide.pdf';
  if (name === 'data-page') return '14';
  return '';
} });
assert(opened[0] && opened[0].url === anchored.open_url && opened[0].target === '_blank' && opened[0].feat === 'noopener'
  && opened[0].url.indexOf('#page=') === -1,
  'openGeLoosePdf opens open_url exactly, with noopener, and does not append #page=');
assert(opened[1] && opened[1].url.endsWith('/Manuals/GE/Loose/Operator%20Guide.pdf') === false
  && opened[1].url.indexOf('GE/Loose/Operator Guide.pdf#page=14') !== -1
  && opened[1].url.indexOf('AMT-GE-Manuals') === -1,
  'openGeLoosePdf still opens loose PDFs through ghOpenUrl with #page=');

const sw = fs.readFileSync(path.join(__dirname, 'sw.js'), 'utf8');
assert(/const CACHE = 'amt-v54'/.test(sw), 'sw.js cache name is amt-v54');
const heroIndex = fs.readFileSync(path.join(__dirname, 'Manuals/GE/Signa Hero/index.html'), 'utf8');
const heroPremier = [
  'index.htm',
  'root/r_ts_ICEICN-Troubleshooting_16403080.html',
  'root/c_ICE_LEDs.html',
  'root/c_Host-ICN-Ethernet-Path_15625812.html',
  'root/r_TroubleshootingThePlatformIntegratedCoolingCabinetPICC.html'
];
heroPremier.forEach(rel => {
  assert(heroIndex.includes('https://raw.githack.com/mikejackson-stack/AMT-GE-Manuals/main/Signa%20PreMier/' + rel),
    'Signa Hero stub links Premier ' + rel + ' at AMT-GE-Manuals');
});
assert(heroIndex.includes('../Premier/SIGNA_Premier_XT_MDP_Install_Operation_Service.pdf')
  && !heroIndex.includes('Signa%20PreMier/SIGNA_Premier_XT_MDP_Install_Operation_Service.pdf'),
  'Signa Hero stub keeps the Premier XT MDP PDF on this repo');
assert(/const LIBRARY_KB_FILES = \[/.test(sw)
  && sw.includes("'/kb/ge-loose-kb.json'")
  && sw.includes("'/kb/ge-signa-kb.json'")
  && sw.includes("'/kb/ge-error-tool-kb.json'")
  && /if\(isLibraryKbUrl\(url\)\) return;/.test(sw)
  && /purgeLibraryKbCaches\(/.test(sw)
  && /function purgeLibraryKbFromCache/.test(sw),
  'sw.js skips Cache Storage for the GE library JSON and drops cached copies on activate');
assert(!/const SHELL = \[[^\]]*ge-(?:loose|signa|error-tool)-kb/.test(sw),
  'sw.js does not precache the GE library JSON');
const pagesYml = fs.readFileSync(path.join(__dirname, '.github/workflows/pages.yml'), 'utf8');
assert(/list_kb_json\(/.test(pagesYml) && /ge-signa-kb\.json/.test(pagesYml) && /ge-loose-kb\.json/.test(pagesYml)
  && /ge-error-tool-kb\.json/.test(pagesYml),
  'Pages workflow publishes kb JSON and checks the Signa and Error Message Tool libraries');
const standalone = fs.readFileSync(path.join(__dirname, 'AMT-Imaging-App-standalone.html'), 'utf8');
assert(standalone.includes("const GE_SIGNA_KB_REV = '" + signaRev + "'") && standalone.includes("geLooseReadIdbKey('signa')"),
  'standalone app loads and caches the Signa library');
assert(standalone.includes("const GE_ERRTOOL_KB_REV = '" + errToolRev + "'") && standalone.includes("geLooseReadIdbKey('errtool')"),
  'standalone app loads and caches the Error Message Tool library');

function makeLibraryIdb(store) {
  function later(fill) {
    const req = {};
    queueMicrotask(() => {
      fill(req);
      if (req.onsuccess) req.onsuccess();
    });
    return req;
  }
  return {
    open() {
      return later((req) => {
        req.result = {
          objectStoreNames: { contains() { return true; } },
          transaction() {
            const tx = {
              objectStore() {
                return {
                  get(key) { return later((g) => { g.result = store[key]; }); },
                  put(val, key) { store[key] = val; return {}; }
                };
              }
            };
            Object.defineProperty(tx, 'oncomplete', { set(fn) { queueMicrotask(fn); } });
            Object.defineProperty(tx, 'onerror', { set() {} });
            return tx;
          }
        };
      });
    }
  };
}

const libraryRunner = new Function(
  'GH', 'fetch', 'indexedDB', 'console',
  [
    'var geLooseEntries = null; var geLooseLoadPromise = null; var geLooseLoadError = "";',
    'const GE_LOOSE_KB_REV = "loose-rev";',
    'const GE_SIGNA_KB_REV = "signa-rev";',
    'const GE_ERRTOOL_KB_REV = "errtool-rev";',
    extractFunction(looseSrc, 'amtGeLoosePrepare'),
    extractFunction(looseSrc, 'geLooseIdb'),
    extractFunction(looseSrc, 'geLooseReadIdbKey'),
    extractFunction(looseSrc, 'geLooseSaveIdbKey'),
    extractFunction(looseSrc, 'geLooseReadIdb'),
    extractFunction(looseSrc, 'geLooseSaveIdb'),
    extractFunction(looseSrc, 'geSignaReadIdb'),
    extractFunction(looseSrc, 'geSignaSaveIdb'),
    extractFunction(looseSrc, 'geErrToolReadIdb'),
    extractFunction(looseSrc, 'geErrToolSaveIdb'),
    extractFunction(looseSrc, 'geKbFetchRel'),
    extractFunction(looseSrc, 'geLooseFetchText'),
    extractFunction(looseSrc, 'geSignaFetchText'),
    extractFunction(looseSrc, 'geErrToolFetchText'),
    extractFunction(looseSrc, 'geKbTextOrCache'),
    extractFunction(looseSrc, 'ensureGeLooseKB'),
    'return function(){ return {get entries(){ return geLooseEntries; }, get error(){ return geLooseLoadError; }, load: ensureGeLooseKB, reset: function(){ geLooseEntries = null; geLooseLoadPromise = null; geLooseLoadError = ""; }}; };'
  ].join('\n')
);

function libraryFetch(looseText, signaText, errToolText) {
  return async function(url) {
    const rel = String(url);
    const text = rel.includes('ge-signa-kb.json') ? signaText
      : (rel.includes('ge-loose-kb.json') ? looseText
      : (rel.includes('ge-error-tool-kb.json') ? (errToolText === undefined ? null : errToolText) : null));
    if (text == null) throw new Error('unavailable ' + rel);
    return { ok: true, status: 200, async text() { return text; } };
  };
}

function runLibraryCase(looseText, signaText, store, errToolText) {
  const state = libraryRunner(
    { org: 'mikejackson-stack', repo: 'AMT-Imaging-Service-App', branch: 'main' },
    libraryFetch(looseText, signaText, errToolText),
    makeLibraryIdb(store),
    { warn() {} }
  )();
  state.reset();
  return new Promise((resolve) => {
    state.load(() => setTimeout(() => resolve({ entries: state.entries, error: state.error, store: store }), 30));
  });
}

runLibraryCase('[{"id":"loose"}]', null, {}).then((signaMiss) => {
  assert(signaMiss.entries.length === 1 && signaMiss.entries[0].id === 'loose' && !signaMiss.error,
    'Signa fetch failure still shows the loose library');
  assert(signaMiss.store.library && signaMiss.store.library.rev === 'loose-rev' && !signaMiss.store.signa,
    'a successful loose download is cached under library');
  return runLibraryCase(null, null, {
    library: { rev: 'loose-rev', text: '[{"id":"cached-loose"}]' },
    signa: { rev: 'signa-rev', text: '[{"id":"cached-signa"}]' }
  });
}).then((offline) => {
  assert(offline.entries.length === 2 && offline.entries[0].id === 'cached-loose' && offline.entries[1].id === 'cached-signa',
    'offline fallback concatenates cached loose and Signa libraries');
  return runLibraryCase('[{"id":"loose"}]', '[{"id":"signa"}]', {});
}).then((both) => {
  assert(both.entries.length === 2 && both.entries[1].id === 'signa'
    && both.store.signa && both.store.signa.rev === 'signa-rev' && both.store.signa.text === '[{"id":"signa"}]',
    'both libraries load and Signa text is cached under signa with its rev');
  return runLibraryCase('[{"id":"loose"}]', '[{"id":"signa"}]', {}, '[{"id":"errtool"}]');
}).then((three) => {
  assert(three.entries.length === 3 && three.entries[2].id === 'errtool'
    && three.store.errtool && three.store.errtool.rev === 'errtool-rev',
    'Error Message Tool library loads after Signa and is cached under errtool with its rev');
  return runLibraryCase(null, '[{"id":"signa"}]', {});
}).then((looseMiss) => {
  assert(Array.isArray(looseMiss.entries) && looseMiss.entries.length === 0 && /Could not download/.test(looseMiss.error),
    'a loose failure with no cache still reports the library as unavailable');
  if (process.exitCode) {
    console.log('\nSome checks failed.');
    process.exit(1);
  }
  console.log('\nAll kb-search honesty checks passed.');
}).catch((err) => {
  console.error(err);
  process.exit(1);
});
