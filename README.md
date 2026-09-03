# AMT Imaging Service App

Field service web app for **AMT Imaging Solutions LLC** (Fort Lauderdale, FL).

**Live:** https://mikejackson-stack.github.io/AMT-Imaging-Service-App/

This is not a greenfield project. Production is GitHub Pages (`index.html` + `rates.json` + `sw.js`) plus Firebase project **`amt-imaging-service-app`** (staff Google login, Firestore sync, staff-only Ask Grok callable). The `Manuals/` tree is large (multi-GB) and is **not** what Pages deploys.

## What matters

| Path | Role |
|------|------|
| `index.html` | The app (HTML/CSS/JS). Edit this. |
| `AMT-Imaging-App-standalone.html` | Downloadable copy — keep in sync with `index.html` for logic changes. |
| `rates.json`, `sw.js` | Deployed with Pages. |
| `functions/` | Firebase Cloud Functions (`askGrok`). Holds **no** xAI key. |
| `kb-search-checks.js` | Honesty checks for knowledge search (no Manuals clone). |
| `firebase.json`, `.firebaserc` | Firebase project `amt-imaging-service-app`. |
| `scripts/serve.py` | Local/dev static server (Pages files only). |
| `scripts/check.sh` | Syntax + search + functions checks. |

Do **not** commit `XAI_API_KEY`, Firebase Admin keys, service-account JSON, or a real `.env` / `.secret.local`. Ask Grok stays a staff-only callable. **PIN login cannot call it** (no Firebase Auth token).

## How Mike starts the environment

### Laptop (and any Cursor local/dev session)

Needs Python 3 and Node.js 20+ (Node 20 is what `functions/package.json` pins).

```bash
# 1) Functions deps (idempotent)
cd functions && npm ci && cd ..

# 2) Checks
./scripts/check.sh

# 3) Serve the same files Pages serves (does not walk Manuals/)
python3 scripts/serve.py
```

Open **http://127.0.0.1:8080/**

- **PIN login** works on localhost. Use it for UI, jobs, money, manuals search.
- **Google login** uses the GIS button on the current origin. Add `http://localhost:8080` as an authorized JavaScript origin on the existing Google OAuth client if the button fails. The fallback redirect still returns to the hosted Pages URL (that is intentional so localhost does not break Google’s registered redirect).
- **Hosted Firebase** is the default: Auth, Firestore, and Ask Grok hit project `amt-imaging-service-app`, same as production. You do not need emulators to run the app.
- **Ask Grok:** Google-sign-in as staff on the hosted Firebase app. PIN users see a warning and the callable rejects unauthenticated calls.

`file://` is not a supported Google-login origin. Serve with `scripts/serve.py` (or open the live Pages URL).

### Cursor Cloud Agent

After this environment is saved, a new agent:

1. Runs `cd functions && npm ci` (install).
2. Serves the app with `python3 scripts/serve.py --bind 0.0.0.0 --port 8080` (start).
3. You open port **8080**.

Same rules as laptop: PIN for local UI; hosted Firebase for Google / Ask Grok; no secrets in the repo.

### Optional: functions emulator (Ask Grok source without deploy)

Default local/dev should **not** use this. Use it only when changing `functions/`.

1. Install the [Firebase CLI](https://firebase.google.com/docs/cli): `npm install -g firebase-tools` (or `npx firebase-tools`).
2. Create **gitignored** `functions/.secret.local` with `XAI_API_KEY=...` (emulator secret override; [docs](https://firebase.google.com/docs/emulator-suite/connect_functions)). Never commit that file.
3. From the repo root:

```bash
firebase emulators:start --only functions --project amt-imaging-service-app
```

4. Serve the app and open `http://127.0.0.1:8080/?functionsEmulator=1`  
   The query param is ignored unless the hostname is `localhost` or `127.0.0.1`.
5. Google-sign-in still talks to **hosted** Auth. PIN still cannot call Ask Grok.

Without `?functionsEmulator=1`, Ask Grok uses the **deployed** callable in `us-central1`.

## Firebase in production vs dev

| Piece | Production (Pages) | Default local/dev | Optional emulator |
|-------|--------------------|-------------------|-------------------|
| Static app | GitHub Pages | `scripts/serve.py` | same |
| Auth / Firestore | Hosted `amt-imaging-service-app` | Hosted (same) | not emulated by default |
| `askGrok` | Hosted callable `us-central1` | Hosted callable | `127.0.0.1:5001` only with `?functionsEmulator=1` |
| `XAI_API_KEY` | Cloud Secret Manager | not in repo | `functions/.secret.local` (gitignored) |

Deploy functions (from a machine with Firebase access — not from Pages CI):

```bash
firebase functions:secrets:set XAI_API_KEY
firebase deploy --only functions
```

GitHub Pages workflow (`.github/workflows/pages.yml`) curls **only** `index.html`, `rates.json`, and `sw.js`. It must never publish `functions/` or secrets.

## Checks before a PR

```bash
./scripts/check.sh
```

That runs:

- `node --check` on the extracted app script (both HTML files)
- `#panel-manuals` must stay inside `#contentArea`
- `node kb-search-checks.js`
- `npm run check` in `functions/` (no API key needed)

## Product constraints

Do not redesign the product, add QuickBooks, or change pricing/margin/ownership rules (Michael 51%, Antonio 24.5%, Candelario 24.5%; tax set-aside 30%). Last merge to `main` stays a human yes. GitHub writer is `mikejackson-stack`.
