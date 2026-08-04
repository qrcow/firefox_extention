// Rasterize icons/icon.svg → icons/icon-{16,32,48,128}.png via headless
// Chromium (crisp gradients + rounded strokes; IM6's SVG renderer is not).
// Dev-machine one-off: PNGs are committed, builds never need this.
// Run: NODE_PATH=<somewhere with playwright> node scripts/render-icons.mjs
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const svgFull = readFileSync(join(root, "icons/icon.svg"), "utf8");
const svgSmall = readFileSync(join(root, "icons/icon-small.svg"), "utf8");
const exe = process.env.CHROMIUM_PATH
  ?? process.env.HOME + "/.cache/ms-playwright/chromium-1223/chrome-linux64/chrome";

const browser = await chromium.launch({ executablePath: exe, args: ["--headless=new", "--no-sandbox"] });
for (const n of [16, 32, 48, 128]) {
  const page = await browser.newPage({ viewport: { width: n, height: n }, deviceScaleFactor: 1 });
  const svg = n <= 16 ? svgSmall : svgFull;
  await page.setContent(
    `<style>*{margin:0;padding:0}body{background:transparent}svg{display:block;width:${n}px;height:${n}px}</style>${svg}`,
  );
  await page.screenshot({ path: join(root, `icons/icon-${n}.png`), omitBackground: true });
  await page.close();
  console.log(`icons/icon-${n}.png`);
}
await browser.close();
