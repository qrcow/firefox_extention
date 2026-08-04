/**
 * Runs the gen-locales mapping in-memory for all 10 locales: every
 * required key present, no ICU braces, WebExtension-safe key charset.
 */
import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { buildLocale, LOCALES } = require("../scripts/locale-map.cjs");

const extRoot = resolve(__dirname, "..");
const messagesDir = resolve(extRoot, "../../apps/web/messages");

const en = JSON.parse(readFileSync(join(messagesDir, "en.json"), "utf8"));
const extraAll = JSON.parse(readFileSync(join(extRoot, "i18n/extra.json"), "utf8"));

describe("gen-locales", () => {
  const enMap = buildLocale(en, en, extraAll.en, extraAll.en, "en");
  const requiredKeys = Object.keys(enMap);

  it("produces a sane English baseline", () => {
    expect(requiredKeys.length).toBeGreaterThan(90);
    expect(enMap.extName.message).toContain("qr-cow");
    expect(enMap.type_wifi.message).toBe("Wi-Fi");
  });

  it.each(LOCALES as string[])("locale %s has every key, no ICU braces, valid charset", (locale) => {
    const messages =
      locale === "en" ? en : JSON.parse(readFileSync(join(messagesDir, `${locale}.json`), "utf8"));
    const map = buildLocale(messages, en, extraAll[locale], extraAll.en, locale);
    expect(Object.keys(map).sort()).toEqual([...requiredKeys].sort());
    for (const [key, entry] of Object.entries(map) as [string, { message: string }][]) {
      expect(key).toMatch(/^[A-Za-z0-9_@]+$/);
      expect(entry.message).not.toMatch(/[{}]/);
      expect(entry.message.length).toBeGreaterThan(0);
    }
  });

  it("throws when a mapped value carries ICU braces", () => {
    const poisoned = JSON.parse(JSON.stringify(en));
    poisoned.generate.types.url = "URL {n}";
    expect(() => buildLocale(poisoned, en, extraAll.en, extraAll.en, "en")).toThrow(/ICU/);
  });

  it("falls back to English for a missing key in another locale", () => {
    const sparse = JSON.parse(JSON.stringify(en));
    delete sparse.generate.types.wifi;
    const map = buildLocale(sparse, en, extraAll.en, extraAll.en, "xx");
    expect(map.type_wifi.message).toBe("Wi-Fi");
  });
});
