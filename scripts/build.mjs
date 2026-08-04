#!/usr/bin/env node
/**
 * Builds both browser targets from one source tree:
 *
 *   dist/firefox/  — manifest as authored (background.scripts event page,
 *                    "menus" permission, browser_specific_settings)
 *   dist/chrome/   — derived manifest (service_worker background,
 *                    "contextMenus" permission, no gecko block,
 *                    pt→pt_BR / zh→zh_CN locale dirs)
 *
 * The JS bundles are byte-identical across targets — src/compat.ts
 * resolves `browser` vs `chrome` at runtime.
 *
 * `--watch` rebuilds bundles on change (assets/locales copied once).
 */
import { cpSync, mkdirSync, rmSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import esbuild from "esbuild";
import { generate } from "./gen-locales.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const dist = join(root, "dist");
const watch = process.argv.includes("--watch");

const fxManifest = JSON.parse(readFileSync(join(root, "manifest.json"), "utf8"));

/** Chrome deltas — everything else is shared. */
function chromeManifest(fx) {
  const m = structuredClone(fx);
  delete m.browser_specific_settings; // gecko-only (id, min version, data-collection)
  m.background = { service_worker: "background.js" };
  m.permissions = m.permissions.map((p) => (p === "menus" ? "contextMenus" : p));
  // Everything used (MV3 promises, windows.create popup, ClipboardItem)
  // is comfortably inside Chrome 110+.
  m.minimum_chrome_version = "110";
  return m;
}

const TARGETS = [
  { name: "firefox", manifest: fxManifest, dirMap: {} },
  { name: "chrome", manifest: chromeManifest(fxManifest), dirMap: { pt: "pt_BR", zh: "zh_CN" } },
];

rmSync(dist, { recursive: true, force: true });

let localeCount = 0;
for (const t of TARGETS) {
  const out = join(dist, t.name);
  mkdirSync(join(out, "popup"), { recursive: true });
  writeFileSync(join(out, "manifest.json"), JSON.stringify(t.manifest, null, 2) + "\n");
  cpSync(join(root, "src/popup/popup.html"), join(out, "popup/popup.html"));
  cpSync(join(root, "src/popup/popup.css"), join(out, "popup/popup.css"));
  cpSync(join(root, "icons"), join(out, "icons"), { recursive: true });
  localeCount = generate(out, t.dirMap);
}

const options = {
  entryPoints: [
    { in: join(root, "src/background.ts"), out: "background" },
    { in: join(root, "src/popup/main.ts"), out: "popup/main" },
  ],
  bundle: true,
  format: "iife",
  target: ["firefox115", "chrome110"],
  minify: false, // store-review ease; the zips stay small
  sourcemap: false,
  logLevel: "info",
};

// Build once into firefox/, copy the identical bundles into chrome/.
const syncChromeBundles = () => {
  cpSync(join(dist, "firefox/background.js"), join(dist, "chrome/background.js"));
  cpSync(join(dist, "firefox/popup/main.js"), join(dist, "chrome/popup/main.js"));
};

if (watch) {
  const ctx = await esbuild.context({
    ...options,
    outdir: join(dist, "firefox"),
    plugins: [{
      name: "sync-chrome",
      setup(b) { b.onEnd(syncChromeBundles); },
    }],
  });
  await ctx.watch();
  console.log(`watching… (${localeCount} locales generated once — rerun for message changes)`);
} else {
  await esbuild.build({ ...options, outdir: join(dist, "firefox") });
  syncChromeBundles();
  console.log(`build: dist/firefox + dist/chrome ready (${localeCount} locales each)`);
}
