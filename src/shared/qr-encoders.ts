// GENERATED FILE — do not edit. Source of truth lives in apps/web.
// Refresh with: npm run sync-shared (tools/firefox-extension)

/**
 * Pure functions that turn each content-type's form values into the encoded
 * string that goes into the QR code. Each encoder is responsible for the
 * tiny escape rules required by its standard (vCard 3.0, WIFI:T:WPA;S:...;P:…;;,
 * etc.) so callers can stay declarative.
 */

export type ContentType =
  | "url"
  | "text"
  | "email"
  | "sms"
  | "phone"
  | "vcard"
  | "mecard"
  | "wifi"
  | "event"
  | "location"
  | "social"
  | "crypto"
  | "app";

export type EncoderInput = Record<string, string | undefined>;

const esc = (s: string | undefined, chars: string) =>
  (s ?? "")
    .split("")
    .map((c) => (chars.includes(c) ? `\\${c}` : c))
    .join("");

const normaliseUrl = (u: string | undefined): string => {
  const v = (u ?? "").trim();
  if (!v) return "";
  if (/^[a-z][a-z0-9+.-]*:/i.test(v)) return v; // already has a scheme
  return `https://${v}`;
};

const fmtVDate = (s: string | undefined): string => {
  // accept either YYYY-MM-DDTHH:mm (datetime-local) or a full ISO string
  if (!s) return "";
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
};

export const encoders: Record<ContentType, (v: EncoderInput) => string> = {
  url: (v) => normaliseUrl(v.url),

  text: (v) => (v.text ?? "").slice(0, 4000),

  email: (v) => {
    const to = (v.email ?? "").trim();
    if (!to) return "";
    const q = new URLSearchParams();
    if (v.subject) q.set("subject", v.subject);
    if (v.body) q.set("body", v.body);
    const qs = q.toString();
    return `mailto:${to}${qs ? "?" + qs : ""}`;
  },

  sms: (v) => {
    const to = (v.phone ?? "").trim().replace(/[^+\d]/g, "");
    if (!to) return "";
    return v.body ? `SMSTO:${to}:${v.body}` : `sms:${to}`;
  },

  phone: (v) => {
    const num = (v.phone ?? "").trim().replace(/[^+\d]/g, "");
    return num ? `tel:${num}` : "";
  },

  vcard: (v) => {
    const lines = [
      "BEGIN:VCARD",
      "VERSION:3.0",
      `N:${esc(v.lastName, ",;\\")};${esc(v.firstName, ",;\\")}`,
      `FN:${esc(`${v.firstName ?? ""} ${v.lastName ?? ""}`.trim(), ",;\\")}`,
    ];
    if (v.organization) lines.push(`ORG:${esc(v.organization, ",;\\")}`);
    if (v.title) lines.push(`TITLE:${esc(v.title, ",;\\")}`);
    if (v.phone) lines.push(`TEL;TYPE=CELL:${v.phone.replace(/[^+\d]/g, "")}`);
    if (v.email) lines.push(`EMAIL:${v.email}`);
    if (v.url) lines.push(`URL:${normaliseUrl(v.url)}`);
    if (v.address) lines.push(`ADR:;;${esc(v.address, ",;\\")};;;;`);
    lines.push("END:VCARD");
    return lines.join("\n");
  },

  mecard: (v) => {
    // MECARD is a more compact alternative — Japanese-origin spec used by some scanners
    const parts: string[] = ["MECARD:"];
    if (v.lastName || v.firstName)
      parts.push(`N:${esc(v.lastName, ",;\\:")},${esc(v.firstName, ",;\\:")};`);
    if (v.phone) parts.push(`TEL:${v.phone.replace(/[^+\d]/g, "")};`);
    if (v.email) parts.push(`EMAIL:${esc(v.email, ",;\\:")};`);
    if (v.url) parts.push(`URL:${esc(normaliseUrl(v.url), ",;\\:")};`);
    if (v.address) parts.push(`ADR:${esc(v.address, ",;\\:")};`);
    parts.push(";");
    return parts.join("");
  },

  wifi: (v) => {
    // WIFI:T:WPA;S:<ssid>;P:<password>;H:<hidden>;;
    const auth = (v.encryption ?? "WPA").toUpperCase(); // WPA | WEP | nopass
    const ssid = esc(v.ssid ?? "", '\\;,"');
    const pwd = esc(v.password ?? "", '\\;,"');
    const hidden = v.hidden === "true" ? "true" : "false";
    return `WIFI:T:${auth};S:${ssid};${auth !== "NOPASS" ? `P:${pwd};` : ""}H:${hidden};;`;
  },

  event: (v) => {
    const lines = [
      "BEGIN:VEVENT",
      `SUMMARY:${esc(v.title, ",;\\")}`,
    ];
    if (v.location) lines.push(`LOCATION:${esc(v.location, ",;\\")}`);
    if (v.description) lines.push(`DESCRIPTION:${esc(v.description, ",;\\")}`);
    if (v.start) lines.push(`DTSTART:${fmtVDate(v.start)}`);
    if (v.end) lines.push(`DTEND:${fmtVDate(v.end)}`);
    lines.push("END:VEVENT");
    return lines.join("\n");
  },

  location: (v) => {
    const lat = (v.lat ?? "").trim();
    const lng = (v.lng ?? "").trim();
    if (!lat || !lng) return "";
    return v.query ? `geo:${lat},${lng}?q=${encodeURIComponent(v.query)}` : `geo:${lat},${lng}`;
  },

  social: (v) => {
    // The form provides handle + network; we build the canonical URL
    const handle = (v.handle ?? "").trim().replace(/^@/, "");
    if (!handle) return "";
    switch (v.network) {
      case "instagram":
        return `https://instagram.com/${handle}`;
      case "twitter":
      case "x":
        return `https://x.com/${handle}`;
      case "facebook":
        return `https://facebook.com/${handle}`;
      case "youtube":
        return `https://youtube.com/@${handle}`;
      case "tiktok":
        return `https://www.tiktok.com/@${handle}`;
      case "whatsapp":
        return `https://wa.me/${handle.replace(/[^+\d]/g, "")}${
          v.body ? `?text=${encodeURIComponent(v.body)}` : ""
        }`;
      case "linkedin":
        return `https://linkedin.com/in/${handle}`;
      default:
        return normaliseUrl(handle);
    }
  },

  crypto: (v) => {
    // bitcoin:<address>?amount=…  / ethereum:<address>  / usdt — many wallets accept "tron:"
    // We only emit BIP-21-style URIs that the major wallets recognise.
    const addr = (v.address ?? "").trim();
    if (!addr) return "";
    const scheme = (v.network ?? "bitcoin").toLowerCase();
    const q = new URLSearchParams();
    if (v.amount) q.set("amount", v.amount);
    if (v.label) q.set("label", v.label);
    if (v.message) q.set("message", v.message);
    const qs = q.toString();
    return `${scheme}:${addr}${qs ? "?" + qs : ""}`;
  },

  app: (v) => {
    // App-store link (iOS or Android). Single URL field, normalised.
    return normaliseUrl(v.url);
  },
};

/** Convenience: encode + return a usable string (or "") for any content type. */
export function encode(type: ContentType, values: EncoderInput): string {
  return encoders[type](values).trim();
}
