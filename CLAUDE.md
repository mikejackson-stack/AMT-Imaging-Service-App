# AMT Imaging Solutions — Field Service Web App
## Claude Code Project Handoff Document

---

## Project Overview

Single-file HTML/JS/CSS progressive web app for MRI/CT field service management.
Built for **AMT Imaging Solutions LLC**, a veteran-owned MRI/CT field service company
based in Fort Lauderdale, FL.

**Owners:**
- Michael Jackson — 51% (mike.jackson@amtimagingsolutions.com)
- Antonio Jackson — 24.5% (antonio@amtimagingsolutions.com)
- Candelario Juarez — 24.5% (tito@amtimagingsolutions.com)

---

## Critical Files & Locations

| Item | Location |
|------|----------|
| **Main app file** | `index.html` (single file — entire app) |
| **Standalone download** | `AMT-Imaging-App-standalone.html` (must be kept in sync with `index.html`) |
| **Live URL** | https://mikejackson-stack.github.io/AMT-Imaging-Service-App/ |
| **GitHub repo** | https://github.com/mikejackson-stack/AMT-Imaging-Service-App |
| **Branch** | `main` |
| **Deployment** | GitHub Pages (auto-deploys on push to main) |

The entire app is **one HTML file** (`index.html`). No build step, no framework.
Pages deploy = `index.html`, `rates.json`, `sw.js` (see `.github/workflows/pages.yml`). Firebase functions live in `functions/` and are deployed separately.

**Important:** `AMT-Imaging-App-standalone.html` is a downloadable copy of the app.
Any logic change to `index.html` must also be applied to the standalone file.

**Local / Cloud Agent run:** see root `README.md` (`python3 scripts/serve.py`, hosted Firebase by default). Do not serve the multi-GB `Manuals/` tree as the app.

---

## Architecture

```
index.html
├── <style>          — All CSS (CSS variables, mobile/desktop layout, components)
├── <body>
│   ├── #loginScreen — Google OAuth + PIN login UI
│   ├── #mainApp
│   │   ├── #topBar          — Logo, user name, date, sign out
│   │   ├── #desktopNav      — Left sidebar (desktop only, 220px wide)
│   │   ├── #mobileNav       — Bottom tab bar (mobile only)
│   │   └── #contentArea     — All panels rendered here
│   │       ├── #panel-dash
│   │       ├── #panel-newjob
│   │       ├── #panel-jobs
│   │       ├── #panel-pm
│   │       ├── #panel-money
│   │       ├── #panel-rates
│   │       └── #panel-manuals   ← MUST stay inside #contentArea
│   └── Modals (overlays, outside contentArea but inside body)
└── <script>         — All JavaScript (~135 functions, no external JS except Google GSI + jsPDF)
```

### ⚠️ Critical Layout Rule
`#panel-manuals` **must** be the last child of `#contentArea` — NOT a child of `<body>`.
This has broken multiple times due to a div count mismatch in the Hold Harmless section.
**Always verify** after editing the rates/hold-harmless section:

```python
# Quick check — run this to verify div balance
content = open('index.html').read()
import re
idx_ca = content.find('<div id="contentArea">')
idx_pm = content.find('<div id="panel-manuals"')
seg = content[idx_ca:idx_pm]
net = len(re.findall(r'<div[^>]*>', seg)) - len(re.findall(r'</div>', seg))
print(f"Net depth: {net}  (must be exactly 1)")
```

---

## Authentication System

Do not record client IDs, allowlists, PINs, or other login material in this document.

### Google OAuth
- Client identifier and authorized-email list live in app source only; do not copy them here.
- Flow: Implicit (id_token in URL hash)
- Hosted GitHub Pages URL only — not from local files (`file://`)
- Entry point: `triggerGoogleLogin()` → redirects to Google → returns to app with token
- Callback handler: `checkOAuthCallback()` — called on DOMContentLoaded
- Session: Stored in `sessionStorage` as `amt_auth_v29` (JSON)
- Access-denied uses `alert()` so the rejection is visible

### PIN Login
- Staff PINs are not stored in this repository. Do not record them here.
- Runtime hashes (when present) use `localStorage.amt_pin_hashes_v29`
- PIN login grants full read/write access — same as Google login
- `writeGuard()` is not triggered for PIN users

### Auth State
```js
currentUser = { name, method:'Google'|'PIN', viewOnly:false, ts }
```
`viewOnly` is always `false` — both login methods have full access.

---

## Data Storage (localStorage)

