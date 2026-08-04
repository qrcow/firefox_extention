/**
 * Pure locale-mapping logic shared by scripts/gen-locales.mjs (ESM) and
 * tests/locales.test.ts (ts-jest/CJS) — hence CommonJS.
 */
const LOCALES = ["en", "fa", "ar", "es", "fr", "de", "pt", "zh", "tr", "ru"];

const CONTENT_TYPES = [
  "url", "text", "wifi", "vcard", "mecard", "email", "sms",
  "phone", "event", "location", "social", "crypto", "app",
];
const PRESET_IDS = [
  "restaurant", "cafe", "tech", "event", "retail", "wedding", "healthcare",
  "real-estate", "business-card", "crypto", "sunset", "ocean", "forest",
  "aurora", "berry", "mono",
];
// forms.<group>.<field> pairs the popup actually uses (allowlist — ICU-bearing
// keys like text.count are deliberately absent).
const FORM_KEYS = [
  ["url", ["label", "hint"]],
  ["text", ["label"]],
  ["email", ["to", "subject", "body"]],
  ["sms", ["phone", "phoneHint", "message"]],
  ["phone", ["label", "hint"]],
  ["person", ["firstName", "lastName", "phone", "email", "company", "title", "website", "address"]],
  ["wifi", ["ssid", "ssidHint", "security", "noPassword", "hidden", "yes", "no", "password"]],
  ["event", ["title", "starts", "ends", "location", "description"]],
  ["location", ["lat", "latHint", "lng", "lngHint", "query"]],
  ["social", ["network", "handle", "handleHint"]],
  ["crypto", ["network", "address", "addressHint", "amount", "label", "message"]],
  ["app", ["label", "hint"]],
];

const get = (obj, path) => path.split(".").reduce((o, k) => (o == null ? undefined : o[k]), obj);

/** Build the flat key→string map for one locale (en used for fallback). */
function buildLocale(messages, en, extra, extraEn, locale) {
  const out = {};
  const put = (key, value, fallback) => {
    let v = value ?? fallback;
    if (typeof v !== "string" || !v) {
      throw new Error(`[${locale}] missing string for ${key}`);
    }
    if (v.includes("{") || v.includes("}")) {
      throw new Error(`[${locale}] ICU braces leaked into ${key}: ${v}`);
    }
    out[key] = { message: v };
  };

  // Text direction rides WITH the messages so the popup's dir always
  // matches the strings actually resolved — @@bidi_dir tracks the browser
  // UI locale, which can differ (e.g. Chromium --lang=fa keeps en-US UI
  // while resolving fa messages).
  out.bidiDir = { message: locale === "fa" || locale === "ar" ? "rtl" : "ltr" };

  // Extension-only strings.
  for (const key of Object.keys(extraEn)) {
    put(key, extra?.[key], extraEn[key]);
  }
  // Content-type labels.
  for (const t of CONTENT_TYPES) {
    put(`type_${t}`, get(messages, `generate.types.${t}`), get(en, `generate.types.${t}`));
  }
  // Preset names (hyphens → underscores for the key charset).
  for (const p of PRESET_IDS) {
    put(`preset_${p.replaceAll("-", "_")}`, get(messages, `generate.presets.${p}`), get(en, `generate.presets.${p}`));
  }
  // Download / copy labels.
  put("downloadPng", get(messages, "generate.download.primary"), get(en, "generate.download.primary"));
  put("downloadSvg", get(messages, "generate.download.svgLabel"), get(en, "generate.download.svgLabel"));
  put("copy", get(messages, "generate.download.copyToClipboard"), get(en, "generate.download.copyToClipboard"));
  put("copied", get(messages, "generate.download.copied"), get(en, "generate.download.copied"));
  // Design labels.
  put("designForeground", get(messages, "generate.design.foreground"), get(en, "generate.design.foreground"));
  put("designBackground", get(messages, "generate.design.background"), get(en, "generate.design.background"));
  // Preview / info.
  put("previewEmpty", get(messages, "generate.preview.empty"), get(en, "generate.preview.empty"));
  put("ratingExcellent", get(messages, "generate.info.ratingExcellent"), get(en, "generate.info.ratingExcellent"));
  put("ratingGood", get(messages, "generate.info.ratingGood"), get(en, "generate.info.ratingGood"));
  put("ratingLow", get(messages, "generate.info.ratingLow"), get(en, "generate.info.ratingLow"));
  put("lowContrastWarning", get(messages, "generate.info.lowContrastWarning"), get(en, "generate.info.lowContrastWarning"));
  // Form field labels.
  for (const [group, fields] of FORM_KEYS) {
    for (const f of fields) {
      put(`form_${group}_${f}`, get(messages, `generate.forms.${group}.${f}`), get(en, `generate.forms.${group}.${f}`));
    }
  }
  return out;
}


module.exports = { LOCALES, buildLocale };
