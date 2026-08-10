/**
 * Popup orchestrator: i18n + RTL, prefill (query params from the context
 * menu, else the active tab's URL via the activeTab grant), 13 content
 * types, live preview, presets/colors, download/copy, persistence.
 *
 * Zero network requests — everything renders locally.
 */
import { ext } from "../compat";
import { FORM_DEFS, renderForm } from "./forms";
import { parsePrefill, isPrefillableUrl } from "./prefill";
import { renderBlob, renderPreview, triggerDownload } from "./preview";
import { markActivePreset, renderPresetStrip, updateScannability } from "./presets-ui";
import { loadState, saveState, type PersistedState } from "./state";
import { encode, type ContentType } from "../shared/qr-encoders";
import { PRESETS } from "../shared/presets";
import { defaultDesign, type DesignConfig } from "../shared/types";

const msg = (key: string) => ext.i18n.getMessage(key) || key;
const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;

const CHIP_TYPES: ContentType[] = ["url", "text", "wifi", "vcard", "crypto"];
const MORE_TYPES: ContentType[] = [
  "email", "sms", "phone", "mecard", "event", "location", "social", "app",
];
const SITE = "https://qr-cow.com";

// ---------------------------------------------------------------- state
let contentType: ContentType = "url";
let fields: Partial<Record<ContentType, Record<string, string>>> = {};
let design: DesignConfig = { ...defaultDesign, ...(PRESETS[0]?.design ?? {}) };
let presetId: string | null = PRESETS[0]?.id ?? null;
let encoded = "";
let renderTimer: ReturnType<typeof setTimeout> | undefined;

function currentFields(): Record<string, string> {
  return fields[contentType] ?? {};
}

function persist(): void {
  saveState({ contentType, fields, design, presetId } satisfies PersistedState);
}

// -------------------------------------------------------------- preview
function refreshPreview(): void {
  clearTimeout(renderTimer);
  renderTimer = setTimeout(() => {
    encoded = encode(contentType, currentFields());
    const host = $("preview-canvas");
    const empty = $("preview-empty");
    const hasData = encoded.length > 0;
    empty.hidden = hasData;
    if (hasData) renderPreview(host, encoded, design);
    else host.textContent = "";
    updateScannability($("scannability"), design, hasData);
    const disabled = !hasData;
    ($("download-png") as HTMLButtonElement).disabled = disabled;
    ($("download-svg") as HTMLButtonElement).disabled = disabled;
    ($("copy") as HTMLButtonElement).disabled = disabled;
  }, 150);
}

// ---------------------------------------------------------------- types
function setContentType(next: ContentType): void {
  contentType = next;
  for (const el of Array.from(document.querySelectorAll<HTMLElement>(".chip"))) {
    el.setAttribute("aria-pressed", String(el.dataset.type === next));
  }
  const more = $("more-select") as HTMLSelectElement | null;
  if (more) more.value = MORE_TYPES.includes(next) ? next : "";
  renderForm($("form"), next, currentFields(), (name, value) => {
    fields[contentType] = { ...currentFields(), [name]: value };
    persist();
    refreshPreview();
  });
  maybeShowUseCurrentTab();
  persist();
  refreshPreview();
}

function buildTypeChips(): void {
  const nav = $("type-chips");
  nav.textContent = "";
  for (const t of CHIP_TYPES) {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "chip";
    chip.dataset.type = t;
    chip.textContent = msg(`type_${t}`);
    chip.setAttribute("aria-pressed", String(t === contentType));
    chip.addEventListener("click", () => setContentType(t));
    nav.appendChild(chip);
  }
  const more = document.createElement("select");
  more.id = "more-select";
  more.className = "chip-more";
  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = msg("moreTypes");
  more.appendChild(placeholder);
  for (const t of MORE_TYPES) {
    const opt = document.createElement("option");
    opt.value = t;
    opt.textContent = msg(`type_${t}`);
    more.appendChild(opt);
  }
  more.addEventListener("change", () => {
    if (more.value) setContentType(more.value as ContentType);
  });
  nav.appendChild(more);
}

// ------------------------------------------------- active-tab prefill UI
async function maybeShowUseCurrentTab(): Promise<void> {
  document.getElementById("use-tab-btn")?.remove();
  if (contentType !== "url") return;
  try {
    const [tab] = await ext.tabs.query({ active: true, currentWindow: true });
    if (!isPrefillableUrl(tab?.url)) return;
    const url = tab.url;
    const btn = document.createElement("button");
    btn.type = "button";
    btn.id = "use-tab-btn";
    btn.className = "ghost-btn";
    btn.textContent = msg("useCurrentTab");
    btn.addEventListener("click", () => {
      fields.url = { ...(fields.url ?? {}), url };
      setContentType("url");
    });
    $("form").appendChild(btn);
  } catch {
    /* no activeTab grant in this context — fine */
  }
}

// -------------------------------------------------------------- presets
function applyPreset(id: string): void {
  const preset = PRESETS.find((p) => p.id === id);
  if (!preset) return;
  presetId = id;
  design = { ...defaultDesign, ...preset.design };
  syncColorInputs();
  markActivePreset($("presets"), id);
  persist();
  refreshPreview();
}

function syncColorInputs(): void {
  ($("fg") as HTMLInputElement).value = design.gradient ? design.gradient.from : design.fgColor;
  ($("bg") as HTMLInputElement).value = design.bgColor;
  ($("transparent") as HTMLInputElement).checked = design.transparentBg;
}