| Key | Contents |
|-----|----------|
| `amt_jobs_v29` | Array of job records |
| `amt_invoices_v29` | Array of invoices |
| `amt_expenses_v29` | Array of expense records |
| `amt_dists_v29` | Array of distribution records |
| `amt_pm_v29` | PM checklist data |
| `amt_kb_v29` | Knowledge base entries |
| `amt_pin_hashes_v29` | Hashed PINs |
| `amt_parts_v30` | Parts database (user-added parts, seeds loaded separately) |
| `amt_explorer_cache_v30` | GitHub file explorer cache (24hr TTL) |
| `amt_gh_token` | GitHub Personal Access Token (for 5000/hr API limit) |

Session only (sessionStorage):
| `amt_auth_v29` | Current logged-in user object |

---

## Navigation & Panels

```js
showTab(tabName)  // tabName: 'dash' | 'newjob' | 'jobs' | 'pm' | 'money' | 'rates' | 'manuals'
```

Each panel has a CSS class `.panel` and is shown/hidden via `display` style.
The active panel gets `display: block` (or `''`), all others `display: none`.

---

## Knowledge Base / Manuals Tab (`#panel-manuals`)

This tab has 4 sub-tabs:

| Sub-tab | ID | Content |
|---------|-----|---------|
| 📁 Manuals | `kbp-files` | GitHub file explorer |
| 🔩 Parts | `kbp-parts` | 446-part FRU database |
| 🧠 Knowledge Base | `kbp-kb` | Saved KB entries |
| ⚠️ Error Codes | `kbp-errcodes` | 31 built-in error codes |

Switch with: `setKBTab('files' | 'parts' | 'kb' | 'errcodes')`

### GitHub File Explorer
- Config: `const GH = { org, repo, branch, manualsRoot:'Manuals', pages, get token() }`
- API calls use Bearer token if set: `localStorage.amt_gh_token`
- Cache: `loadExplorerCache()` / `saveExplorerCache()` — persisted to localStorage, 24hr TTL
- Load folder: `loadExplorer(path)` — fetches GitHub API, falls back to `renderFallbackFolders()`

**Real repo structure (verified May 2026):**
```
Manuals/
├── GE/
│   ├── Artist EVO/
│   ├── Discovery 450/
│   ├── Discovery 750/
│   ├── Discovery 750w/
│   ├── HDxt 1.5T and 3T/
│   ├── LX 9X Platform/
│   ├── Optima 450w/
│   ├── Sign Creator,Explorer,Star,Aviator/
│   ├── Signa Excite 1.5T 12x/
│   ├── Signa Excite 3T 12x/
│   └── Signa Excite HDxt 15x/
├── Siemens/
│   ├── Aera/
│   └── Avanto/
└── Error codes and Troubleshooting/
    └── 50+ files (.htm, .pdf, .html, .doc)
```

Hardcoded fallbacks: `FALLBACK_FOLDERS`, `GE_SUBFOLDERS`, `SIEMENS_SUBFOLDERS`

### Parts Database
- **446 GE FRU parts** extracted from:
  - Direction 2345481 Rev 13 (Signa Excite FRU)
  - Direction 5166012 Rev 14 (Signa HDx FRU)
- Seeded into `PARTS_SEED` constant on first load
- Stored in `localStorage.amt_parts_v30` after first load
- Key functions: `searchParts()`, `openAddPartModal()`, `savePart()`, `editPart()`, `deletePart()`
- Search filters by: part number, description, brand, category, model, notes, section

### Error Codes
- 31 built-in entries in `FULL_ERROR_DB` constant (declared at top of script — **critical for TDZ**)
- Key codes: MGD-BOOT, MCP820-NVRAM, PHPS-VOLT, TABLE-DOCK, SG-* gradient codes
- Search: `searchErrors(query)`

---

## Modal System

### ⚠️ Critical: How Modals Work

All modals use CSS class `.modal-overlay` + `.open`:
```css
.modal-overlay { display: none; }
.modal-overlay.open { display: flex; position: fixed; inset: 0; ... z-index: 900; }
```

**The correct `openModal` / `closeModal` pattern** (inline `style="display:none"` beats CSS classes — must remove it first):
```js
function openModal(id) {
  const el = document.getElementById(id);
  if(!el) return;
  el.style.removeProperty('display');  // ← CRITICAL: remove inline style first
  el.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeModal(id) {
  const el = document.getElementById(id);
  if(!el) return;
  el.classList.remove('open');
  // Restore scroll only when no modal remains open
  if(!document.querySelector('.modal-overlay.open'))
    document.body.style.overflow = '';
}
```

A `visibilitychange` listener also clears any stale `overflow:hidden` when the user
returns to the tab (guards against scroll lock if the user left while a modal was open).

**Never** use `el.style.display = 'flex'` directly — always use the class system.

