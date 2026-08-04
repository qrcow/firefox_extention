#!/usr/bin/env node
/**
 * Vendors the pure, framework-free modules the extension shares with the
 * web app. apps/web stays the single source of truth — run this after
 * changing any of the upstream files, then commit the refreshed copies.
 *
 * Each copied file gets a DO-NOT-EDIT banner and (only rewrite applied)
 * `@/lib/qr-encoders` → `./qr-encoders` so the flat src/shared/ dir
 * resolves without path aliases.
 */
import { copyFileSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const extRoot = resolve(here, "..");
// This is a MAINTENANCE task: it refreshes the vendored snapshots from a
// qr-cow monorepo checkout. Point QRCOW_WEB_DIR at the monorepo root.
const monorepo = process.env.QRCOW_WEB_DIR;
if (!monorepo) {
  console.error(
    "sync-shared refreshes vendored files from the qr-cow monorepo.\n" +
    "Set QRCOW_WEB_DIR to your monorepo checkout, e.g.\n" +
    "  QRCOW_WEB_DIR=~/qr-cow npm run sync-shared",
  );
  process.exit(1);
}
const webRoot = resolve(monorepo, "apps/web");

const BANNER =
  "// GENERATED FILE — do not edit. Source of truth lives in apps/web.\n" +
  "// Refresh with: npm run sync-shared (tools/firefox-extension)\n\n";

/** [source (relative to apps/web), dest (relative to ext root)] */
const FILES = [
  ["lib/qr-encoders.ts", "src/shared/qr-encoders.ts"],
  ["lib/inputLimits.ts", "src/shared/inputLimits.ts"],
  ["lib/qr-contrast.ts", "src/shared/qr-contrast.ts"],
  ["components/qr-studio/types.ts", "src/shared/types.ts"],
  ["components/qr-studio/presets.ts", "src/shared/presets.ts"],
  ["components/qr-studio/logoPresets.ts", "src/shared/logoPresets.ts"],
  ["components/qr-studio/buildStyleOptions.ts", "src/shared/buildStyleOptions.ts"],
];

/** Test files synced too so encoder behaviour can never drift silently. */
const TEST_FILES = [
  ["lib/__tests__/qr-encoders.test.ts", "tests/qr-encoders.test.ts"],
  ["lib/__tests__/qr-contrast.test.ts", "tests/qr-contrast.test.ts"],
];

function rewrite(src, forTests) {
  let out = src;
  // Path-alias imports → flat relative imports.
  out = out.replaceAll('from "@/lib/qr-encoders"', 'from "./qr-encoders"');
  out = out.replaceAll('from "@/lib/inputLimits"', 'from "./inputLimits"');
  out = out.replaceAll('from "@/lib/qr-contrast"', 'from "./qr-contrast"');
  if (forTests) {
    out = out.replaceAll('from "./qr-encoders"', 'from "../src/shared/qr-encoders"');
    out = out.replaceAll('from "./qr-contrast"', 'from "../src/shared/qr-contrast"');
  }
  return out;
}

let n = 0;
for (const [from, to] of FILES) {
  const src = readFileSync(join(webRoot, from), "utf8");
  const dest = join(extRoot, to);
  mkdirSync(dirname(dest), { recursive: true });
  writeFileSync(dest, BANNER + rewrite(src, false));
  n++;
}
for (const [from, to] of TEST_FILES) {
  const src = readFileSync(join(webRoot, from), "utf8");
  const dest = join(extRoot, to);
  mkdirSync(dirname(dest), { recursive: true });
  writeFileSync(dest, BANNER + rewrite(src, true));
  n++;
}
// Refresh the committed translation snapshot too (gen-locales reads it).
const msgSrc = join(webRoot, "messages");
const msgDst = join(extRoot, "vendor/web-messages");
mkdirSync(msgDst, { recursive: true });
let m = 0;
for (const f of readdirSync(msgSrc).filter((f) => f.endsWith(".json"))) {
  writeFileSync(join(msgDst, f), readFileSync(join(msgSrc, f)));
  m++;
}
console.log(`sync-shared: ${n} files vendored from apps/web, ${m} message catalogs snapshotted`);
