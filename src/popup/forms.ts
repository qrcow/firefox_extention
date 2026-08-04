/**
 * Per-type form definitions + DOM renderer.
 *
 * Field names MUST match the encoder input keys in shared/qr-encoders.ts
 * (that file is the contract). Label keys are the generated _locales keys
 * (see scripts/gen-locales.mjs mapping).
 */
import { ext } from "../compat";
import { STUDIO_LIMITS } from "../shared/inputLimits";
import type { ContentType } from "../shared/qr-encoders";

type FieldDef = {
  /** Encoder input key. */
  name: string;
  labelKey: string;
  hintKey?: string;
  kind: "text" | "password" | "textarea" | "select" | "datetime";
  maxLength?: number;
  /** For selects: [value, labelKey|literal][] — literals start with "=". */
  options?: [string, string][];
  placeholder?: string;
};

const L = STUDIO_LIMITS as Record<string, number>;

export const FORM_DEFS: Record<ContentType, FieldDef[]> = {
  url: [
    { name: "url", labelKey: "form_url_label", hintKey: "form_url_hint", kind: "text", maxLength: L.url, placeholder: "https://example.com" },
  ],
  text: [
    { name: "text", labelKey: "form_text_label", kind: "textarea", maxLength: L.text },
  ],
  email: [
    { name: "email", labelKey: "form_email_to", kind: "text", maxLength: L.email, placeholder: "hi@example.com" },
    { name: "subject", labelKey: "form_email_subject", kind: "text", maxLength: L.emailSubject },
    { name: "body", labelKey: "form_email_body", kind: "textarea", maxLength: L.emailBody },
  ],
  sms: [
    { name: "phone", labelKey: "form_sms_phone", hintKey: "form_sms_phoneHint", kind: "text", maxLength: L.phone, placeholder: "+15551234567" },
    { name: "body", labelKey: "form_sms_message", kind: "textarea", maxLength: L.smsBody },
  ],
  phone: [
    { name: "phone", labelKey: "form_phone_label", hintKey: "form_phone_hint", kind: "text", maxLength: L.phone, placeholder: "+15551234567" },
  ],
  vcard: [
    { name: "firstName", labelKey: "form_person_firstName", kind: "text", maxLength: L.firstName },
    { name: "lastName", labelKey: "form_person_lastName", kind: "text", maxLength: L.lastName },
    { name: "phone", labelKey: "form_person_phone", kind: "text", maxLength: L.phone },
    { name: "email", labelKey: "form_person_email", kind: "text", maxLength: L.email },
    { name: "organization", labelKey: "form_person_company", kind: "text", maxLength: L.organization },
    { name: "title", labelKey: "form_person_title", kind: "text", maxLength: L.jobTitle },
    { name: "url", labelKey: "form_person_website", kind: "text", maxLength: L.url },
    { name: "address", labelKey: "form_person_address", kind: "text", maxLength: L.address },
  ],
  mecard: [
    { name: "firstName", labelKey: "form_person_firstName", kind: "text", maxLength: L.firstName },
    { name: "lastName", labelKey: "form_person_lastName", kind: "text", maxLength: L.lastName },
    { name: "phone", labelKey: "form_person_phone", kind: "text", maxLength: L.phone },
    { name: "email", labelKey: "form_person_email", kind: "text", maxLength: L.email },
  ],
  wifi: [
    { name: "ssid", labelKey: "form_wifi_ssid", hintKey: "form_wifi_ssidHint", kind: "text", maxLength: L.wifiSsid },
    {
      name: "encryption", labelKey: "form_wifi_security", kind: "select",
      options: [["WPA", "=WPA/WPA2/WPA3"], ["WEP", "=WEP"], ["nopass", "form_wifi_noPassword"]],
    },
    { name: "password", labelKey: "form_wifi_password", kind: "password", maxLength: L.wifiPassword },
    {
      name: "hidden", labelKey: "form_wifi_hidden", kind: "select",
      options: [["false", "form_wifi_no"], ["true", "form_wifi_yes"]],
    },
  ],
  event: [
    { name: "title", labelKey: "form_event_title", kind: "text", maxLength: 200 },
    { name: "start", labelKey: "form_event_starts", kind: "datetime" },
    { name: "end", labelKey: "form_event_ends", kind: "datetime" },
    { name: "location", labelKey: "form_event_location", kind: "text", maxLength: L.address },
    { name: "description", labelKey: "form_event_description", kind: "textarea", maxLength: 500 },
  ],
  location: [
    { name: "lat", labelKey: "form_location_lat", hintKey: "form_location_latHint", kind: "text", maxLength: 24, placeholder: "40.7128" },
    { name: "lng", labelKey: "form_location_lng", hintKey: "form_location_lngHint", kind: "text", maxLength: 24, placeholder: "-74.0060" },
    { name: "query", labelKey: "form_location_query", kind: "text", maxLength: 120 },
  ],
  social: [
    {
      name: "network", labelKey: "form_social_network", kind: "select",
      options: [
        ["instagram", "=Instagram"], ["x", "=X (Twitter)"], ["facebook", "=Facebook"],
        ["youtube", "=YouTube"], ["tiktok", "=TikTok"], ["whatsapp", "=WhatsApp"],
        ["linkedin", "=LinkedIn"],
      ],
    },
    { name: "handle", labelKey: "form_social_handle", hintKey: "form_social_handleHint", kind: "text", maxLength: 120 },
  ],
  crypto: [
    {
      name: "network", labelKey: "form_crypto_network", kind: "select",
      options: [["bitcoin", "=Bitcoin"], ["ethereum", "=Ethereum"], ["tron", "=Tron (USDT)"], ["litecoin", "=Litecoin"]],
    },
    { name: "address", labelKey: "form_crypto_address", hintKey: "form_crypto_addressHint", kind: "text", maxLength: L.cryptoAddress ?? 128 },
    { name: "amount", labelKey: "form_crypto_amount", kind: "text", maxLength: 32 },
  ],
  app: [
    { name: "url", labelKey: "form_app_label", hintKey: "form_app_hint", kind: "text", maxLength: L.url },
  ],
};