### Modal IDs
| Modal | ID | Trigger |
|-------|-----|---------|
| GitHub Settings | `ghSettingsModal` | `openGHSettings()` |
| Add/Edit Part | `addPartModal` | `openAddPartModal()` |
| KB Entry | `kbEntryModal` | `openKBEntryModal()` |
| Invoice | `invoiceModal` | `openInvoiceModal()` |
| Expense | `expenseModal` | `openExpenseModal()` |
| Distribution | `distModal` | `openDistModal()` |

---

## Features

### Dashboard
- Net profit, revenue, expenses, tax set-aside summary cards
- Job stats (total, PM, repairs, ramp/shim, paid/open invoices)
- Profit sharing cards (Michael 51%, Antonio 24.5%, Candelario 24.5%)
- Quick action buttons, recent jobs list

### Job Entry (`#panel-newjob`)
- Fields: customer, address, date, type, system, tech, hours, mileage, notes
- Job types: PM, Repair, Ramp/De-ice, Shim, Install, Other
- Auto-calculates mileage charge, suggests KB entries and parts

### Invoice System
- PDF generation via jsPDF 2.5.1 (CDN)
- `buildInvoicePDF()`, `saveInvoicePDF()`, `sendInvoiceEmail()`
- AMT logo embedded as base64 (`const LOGO_B64`)

### PM Checklists (`#panel-pm`)
- 6 types: `ge_mri`, `siemens_mri`, `ge_ct`, `siemens_ct`, `stellant`, `solaris`
- Switch with `switchChecklist(type)`

### Money Tracker (`#panel-money`)
- Revenue, expenses, distributions tracking
- Tax set-aside at 30%
- Profit sharing by ownership percentage
- Sub-tabs: Summary, Revenue, Expenses, Distributions

### Hold Harmless Agreement (`#panel-rates`)
- MXR-style letter format adapted for AMT
- 7 condition checkboxes (quench history, low helium, non-AMT parts, etc.)
- 5 service type checkboxes
- Live preview updates as you fill fields
- `printHoldHarmless()` opens print window with auto-print

---

## External Dependencies

| Library | Version | How loaded |
|---------|---------|-----------|
| Google GSI | latest | `<script src="https://accounts.google.com/gsi/client">` |
| jsPDF | 2.5.1 | `<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js">` |

No npm, no build step, no other dependencies.

---

## CSS Variables (Design Tokens)

```css
--navy: #0a1628        /* Primary brand color */
--gold: #c9a84c        /* Accent/AMT gold */
--blue2: #2563eb       /* Links, primary buttons */
--green2: #16a34a      /* Success states */
--gray: #f3f4f6        /* Card backgrounds */
--gray2: #e5e7eb       /* Borders */
--text: #1f2937        /* Primary text */
--text2: #6b7280       /* Secondary text */
--r: 12px              /* Border radius */
--bg: #ffffff          /* Page background */
```

Dark mode supported via `@media (prefers-color-scheme: dark)`.

---

## Known Issues & Outstanding Work

