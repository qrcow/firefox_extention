// GENERATED FILE — do not edit. Source of truth lives in apps/web.
// Refresh with: npm run sync-shared (tools/firefox-extension)

/**
 * Centralised maximum-length and format constants for every user-facing
 * input on qr-cow. Two reasons it lives in one place:
 *
 *  1. The same field can appear in multiple forms (e.g. an email shows
 *     up in the auth flow, the vCard form, the SMTP admin panel). Drift
 *     between them creates either a UX inconsistency or a back-end
 *     validation surprise.
 *  2. We want the UI maxlength attribute to roughly match the API's
 *     Pydantic max_length. If those drift, the UI silently accepts more
 *     than the API will keep, producing confusing 422s on submit.
 *
 * The QR-encoder layer already truncates text content to 4000 chars to
 * stay within the QR Code 2.0 binary-encoding ceiling at high error
 * correction; everything else below is a sensible UX cap, not a
 * format-enforced one.
 */

// ---- QR studio content forms -------------------------------------------

export const STUDIO_LIMITS = {
  /** URL form — the URL itself. RFC 9110 has no hard cap, but anything
   *  past 2048 starts breaking Outlook + some QR scanners. */
  url: 2048,
  /** Plain-text form. Matches the qr-encoders 4000-char truncation. */
  text: 4000,
  /** Email-to address in the Email form (or vCard). */
  email: 254,
  /** Email subject line. Same as RFC 5322 "reasonable" limit. */
  emailSubject: 200,
  /** Email body. Wallets / mail clients won't open mailto: longer than
   *  this without warning the user. */
  emailBody: 2000,

  /** International phone with format + spaces. 32 is enough for any
   *  real number with extension. */
  phone: 32,
  /** SMS body. The actual SMS standard is 160 chars; we give a bit more
   *  for mailto-style scanners that pre-fill it. */
  smsBody: 320,

  /** vCard / MeCard first + last name. */
  firstName: 80,
  lastName: 80,
  organization: 120,
  jobTitle: 120,
  address: 200,

  /** Wi-Fi SSID. IEEE 802.11 caps at 32 bytes. */
  wifiSsid: 32,
  /** Wi-Fi password. WPA3 allows up to 63 chars. */
  wifiPassword: 63,

  /** Event title + description. */
  eventTitle: 200,
  eventLocation: 200,
  eventDescription: 1000,

  /** Lat/Lng numeric strings. */
  geoCoord: 12,
  /** Free-text location query. */
  locationQuery: 200,

  /** Social handle (Twitter is 15, Insta 30, TikTok 24; 32 is a safe cap). */
  socialHandle: 32,

  /** Crypto address. Bitcoin Bech32 is 62, BTC P2PKH is 34, ETH is 42,
   *  Tron is 34. 128 is generous future-proofing. */
  cryptoAddress: 128,
  /** BIP-21 label / message. */
  cryptoLabel: 200,
  cryptoMessage: 200,

  /** App-store URL. */
  appUrl: 2048,
} as const;

// ---- Save flow + dashboard ---------------------------------------------

export const DASHBOARD_LIMITS = {
  /** QR-code display name. Mirrors `QrCreateIn.name` (max_length=120). */
  qrName: 120,
  /** Personal access token name. Mirrors `TokenCreateIn.name` (80). */
  apiTokenName: 80,
} as const;

// ---- Auth -------------------------------------------------------------

export const AUTH_LIMITS = {
  email: 254,
  password: 128,
  fullName: 120,
} as const;

// ---- Tiny client-side validators ---------------------------------------
//
// These are deliberately permissive — for a great-UX inline error the
// rule of thumb is "warn when the input is obviously broken, accept
// everything else and let the server be the source of truth on edge
// cases".

const URL_RE = /^([a-z][a-z0-9+.-]*:)?\/\/[^\s]+$|^[a-z0-9-]+(\.[a-z0-9-]+)+([/?#][^\s]*)?$/i;

export function isValidUrl(v: string): boolean {
  const t = v.trim();
  if (!t) return false;
  return URL_RE.test(t);
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(v: string): boolean {
  const t = v.trim();
  if (!t) return false;
  if (t.length > AUTH_LIMITS.email) return false;
  return EMAIL_RE.test(t);
}

const PHONE_RE = /^\+?[\d\s\-().]{4,}$/;

export function isValidPhone(v: string): boolean {
  const t = v.trim();
  if (!t) return false;
  return PHONE_RE.test(t);
}

export function isValidLatLng(v: string): boolean {
  const n = Number(v);
  return Number.isFinite(n) && n >= -180 && n <= 180;
}
