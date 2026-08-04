# Shipping qr-cow as a browser extension (Firefox + Chrome)

The site's QR studio already renders codes client-side with
`qr-code-styling`, and its encoders/presets are pure TypeScript. The
extension (``) vendors those modules and ships
them as a toolbar popup + context menus for BOTH Firefox and Chrome (one
source tree; `src/compat.ts` bridges `browser`/`chrome`, the build emits
`dist/firefox/` + `dist/chrome/`) — **fully offline, zero network
requests**, pixel-identical output to the studio. You are not building a
second product; you are packaging the existing one.

## What already exists (no work needed)

- `` → the complete MV3 extension (both targets): popup with all
  13 content types, 16 presets, PNG/SVG/copy, 10 locales (RTL included),
  dark mode, context menus for page/link/selection.
- `scripts/sync-shared.mjs` → re-vendors the pure modules from `apps/web`
  (single source of truth; `src/shared/` is generated).
- `scripts/gen-locales.mjs` → `_locales/` generated from
  `apps/web/messages/*.json`, with an ICU-brace guard so `{name}`-style
  placeholders can never leak into the extension.
- 61 jest tests (encoder parity with the web app, contrast, prefill,
  locale mapping); `web-ext lint` is 0 errors / 0 warnings.
- Privacy story that survives review: no host permissions, no analytics,
  no fetches. Data-collection manifest field already declares "none".

## Build + try

```sh
cd firefox_extention
npm ci && npm run build
```

Firefox → `about:debugging` → This Firefox → Load Temporary Add-on →
`dist/firefox/manifest.json`.
Chrome → `chrome://extensions` → Developer mode → Load unpacked →
`dist/chrome/`.

## Manual test checklist (before every AMO upload)

1. Toolbar popup: URL prefilled from the current http(s) tab; empty on `about:newtab`.
2. Context menu ×3: page → URL popup window; link → link URL; selection (a >4000-char selection truncates).
3. Spot-scan a URL, Wi-Fi, and vCard code with a phone.
4. All 16 presets apply; manual color change deselects the preset; transparent PNG keeps alpha.
5. Download PNG (1000px) + SVG (has viewBox, opens clean); Copy pastes into an image editor.
6. Low-contrast pair (white on white) shows the warning.
7. Close/reopen → last type/fields/design restored.
8. Popup devtools → Network tab: **zero requests** during all of the above.
9. `about:config` → `intl.locale.requested = fa` → popup is RTL with Persian strings.
10. `npm run lint` → 0 errors, 0 warnings.

11. Repeat 1–8 in Chrome with `dist/chrome/` loaded unpacked (the code
    paths are identical; this catches Chrome-only API drift).

## Submit to the stores

| Step | Who | Cost |
|---|---|---|
| Build + package (`npm run package`) | agent or you | free |
| AMO Developer Hub account | **you** | free |
| Chrome Web Store developer account | **you** | $5 once |
| Upload zip + source zip, listing copy, 2 screenshots | **you** (copy/screens drafted by agent) | time |
| Review wait | Mozilla | 1–5 business days |

Details (listing copy, source-zip contents, privacy text) are in
[`README.md`](../README.md) §4.

**The gecko id `extension@qr-cow.com` is permanent after the first
upload** — don't change it casually before submitting.

## Why this matters beyond the feature

The AMO listing is a free distribution channel and a backlink from a
high-authority domain — exactly the lever the SEO/GTM work identified as
the site's bottleneck. Add the listing URL to the directory/backlink
checklist once live.

## Keeping it updated

Translations and shared logic flow FROM `apps/web` at build time, so
most site work needs nothing here. Re-release only when extension code
itself changes: bump `version` in `manifest.json` + `package.json`,
`npm run package`, re-upload. The version is independent of the root
`VERSION` file (same convention as `tools/mcp`).
