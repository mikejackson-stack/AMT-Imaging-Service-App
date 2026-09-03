# AMT Grok backup search (Firebase Functions)

The GitHub Pages app (`index.html`) must **never** contain an xAI / Grok / OpenAI key.
This callable holds the key in Cloud Secret Manager and only answers signed-in staff.

## What Mike has to do (not done by this PR)

The public repo can ship the function **source**. It cannot set the secret or deploy to Firebase.

1. Blaze (pay-as-you-go) plan is required for Cloud Functions + Secret Manager.
2. From a machine with Firebase CLI access to `amt-imaging-service-app`:

```bash
firebase functions:secrets:set XAI_API_KEY
# paste the xAI key when prompted (do not put it in git)

firebase deploy --only functions
```

3. Confirm the function `askGrok` is in `us-central1` and allows unauthenticated Cloud Run invoke (`invoker: 'public'` in `functions/index.js`). Staff auth is still checked inside the function.
4. The hosted app must call `firebase.app().functions('us-central1').httpsCallable('askGrok')` (compat SDK default region is easy to get wrong for 2nd-gen).
5. In the hosted app, Google-sign-in as staff, search something the in-app KB misses, then tap **Ask Grok**.

Do **not** add `functions/` to the GitHub Pages workflow curl list. Pages only serves `index.html`, `rates.json`, and `sw.js`.

## Behavior

- Unauthenticated calls fail.
- Email must match the same staff Google accounts the app already uses.
- Calls `https://api.x.ai/v1/chat/completions` with model `grok-4.6`.
- Prompts are field-tech only (errors, troubleshooting, PM/guides). Money / P&L / PIN / token payloads are not sent.
- The app UI labels every Grok answer **unverified** and **not a substitute for the OEM manual**.
- PIN login has no Firebase Auth token, so **Ask Grok** requires Google sign-in.

## Local check (no key needed)

From the **repo root** (see also the root `README.md`):

```bash
./scripts/check.sh
```

Or just this package:

```bash
cd functions
npm ci
npm run check
```

Default app serving (`python3 scripts/serve.py`) talks to the **hosted** `askGrok` callable. To exercise this source without deploying, use the functions emulator and open the app with `?functionsEmulator=1` on localhost — details in the root README. Put `XAI_API_KEY` in gitignored `functions/.secret.local` for the emulator; never commit it.
