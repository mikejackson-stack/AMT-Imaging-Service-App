'use strict';

const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { defineSecret } = require('firebase-functions/params');
const { setGlobalOptions } = require('firebase-functions/v2');
const { staffEmail, prepareGrokQuery, SYSTEM_PROMPT } = require('./query-guard');

setGlobalOptions({
  region: 'us-central1',
  maxInstances: 5,
});

// Bound on the callable. Mike sets this in Secret Manager — never commit a value.
const xaiApiKey = defineSecret('XAI_API_KEY');

exports.askGrok = onCall(
  {
    secrets: [xaiApiKey],
    cors: true,
    // Cloud Run IAM must allow unauthenticated invoke so the Firebase JS SDK
    // can reach the callable; staff auth is still enforced via request.auth.
    invoker: 'public',
    timeoutSeconds: 60,
    memory: '256MiB',
  },
  async (request) => {
    if (!request.auth || !request.auth.token) {
      throw new HttpsError('unauthenticated', 'Sign in with Google to use Ask Grok.');
    }
    const email = String(request.auth.token.email || '').toLowerCase().trim();
    if (!staffEmail(email)) {
      throw new HttpsError('permission-denied', 'This account is not allowed to use Ask Grok.');
    }

    const prepared = prepareGrokQuery(request.data && request.data.query);
    if (!prepared.ok) {
      throw new HttpsError(prepared.code, prepared.message);
    }

    const apiKey = xaiApiKey.value();
    if (!apiKey) {
      throw new HttpsError(
        'failed-precondition',
        'XAI_API_KEY is not set. Run firebase functions:secrets:set XAI_API_KEY then firebase deploy --only functions.'
      );
    }

    let resp;
    try {
      resp = await fetch('https://api.x.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer ' + apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'grok-4.6',
          temperature: 0.2,
          max_tokens: 1200,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: prepared.query },
          ],
        }),
      });
    } catch (err) {
      console.error('askGrok xAI network error', err && err.message);
      throw new HttpsError('unavailable', 'Could not reach Grok. Try again in a moment.');
    }

    let body = {};
    try {
      body = await resp.json();
    } catch (err) {
      throw new HttpsError('unavailable', 'Grok returned an unreadable response.');
    }

    if (!resp.ok) {
      console.error('askGrok xAI HTTP', resp.status);
      if (resp.status === 401 || resp.status === 403) {
        throw new HttpsError('failed-precondition', 'Grok rejected the API key. Check XAI_API_KEY in Secret Manager.');
      }
      throw new HttpsError('unavailable', 'Grok is unavailable right now (HTTP ' + resp.status + ').');
    }

    const answer = body && body.choices && body.choices[0] && body.choices[0].message
      ? String(body.choices[0].message.content || '').trim()
      : '';
    if (!answer) {
      throw new HttpsError('unavailable', 'Grok returned an empty answer.');
    }

    return {
      answer,
      model: 'grok-4.6',
      unverified: true,
      disclaimer: 'Unverified AI answer. Not a substitute for the OEM service manual.',
    };
  }
);
