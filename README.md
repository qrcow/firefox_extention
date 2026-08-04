# qr-cow browser extension (Firefox + Chrome)

Turn any page, link, selection, or typed content into a styled QR code —
right from the toolbar. Everything renders locally with the exact same
library and presets as [qr-cow.com](https://qr-cow.com), so the codes are
pixel-identical to the studio's. **The extension makes zero network
requests**: nothing is collected, nothing leaves the browser.

Once installed you can:

> Click the toolbar cow → the current page's URL is already a QR code.
>
> Right-click any link → **QR code for this link**.
>
> Select text on a page → right-click → **QR code for selected text**.

13 content types (URL, text, Wi-Fi, vCard, MeCard, email, SMS, call,
event, location, social, crypto, app), 16 designer presets, PNG/SVG
download, copy-to-clipboard, 10 languages (RTL included), dark mode.

---

> This repo builds BOTH the Firefox and the Chrome extension from one
> codebase — the browser differences are a small manifest transform in
> `scripts/build.mjs`.

## 1. Build it

Requires Node 20+. Fully standalone — no other checkout needed.

```sh
git clone git@github.com:qrcow/firefox_extention.git
cd firefox_extention
npm ci
npm run build        # → dist/firefox/ + dist/chrome/ (loadable unpacked)
npm run package      # → web-ext-artifacts/firefox/*.zip (AMO) + web-ext-artifacts/chrome/*.zip (Chrome Web Store)
```

Shared logic and translations are vendored snapshots from the qr-cow
monorepo: `src/shared/` (encoders, presets, design types,
`buildStyleOptions`) and `vendor/web-messages/` (the translation
catalogs `_locales` is generated from). **Never edit either by hand.**
To refresh them from a monorepo checkout:

```sh
QRCOW_WEB_DIR=/path/to/qr-cow-monorepo npm run sync-shared
```

## 2. Try it locally

1. `npm run build`
2. **Firefox** → `about:debugging` → **This Firefox** → **Load Temporary
   Add-on…** → pick `dist/firefox/manifest.json`.
3. **Chrome** → `chrome://extensions` → enable **Developer mode** →
   **Load unpacked** → pick the `dist/chrome/` folder.
4. Or let web-ext spawn a clean Firefox profile: `npm run start`.

Heads-up: extensions are disabled in Private Browsing windows by default,
so the context menu won't appear there until the user allows it.

## 3. Develop

```sh
npm run dev          # esbuild --watch (rerun `npm run build` after message/i18n changes)
npm run typecheck
npm test             # 61 jest tests: encoders (parity with apps/web), contrast, prefill, locale mapping
npm run lint         # web-ext lint against dist/ — must stay 0 errors / 0 warnings
```

Icons are committed rasters; regenerate from the brand SVG with
`npm run icons` (needs ImageMagick).

## 4. Submit to the stores (founder)

### Firefox — AMO

1. Create/sign in at [addons.mozilla.org Developer Hub](https://addons.mozilla.org/developers/) (free).
2. `npm run package`, upload `web-ext-artifacts/*.zip` as a **listed** add-on.
   **The gecko id `extension@qr-cow.com` becomes permanent on first upload.**
3. Source code upload (required because the JS is bundled): zip this
   directory without `node_modules/`, `dist/`, `web-ext-artifacts/` — the
   build steps in §1 reproduce `dist/` byte-for-byte. Bundles are
   deliberately unminified to ease review.
4. Data collection questionnaire: **None** across the board. Privacy
   policy text: *"This extension does not collect, store, or transmit any
   data. QR codes are generated entirely locally in your browser. The
   extension makes no network requests."*
5. Human review typically takes 1–5 business days. Updates: bump
   `version` in both `manifest.json` and `package.json`, repeat 2–3.

### Chrome — Chrome Web Store

1. [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole) —
   one-time **$5** registration fee.
2. Upload `web-ext-artifacts/chrome/*.zip`, fill the listing (same copy,
   same screenshots), set visibility, submit.
3. Privacy tab: single purpose = "generate QR codes", no remote code,
   **no data collected** (same statement as AMO). Justify each
   permission in one line (contextMenus = right-click items, activeTab =
   read current tab URL on click, storage = remember last design,
   clipboardWrite = copy the PNG).
4. Review is typically 1–3 days. The extension id is derived from the
   upload key Google generates — nothing to pre-choose.

## Architecture notes

- One source tree, two targets. `manifest.json` is the Firefox source of
  truth (≥115, `background.scripts` event page); `scripts/build.mjs`
  derives the Chrome manifest (service_worker background, `contextMenus`
  permission, `minimum_chrome_version: 110`, `pt`→`pt_BR` / `zh`→`zh_CN`
  locale dirs). The JS bundles are byte-identical — `src/compat.ts`
  resolves `browser` vs `chrome` at runtime (Chrome MV3 APIs return
  promises when called without a callback, so no polyfill is needed).
- Permissions: `menus`, `activeTab`, `storage`, `clipboardWrite` — no
  host permissions. The toolbar click's activeTab grant is what lets the
  popup read the current tab's URL; context menus get their target for
  free in the click event.
- Context menu opens `popup.html?type=…&url=…` in a small popup-type
  window (query-param prefill: stateless, no background↔popup races).
- Last-used type/fields/design persist in `storage.local` (never
  `storage.sync` — "nothing leaves the browser" stays literally true).
- The solid-black-square SVG bug: qr-code-styling emits non-unique
  clip-path ids. `src/popup/preview.ts` carries a verbatim port of the
  web app's `uniquifySvgIds` — don't "simplify" it.
- UI test automation is deliberately absent: Playwright cannot install
  Firefox extensions, and the pure logic is jest-covered. Use the manual
  checklist in [docs/browser-extension.md](../../docs/browser-extension.md).