### Must Fix
- [ ] GitHub token setup UX — users still need to manually create token at github.com/settings/tokens
- [ ] Error code manual links → 404 (files exist in GitHub but paths in FULL_ERROR_DB are placeholder names like `GE/RF_Amp_Service.htm` that don't match real filenames in repo)
- [ ] Parts manual links → 404 (need to upload actual PDFs to `Manuals/GE/Parts_Manuals/` in repo)

### Nice to Have
- [ ] Offline support / PWA manifest
- [ ] Push notifications for job reminders
- [ ] Photo attachment on jobs (currently notes-only)
- [ ] Export jobs/invoices to CSV
- [ ] Sync data across devices (currently localStorage only — data is per-browser)

### GitHub Settings Flow (working but requires user action)
1. User clicks ⚙️ GitHub button in Manuals tab
2. Creates token at github.com/settings/tokens (Contents: read-only)
3. Pastes token → Save → Test Connection
4. Green dot appears in explorer header
5. Click 🔍 Scan & Index All Manuals Now → indexes entire repo in one API call

---

## Bug History (Fixes Already Applied)

These bugs have been fixed. **Do not reintroduce them.**

| Bug | Root Cause | Fix Applied |
|-----|-----------|-------------|
| `panel-manuals` outside `contentArea` | Extra `</div>` in Hold Harmless section closes contentArea early | Removed extra `</div>`, verified net depth = 1 |
| GitHub Settings button does nothing | `openModal()` uses `classList.add('open')` but inline `style="display:none"` beats CSS | `openModal()` now calls `el.style.removeProperty('display')` first |
| Duplicate JS functions | Previous patches added functions without removing originals | All functions deduplicated (openGHSettings, saveGHToken, testGHToken, scanGitHubForManuals) |
| Explorer cache not persisting | `explorerCache = {}` was in-memory only | Now uses `loadExplorerCache()` / `saveExplorerCache()` with localStorage + 24hr TTL |
| Version label showing v29 | Hardcoded string not updated | Both instances updated to v30 |
| App showed v29 label despite v30 code | Cosmetic string only — all v30 functions confirmed loaded | Fixed |
| PIN login was view-only | `doLogin(..., true)` passed viewOnly=true for PINs | Changed to `false` — PIN now grants full read/write |
| Scroll locks after modal / app resume | `closeModal()` never restored `body.style.overflow` | `closeModal()` now restores overflow; `visibilitychange` listener added as safety net |
| Google login error silent | Access-denied used tiny `loginError` div only | Now uses `alert()` so rejection is impossible to miss |
| Local file Google login confusing | `showHostingGuide()` used plain `alert()` | Now shows inline styled message with link to hosted app |
| Standalone file out of sync | Logic fixes applied to `index.html` only | All fixes now applied to both files |

---

## Key Function Reference

```js
// Auth
triggerGoogleLogin()           // redirect to Google OAuth
checkOAuthCallback()           // parse token from URL hash on return
tryAutoLogin()                 // check sessionStorage on load
doLogin(name, method, viewOnly)// set currentUser + boot app (viewOnly always false now)
bootApp()                      // show mainApp, init all modules
logout()                       // clear session, show login screen
writeGuard(label)              // blocks writes if viewOnly (currently never triggered)

// Navigation
showTab(name)                  // switch panel: 'dash'|'newjob'|'jobs'|'pm'|'money'|'rates'|'manuals'
setKBTab(name)                 // switch KB sub-tab: 'files'|'parts'|'kb'|'errcodes'
openModal(id) / closeModal(id) // show/hide any modal (removes inline style first, restores scroll on close)

// GitHub / Manuals
openGHSettings()               // open GitHub Settings modal
saveGHToken()                  // save token to localStorage
testGHToken()                  // verify token against GitHub API
scanGitHubForManuals()         // recursive tree API scan, builds explorer cache
loadExplorer(path)             // load folder from GitHub API (with cache)
renderFallbackFolders(path)    // show hardcoded folders when API unavailable
setGHStatusDot(state)          // 'ok'|'error'|'loading'|'idle' — updates dot color

// Parts
searchParts()                  // filter partsDB, render results
savePart()                     // save new/edited part to localStorage
openAddPartModal(id?)          // open modal (id = edit existing, null = new)

// Jobs
saveJob()                      // validate + save job to localStorage
renderJobs()                   // re-render jobs list
viewJob(id) / editJob(id)      // open job detail/edit

// Money
calcMoney()                    // recalculate all financial summaries
renderMoney()                  // re-render money tab
saveDist() / saveExpense()     // save financial records

// Hold Harmless
updateHHPreview()              // re-render letter preview from form inputs
printHoldHarmless()            // open print window with clean letter HTML

// PM
switchChecklist(type)          // load PM checklist: 'ge_mri'|'siemens_mri'|etc
savePMChecklist()              // save current PM state

// Invoice
buildInvoicePDF()              // create jsPDF document
saveInvoicePDF()               // trigger browser download
```

---

## Logo

AMT logo is embedded as base64 in `const LOGO_B64` (~114KB string).
Injected into `['loginLogo', 'topbarLogo', 'hhLogo', 'hhLogoLetter']` on DOMContentLoaded.
Source file: `AMT_logo.png`

---

## GitHub Actions / Deployment

Pages auto-deploys from `.github/workflows/pages.yml` on push to `main` (app files only — no `Manuals/`, no `functions/`).

Firebase functions are **not** deployed by Pages. From a machine with Firebase CLI access:

```bash
firebase deploy --only functions
```

Local/dev: `python3 scripts/serve.py` (see `README.md`). Do not `git push` from a random laptop checkout if you are not `mikejackson-stack`.

---

## Development Tips for Claude Code

1. **Always run the div-depth check** after editing the rates/hold-harmless section (see above)
2. **Never duplicate functions** — search for existing definition before adding
3. **Test modal open/close** after any CSS or HTML changes to modals
4. **FULL_ERROR_DB must be declared at top of `<script>`** before any function that references it (temporal dead zone issue)
5. **LOGO_B64 is large** (~114KB) — don't accidentally delete it
6. **One `<script>` tag** for app code — don't split into multiple files without refactoring the build
7. **Always sync both files** — any change to `index.html` must also be applied to `AMT-Imaging-App-standalone.html`
8. **Node.js syntax check** before committing:
   ```bash
   ./scripts/check.sh
   ```
   Or extract the largest inline script and `node --check` it (see `scripts/syntax_check.py`). Do not `node --check index.html` directly.

---

*Generated May 10, 2026 — AMT Imaging Solutions Field Service App v30*