function wireColorControls(): void {
  $("fg").addEventListener("input", () => {
    // Manual fg pick = explicit override: gradient is dropped (matches
    // the studio's semantics).
    design = { ...design, fgColor: ($("fg") as HTMLInputElement).value, gradient: null };
    presetId = null;
    markActivePreset($("presets"), null);
    persist();
    refreshPreview();
  });
  $("bg").addEventListener("input", () => {
    design = { ...design, bgColor: ($("bg") as HTMLInputElement).value };
    presetId = null;
    markActivePreset($("presets"), null);
    persist();
    refreshPreview();
  });
  $("transparent").addEventListener("change", () => {
    design = { ...design, transparentBg: ($("transparent") as HTMLInputElement).checked };
    persist();
    refreshPreview();
  });
}

// -------------------------------------------------------------- actions
/** Two-rects clipboard icon, built via DOM APIs (web-ext lint bans innerHTML). */
function clipboardIcon(): SVGSVGElement {
  const NS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(NS, "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("width", "18");
  svg.setAttribute("height", "18");
  svg.setAttribute("fill", "none");
  svg.setAttribute("stroke", "currentColor");
  svg.setAttribute("stroke-width", "2");
  svg.setAttribute("stroke-linecap", "round");
  svg.setAttribute("stroke-linejoin", "round");
  svg.setAttribute("aria-hidden", "true");
  const back = document.createElementNS(NS, "path");
  back.setAttribute("d", "M8 8V5a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-3");
  const front = document.createElementNS(NS, "rect");
  front.setAttribute("x", "3");
  front.setAttribute("y", "8");
  front.setAttribute("width", "13");
  front.setAttribute("height", "13");
  front.setAttribute("rx", "2");
  svg.appendChild(back);
  svg.appendChild(front);
  return svg;
}

function flashCopied(text: string): void {
  const toast = $("copied-toast");
  toast.textContent = text;
  toast.hidden = false;
  setTimeout(() => (toast.hidden = true), 1600);
}

function wireActions(): void {
  $("download-png").addEventListener("click", async () => {
    if (!encoded) return;
    const blob = await renderBlob(encoded, design, "png");
    if (blob) triggerDownload(blob, "qr-cow.png");
  });
  $("download-svg").addEventListener("click", async () => {
    if (!encoded) return;
    const blob = await renderBlob(encoded, design, "svg");
    if (blob) triggerDownload(blob, "qr-cow.svg");
  });
  $("copy").addEventListener("click", () => {
    if (!encoded) return;
    // Keep the clipboard call inside the click handler's gesture window:
    // build the promise chain synchronously, no awaits before write().
    if ("ClipboardItem" in window) {
      const item = new ClipboardItem({ "image/png": renderBlob(encoded, design, "png").then((b) => b ?? new Blob()) });
      navigator.clipboard.write([item]).then(
        () => flashCopied(msg("copied")),
        () => navigator.clipboard.writeText(encoded).then(() => flashCopied(msg("copied"))),
      );
    } else {
      navigator.clipboard.writeText(encoded).then(() => flashCopied(msg("copied")));
    }
  });
}

function wireFooter(): void {
  const open = (url: string) => (e: Event) => {
    e.preventDefault();
    ext.tabs.create({ url });
    window.close();
  };
  const studio = $("open-studio") as HTMLAnchorElement;
  studio.textContent = msg("openStudio");
  studio.addEventListener("click", open(`${SITE}/generate?source=firefox-ext`));
  $("open-site").addEventListener("click", open(`${SITE}/?source=firefox-ext`));
}

// ----------------------------------------------------------------- init
async function init(): Promise<void> {
  // RTL + static labels.
  // bidiDir is generated per-locale (see scripts/locale-map.cjs) so the
  // direction follows the resolved MESSAGES, not the browser UI locale.
  document.documentElement.dir = msg("bidiDir") === "rtl" ? "rtl" : "ltr";
  document.documentElement.lang = ext.i18n.getUILanguage();
  $("fg-label").textContent = msg("designForeground");
  $("bg-label").textContent = msg("designBackground");
  $("transparent-label").textContent = msg("transparentBg");
  $("preview-empty").textContent = msg("previewEmpty");
  $("download-png").textContent = msg("downloadPng");
  $("download-svg").textContent = msg("downloadSvg");
  const copyBtn = $("copy");
  // A real clipboard icon (currentColor, themes with light/dark) — the old
  // "⧉" glyph rendered faint/boxy on many systems and read as noise.
  copyBtn.appendChild(clipboardIcon());
  copyBtn.title = msg("copy");
  copyBtn.setAttribute("aria-label", msg("copy"));

  const prefill = parsePrefill(location.search);
  if (prefill.mode === "window") document.body.classList.add("window-mode");

  // Restore last-used state; prefill wins for its own field.
  const saved = await loadState();
  if (saved) {
    contentType = saved.contentType;
    fields = saved.fields ?? {};
    design = { ...defaultDesign, ...saved.design };
    presetId = saved.presetId ?? null;
  }
  if (prefill.type) {
    contentType = prefill.type;
    if (Object.keys(prefill.values).length) {
      fields[prefill.type] = { ...(fields[prefill.type] ?? {}), ...prefill.values };
    }
  } else if (!saved && contentType === "url" && !fields.url?.url) {
    // FIRST-EVER open only (no persisted state yet): seed from the active
    // tab as an onboarding touch. Later opens restore what the user last
    // had and never auto-overwrite it — the "Use current tab" button in
    // the URL form is the explicit opt-in from then on.
    try {
      const [tab] = await ext.tabs.query({ active: true, currentWindow: true });
      if (isPrefillableUrl(tab?.url)) fields.url = { url: tab.url };
    } catch {
      /* no grant — leave empty */
    }
  }

  buildTypeChips();
  renderPresetStrip($("presets"), presetId, applyPreset);
  syncColorInputs();
  wireColorControls();
  wireActions();
  wireFooter();
  setContentType(contentType);
}

init();
