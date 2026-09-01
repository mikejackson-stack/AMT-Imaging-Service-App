'use strict';

// Staff emails already used by the public app for Google sign-in.
// Kept here so the callable does not trust the client. Not a secret.
const STAFF_EMAILS = new Set([
  'mike.jackson@amtimagingsolutions.com',
  'antonio@amtimagingsolutions.com',
  'tito@amtimagingsolutions.com',
  'misemilyoliveros@icloud.com',
]);

const MAX_QUERY_CHARS = 800;

// Refuse pasted credentials / tokens. Do not block normal field terms
// such as "PIN diode" or "helium pressure".
const SECRET_LIKE = /ghp_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,}|sk-[A-Za-z0-9]{20,}|xai-[A-Za-z0-9_-]{10,}|AIza[A-Za-z0-9_-]{20,}|Bearer\s+[A-Za-z0-9._\-]{20,}/i;

function staffEmail(email) {
  return STAFF_EMAILS.has(String(email || '').toLowerCase().trim());
}

function prepareGrokQuery(raw) {
  const query = String(raw || '').replace(/\s+/g, ' ').trim();
  if (!query) {
    return { ok: false, code: 'invalid-argument', message: 'Enter an error code, symptom, or PM question.' };
  }
  if (query.length < 2) {
    return { ok: false, code: 'invalid-argument', message: 'Search is too short.' };
  }
  if (query.length > MAX_QUERY_CHARS) {
    return { ok: false, code: 'invalid-argument', message: 'Search is too long.' };
  }
  if (SECRET_LIKE.test(query)) {
    return { ok: false, code: 'invalid-argument', message: 'Do not paste keys, tokens, or credentials into Grok search.' };
  }
  return { ok: true, query };
}

const SYSTEM_PROMPT = [
  'You are a backup field-service assistant for MRI/CT engineers at AMT Imaging Solutions.',
  'Answer ONLY questions about MRI, CT, injectors, error codes, troubleshooting, PM, and service manuals.',
  'Refuse requests about money, P&L, invoices, profit share, PINs, passwords, tokens, API keys, or anything unrelated to field service.',
  'Keep answers concise and practical for a tech on site: likely causes, what to check, safety notes.',
  'Always state that the answer is unverified and is not a substitute for the OEM service manual.',
  'If you are unsure, say so and tell the tech to open the OEM manual before working the system.',
].join(' ');

module.exports = {
  STAFF_EMAILS,
  MAX_QUERY_CHARS,
  staffEmail,
  prepareGrokQuery,
  SYSTEM_PROMPT,
};
