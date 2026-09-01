'use strict';

const assert = require('assert');
const { staffEmail, prepareGrokQuery, SYSTEM_PROMPT } = require('./query-guard');

assert.strictEqual(staffEmail('mike.jackson@amtimagingsolutions.com'), true);
assert.strictEqual(staffEmail('MIKE.JACKSON@amtimagingsolutions.com'), true);
assert.strictEqual(staffEmail('nobody@example.com'), false);
assert.strictEqual(staffEmail(''), false);

assert.strictEqual(prepareGrokQuery('').ok, false);
assert.strictEqual(prepareGrokQuery('q').ok, false);
assert.strictEqual(prepareGrokQuery('  MCP820-NVRAM  ').ok, true);
assert.strictEqual(prepareGrokQuery('  MCP820-NVRAM  ').query, 'MCP820-NVRAM');
assert.strictEqual(prepareGrokQuery('PIN diode bias on body coil').ok, true);
assert.ok(!prepareGrokQuery('xai-abcdefghijklmnopqrstuvwxyz').ok);
assert.ok(!prepareGrokQuery('Bearer abcdefghijklmnopqrstuvwxyz0123').ok);
assert.ok(!prepareGrokQuery('a'.repeat(900)).ok);

assert.ok(/unverified/i.test(SYSTEM_PROMPT));
assert.ok(/OEM service manual/i.test(SYSTEM_PROMPT));
assert.ok(/P&L/i.test(SYSTEM_PROMPT));

console.log('query-guard tests passed');
