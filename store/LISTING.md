# Store listing kit — copy-paste everything from here

One source of truth for both stores. Screenshots live in
`store/screenshots/` (1280×800 PNG, valid for AMO and Chrome Web Store).

---

## Name (both stores)

> qr-cow — QR Code Generator

## Summary / short description

AMO "Summary" (≤250 chars) and Chrome Web Store "Description" field (≤132 chars) — use the short one for both, it fits everywhere:

> Turn any page, link, or text into a styled QR code — instantly, offline, and private. 13 content types, 16 designer presets.

## Detailed description (both stores)

> **Any page. One click. A styled QR code.**
>
> Click the toolbar button and the current tab's URL is already a QR code. Right-click any link or selected text to encode that instead. Download PNG or SVG, or copy the image straight to the clipboard.
>
> **Private by design.** Codes are generated entirely inside your browser — the extension makes zero network requests, collects nothing, and needs no account. What you encode never leaves your machine.
>
> **13 content types:** URL, plain text, Wi-Fi login, vCard and MeCard contacts, email, SMS, phone call, calendar event, location, social profile, crypto address, and app link.
>
> **16 designer presets** — the same styles as qr-cow.com (gradients, rounded dots, custom colors), rendered with the same engine, so the output is pixel-identical to the full studio. A live contrast check warns you before you ship a code phones can't scan.
>
> **10 languages**, including full right-to-left layouts for Farsi and Arabic.
>
> Need editable-after-printing (dynamic) codes with scan analytics? That lives in the full studio at qr-cow.com — free static codes forever, dynamic from $3/month.

## Category

- AMO: **Photos, Music & Videos** (closest fit) or **Other**
- Chrome Web Store: **Tools** (category "Productivity / Tools")

## Tags / keywords

qr code, qr code generator, qr, wifi qr, vcard, offline, privacy

## Support fields

- Homepage: `https://qr-cow.com/extension?source=store`
- Support site: `https://qr-cow.com`
- Support email: `hi@qr-cow.com`

---

## Privacy & data disclosure (identical answers, both stores)

**Single purpose** (CWS requires one sentence):
> Generate QR codes from pages, links, selections, or typed content, locally in the browser.

**Data collection questionnaire:** None / No for every category. The extension has no analytics, no accounts, no remote code, and makes no network requests.

**Privacy policy text** (paste where a policy statement is asked; also true — keep it true):
> This extension does not collect, store, or transmit any data. QR codes are generated entirely locally in your browser. The extension makes no network requests.

**Permission justifications** (CWS asks one line per permission):

| Permission | Justification |
|---|---|
| `contextMenus` / `menus` | Adds the right-click items "QR code for this page / link / selected text". |
| `activeTab` | Reads the current tab's URL, only when the user clicks the toolbar button, to pre-fill the QR content. |
| `storage` | Remembers the last-used content type and design locally so the popup reopens as the user left it. |
| `clipboardWrite` | The "Copy" button writes the generated QR PNG to the clipboard. |

**Remote code:** No.

---

## Firefox (AMO) submission steps

1. Sign in at https://addons.mozilla.org/developers/ (free) → Submit a New Add-on → **On this site** (listed).
2. Upload `web-ext-artifacts/firefox/qr-cow_qr_code_generator-<version>.zip` (from `npm run package`).
3. **Source code: required** (the JS is bundled). Upload the zip produced by `npm run source-zip`
   (`web-ext-artifacts/source.zip`). Reviewer instructions to paste:
   > Built from this repository. Node 20+. Steps: `npm ci && npm run build` — output in dist/firefox matches the uploaded xpi 1:1. Bundles are unminified (esbuild, minify:false). `src/shared/` and `dist/_locales/` are generated from the sibling web app's sources; the generators are `scripts/sync-shared.mjs` and `scripts/gen-locales.mjs` (included).
4. Fill listing fields from this file; upload the 4 screenshots.
5. **The add-on id `extension@qr-cow.com` becomes permanent on first upload.**
6. Review: typically 1–5 business days. Auto-signed and published on approval.

## Chrome Web Store submission steps

1. https://chrome.google.com/webstore/devconsole → register (**$5 one-time**).
2. New item → upload `web-ext-artifacts/chrome/qr-cow_qr_code_generator-<version>.zip`.
3. Store listing tab: fields + 4 screenshots from this file. Privacy tab: single purpose, permission justifications, "no data collected" — all above.
4. Distribution: Public. Submit for review (typically 1–3 days).
5. The extension id is derived from the upload — nothing to pre-choose.

## Updating either store

Bump `version` in `manifest.json` + `package.json` → `npm run package` → upload the new zip (AMO: + fresh `npm run source-zip`). Listings and screenshots carry over.
