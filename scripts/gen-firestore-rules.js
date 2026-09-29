#!/usr/bin/env node
/**
 * Generate firestore.rules from access-config.js.
 * Run: node scripts/gen-firestore-rules.js
 * scripts/access_checks.js fails if the committed rules drift from this output.
 */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');

function loadAccessConfig() {
  const src = fs.readFileSync(path.join(ROOT, 'access-config.js'), 'utf8');
  const sandbox = { console };
  vm.runInNewContext(src + '\nthis.ACCESS_CONFIG = ACCESS_CONFIG;\n', sandbox, { filename: 'access-config.js' });
  const cfg = sandbox.ACCESS_CONFIG;
  if (!cfg || !Array.isArray(cfg.WRITERS) || !Array.isArray(cfg.READERS)) {
    throw new Error('ACCESS_CONFIG.WRITERS and ACCESS_CONFIG.READERS are required');
  }
  return cfg;
}

function quoteList(emails) {
  return emails.map(email => "        '" + email + "'").join(',\n');
}

function renderRules(cfg) {
  const writers = cfg.WRITERS.map(email => String(email).trim());
  const readers = cfg.READERS.map(email => String(email).trim());
  writers.concat(readers).forEach(email => {
    if (email !== email.toLowerCase()) throw new Error('access list email is not lowercase: ' + email);
    if (!email.includes('@')) throw new Error('access list email is missing @: ' + email);
  });
  const readerFn = readers.length
    ? [
        '    function isReader() {',
        '      return isWriter() || (signedIn() && email() in [',
        quoteList(readers),
        '      ]);',
        '    }'
      ].join('\n')
    : [
        '    function isReader() {',
        '      return isWriter();',
        '    }'
      ].join('\n');
  return [
    "rules_version = '2';",
    '// Generated from access-config.js by scripts/gen-firestore-rules.js.',
    '// WRITERS may read and write. READERS may read. Everyone else is denied.',
    '// READERS: ' + (readers.length ? readers.join(', ') : '(none)') + '.',
    'service cloud.firestore {',
    '  match /databases/{database}/documents {',
    '    function signedIn() {',
    '      return request.auth != null',
    '        && request.auth.token.email_verified == true;',
    '    }',
    '    function email() {',
    '      return request.auth.token.email.lower();',
    '    }',
    '    function isWriter() {',
    '      return signedIn() && email() in [',
    quoteList(writers),
    '      ];',
    '    }',
    readerFn,
    '    match /companies/amt/data/{docId} {',
    '      allow read: if isReader();',
    '      allow write: if isWriter();',
    '    }',
    '    match /pinHashes/{staffId} {',
    '      allow read, write: if isWriter();',
    '    }',
    '    match /{document=**} {',
    '      allow read, write: if false;',
    '    }',
    '  }',
    '}',
    ''
  ].join('\n');
}

function main() {
  const rules = renderRules(loadAccessConfig());
  fs.writeFileSync(path.join(ROOT, 'firestore.rules'), rules);
  console.log('Wrote firestore.rules');
}

module.exports = { loadAccessConfig, renderRules };

if (require.main === module) main();