const msg = (key: string) => ext.i18n.getMessage(key) || key;
const optionLabel = (l: string) => (l.startsWith("=") ? l.slice(1) : msg(l));

/**
 * Renders the form for `type` into `host`, seeding inputs from `values`,
 * calling `onChange(name, value)` on every input/change event.
 */
export function renderForm(
  host: HTMLElement,
  type: ContentType,
  values: Record<string, string>,
  onChange: (name: string, value: string) => void,
): void {
  host.textContent = "";
  for (const def of FORM_DEFS[type]) {
    const field = document.createElement("div");
    field.className = "field";

    const label = document.createElement("label");
    label.className = "field-label";
    label.textContent = msg(def.labelKey);
    const id = `f-${type}-${def.name}`;
    label.htmlFor = id;
    field.appendChild(label);

    let input: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
    if (def.kind === "textarea") {
      input = document.createElement("textarea");
    } else if (def.kind === "select") {
      input = document.createElement("select");
      for (const [value, l] of def.options ?? []) {
        const opt = document.createElement("option");
        opt.value = value;
        opt.textContent = optionLabel(l);
        input.appendChild(opt);
      }
    } else {
      input = document.createElement("input");
      (input as HTMLInputElement).type =
        def.kind === "password" ? "password" : def.kind === "datetime" ? "datetime-local" : "text";
    }
    input.id = id;
    if (def.maxLength && "maxLength" in input) input.maxLength = def.maxLength;
    if (def.placeholder && "placeholder" in input) input.placeholder = def.placeholder;
    input.value = values[def.name] ?? (def.kind === "select" ? (def.options?.[0]?.[0] ?? "") : "");
    input.addEventListener("input", () => onChange(def.name, input.value));
    input.addEventListener("change", () => onChange(def.name, input.value));
    field.appendChild(input);

    if (def.hintKey) {
      const hint = document.createElement("p");
      hint.className = "field-hint";
      hint.textContent = msg(def.hintKey);
      field.appendChild(hint);
    }
    host.appendChild(field);
  }
}
