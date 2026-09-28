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

const sw = fs.readFileSync(path.join(__dirname, 'sw.js'), 'utf8');
assert(/const CACHE = 'amt-v37'/.test(sw), 'sw.js cache name is amt-v37');
assert(!/kb\/ge-loose-kb\.json/.test(sw), 'sw.js does not precache the GE loose library JSON');

if (process.exitCode) {
  console.log('\nSome checks failed.');
  process.exit(1);
}
console.log('\nAll kb-search honesty checks passed.');
