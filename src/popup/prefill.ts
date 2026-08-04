/**
 * Pure prefill logic — parses the popup's query string (set by the
 * background context-menu handler) and validates active-tab URLs.
 * Kept DOM-free so jest can cover it without a browser shim.
 */
import type { ContentType } from "../shared/qr-encoders";

export type Prefill = {
  /** "window" when opened via context menu (standalone popup window). */
  mode: "popup" | "window";
  type: ContentType | null;
  values: Record<string, string>;
};

const PREFILLABLE_TYPES: ReadonlySet<string> = new Set(["url", "text"]);

/** Only http(s) pages are worth encoding; about:/moz-extension:/file: are noise. */
export function isPrefillableUrl(url: string | undefined | null): url is string {
  return typeof url === "string" && /^https?:\/\//i.test(url);
}

export function parsePrefill(search: string): Prefill {
  const p = new URLSearchParams(search);
  const mode = p.get("mode") === "window" ? "window" : "popup";
  const rawType = p.get("type");
  const type = rawType && PREFILLABLE_TYPES.has(rawType) ? (rawType as ContentType) : null;
  const values: Record<string, string> = {};
  if (type === "url") {
    const url = p.get("url") ?? "";
    if (isPrefillableUrl(url)) values.url = url.slice(0, 2048);
  } else if (type === "text") {
    const text = p.get("text") ?? "";
    if (text) values.text = text.slice(0, 4000);
  }
  // A type param with no usable value is still an intent — keep the type,
  // start with an empty form.
  return { mode, type, values };
}
