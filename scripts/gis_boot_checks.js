#!/usr/bin/env node
/**
 * Google sign-in must render whether GIS finishes before or after the app script.
 * Run: node scripts/gis_boot_checks.js
 */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');
const FILES = ['index.html', 'AMT-Imaging-App-standalone.html'];

function fail(msg) {
  console.error('FAIL:', msg);
  process.exit(1);
}
function ok(msg) { console.log('OK  ', msg); }

function sliceBetween(html, start, end, label) {
  const i = html.indexOf(start);
  const j = html.indexOf(end, i + start.length);
  if (i < 0 || j < 0) fail(label + ' markers missing');
  return html.slice(i, j + end.length);
}

function fakeDocument() {
  function node(tag) {
    return {
      tag,
      style: { display: '' },
      children: [],
      appendChild(child) { this.children.push(child); return child; },
      querySelector(sel) {
        const want = sel.indexOf('iframe') >= 0 ? 'iframe' : '';
        const walk = (n) => {
          if (want && n.tag === want) return n;
          for (const child of n.children) {
            const hit = walk(child);
            if (hit) return hit;
          }
          return null;
        };
        return walk(this);
      }
    };
  }
  const signin = node('div');
  const fb = node('button');
  fb.style.display = 'none';
  const map = { g_id_signin: signin, googleFallbackBtn: fb };
  return {
    signin,
    fb,
    getElementById(id) { return map[id] || null; },
    createElement(tag) { return node(tag); }
  };
}

function makeGoogle(doc) {
  const google = {
    accounts: {
      id: {
        renders: 0,
        initialize() {},
        renderButton(el) {
          google.accounts.id.renders += 1;
          el.appendChild(doc.createElement('iframe'));
        }
      }
    }
  };
  return google;
}

function bootContext(doc) {
  const sandbox = {
    console,
    setTimeout,
    clearTimeout,
    setInterval,
    clearInterval,
    document: doc,
    GOOGLE_CLIENT_ID: 'test-client',
    amtGoogleCallback() {},
    __amtGisLoaded: false,
    __amtGisButtonReady: false
  };
  sandbox.window = sandbox;
  vm.createContext(sandbox);
  return sandbox;
}

function buttonCount(doc) {
  return doc.signin.children.filter(child => child.tag === 'iframe').length;
}

function runOrder(label, flagSrc, bootSrc, order) {
  const doc = fakeDocument();
  const sandbox = bootContext(doc);
  vm.runInContext(flagSrc, sandbox);
  if (order === 'gis-first') {
    const google = makeGoogle(doc);
    sandbox.google = google;
    sandbox.window.google = google;
    vm.runInContext('amtMarkGisLoaded();', sandbox);
    if (typeof sandbox.initGIS !== 'undefined') fail(label + ' initGIS existed before the app script');
    if (buttonCount(doc) !== 0) fail(label + ' rendered before the app script');
    vm.runInContext(bootSrc, sandbox);
  } else if (order === 'app-first') {
    vm.runInContext(bootSrc, sandbox);
    if (buttonCount(doc) !== 0) fail(label + ' rendered before GIS loaded');
    const google = makeGoogle(doc);
    sandbox.google = google;
    sandbox.window.google = google;
    vm.runInContext('amtMarkGisLoaded();', sandbox);
  } else {
    fail('unknown order ' + order);
  }
  if (buttonCount(doc) !== 1) fail(label + ' ' + order + ' expected one Google button, got ' + buttonCount(doc));
  if (!sandbox.__amtGisButtonReady) fail(label + ' ' + order + ' did not mark the button ready');
  ok(label + ' ' + order + ' shows the Google button');
}

function runFailure(label, flagSrc, bootSrc) {
  const doc = fakeDocument();
  const sandbox = bootContext(doc);
  vm.runInContext(flagSrc, sandbox);
  vm.runInContext(bootSrc, sandbox);
  return new Promise(resolve => {
    setTimeout(() => {
      if (buttonCount(doc) !== 0) fail(label + ' rendered a button without GIS');
      if (doc.fb.style.display !== 'flex') fail(label + ' did not show the backup Google button when GIS failed');
      ok(label + ' shows the backup Google button when GIS does not load');
      resolve();
    }, 4500);
  });
}

const extracted = FILES.map(name => {
  const html = fs.readFileSync(path.join(ROOT, name), 'utf8');
  if (/onload="initGIS\(\)"/.test(html)) fail(name + ' still calls initGIS from the GIS script onload');
  const flagAt = html.indexOf('function amtMarkGisLoaded()');
  const gsiAt = html.indexOf('https://accounts.google.com/gsi/client');
  if (flagAt < 0 || gsiAt < 0 || flagAt > gsiAt) fail(name + ' must define amtMarkGisLoaded before the GIS script');
  if (!html.includes('onload="amtMarkGisLoaded()"')) fail(name + ' GIS onload must only mark the script loaded');
  if (!/\.pin-row\{[^}]*min-width:0/.test(html)) fail(name + ' PIN row can still force the login card wider');
  if (!/\.pin-input\{[^}]*min-width:0/.test(html)) fail(name + ' PIN input is missing min-width:0');
  if (!/\.pin-input\{[^}]*font-size:16px/.test(html)) fail(name + ' PIN input font must stay at least 16px');
  if (!/\.btn-pin-go\{[^}]*font-size:16px/.test(html)) fail(name + ' Unlock button font must stay at least 16px');
  const flagSrc = sliceBetween(html, 'window.__amtGisLoaded=false;', "if(typeof window.amtTryInitGIS==='function') window.amtTryInitGIS();\n}", name + ' flag');
  const bootSrc = sliceBetween(html, 'function showGoogleFallback(){', 'amtBootGoogleButton();', name + ' boot');
  ok(name + ' GIS onload no longer depends on initGIS');
  return { name, flagSrc, bootSrc };
});

if (extracted[0].flagSrc !== extracted[1].flagSrc || extracted[0].bootSrc !== extracted[1].bootSrc) {
  fail('Google button boot code differs between index.html and the standalone file');
}

const { flagSrc, bootSrc } = extracted[0];
runOrder('both files', flagSrc, bootSrc, 'gis-first');
runOrder('both files', flagSrc, bootSrc, 'app-first');
runFailure('both files', flagSrc, bootSrc).then(() => {
  ok('Google button load orders covered');
});
