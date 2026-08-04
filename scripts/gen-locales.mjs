#!/usr/bin/env node
/**
 * Generates dist/_locales/<code>/messages.json for all 10 locales from
 * apps/web/messages/<code>.json (single source of truth for translations)
 * plus i18n/extra.json for extension-only strings. Pure mapping logic
 * lives in ./locale-map.cjs so jest can cover it too.
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import localeMap from "./locale-map.cjs";

const { LOCALES, buildLocale } = localeMap;
export { LOCALES };

const here = dirname(fileURLToPath(import.meta.url));
const extRoot = resolve(here, "..");
// Standalone repo: translations come from the committed snapshot in
// vendor/web-messages (refreshed from a qr-cow monorepo checkout via
// `QRCOW_WEB_DIR=/path/to/monorepo npm run sync-shared`). Setting
// QRCOW_WEB_DIR also makes THIS script read the live monorepo instead.
const messagesDir = process.env.QRCOW_WEB_DIR
  ? resolve(process.env.QRCOW_WEB_DIR, "apps/web/messages")
  : resolve(extRoot, "vendor/web-messages");

/**
 * dirMap renames locale DIRECTORIES for targets whose locale list differs:
 * Chrome has no bare "pt"/"zh" — they must ship as pt_BR / zh_CN.
 */
export function generate(outDir, dirMap = {}) {
  const en = JSON.parse(readFileSync(join(messagesDir, "en.json"), "utf8"));
  const extraAll = JSON.parse(readFileSync(join(extRoot, "i18n/extra.json"), "utf8"));
  const extraEn = extraAll.en;
  if (!extraEn) throw new Error("i18n/extra.json must define an 'en' block");
  for (const locale of LOCALES) {
    const messages = locale === "en" ? en : JSON.parse(readFileSync(join(messagesDir, `${locale}.json`), "utf8"));
    const map = buildLocale(messages, en, extraAll[locale], extraEn, locale);
    const dir = join(outDir, "_locales", dirMap[locale] ?? locale);
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, "messages.json"), JSON.stringify(map, null, 2) + "\n");
  }
  return LOCALES.length;
}

// CLI use: node scripts/gen-locales.mjs [outDir]
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const out = process.argv[2] ?? join(extRoot, "dist");
  const n = generate(out);
  console.log(`gen-locales: wrote ${n} locales to ${out}/_locales`);
}
