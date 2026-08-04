/**
 * Preset strip (16 pills with CSS swatches — no mini-QR renders) plus the
 * color/transparent controls and the scannability badge.
 */
import { ext } from "../compat";
import { PRESETS } from "../shared/presets";
import { rateScannability } from "../shared/qr-contrast";
import type { DesignConfig } from "../shared/types";

const msg = (key: string) => ext.i18n.getMessage(key) || key;

export function renderPresetStrip(
  host: HTMLElement,
  activeId: string | null,
  onPick: (presetId: string) => void,
): void {
  host.textContent = "";
  for (const preset of PRESETS) {
    const pill = document.createElement("button");
    pill.type = "button";
    pill.className = "preset-pill";
    pill.setAttribute("aria-pressed", String(preset.id === activeId));
    pill.dataset.presetId = preset.id;

    const swatch = document.createElement("span");
    swatch.className = "preset-swatch";
    const d = preset.design;
    const fg = d.gradient
      ? `linear-gradient(${d.gradient.rotation ?? 0}deg, ${d.gradient.from}, ${d.gradient.to})`
      : (d.fgColor ?? "#1F2937");
    // bg disk with an fg core — reads as "colors of this preset" at 16px.
    swatch.style.background = `radial-gradient(circle at center, transparent 0 3px, ${d.bgColor ?? "#fff"} 3px 5px, transparent 5px), ${fg}`;
    swatch.style.borderColor = d.bgColor ?? "#e5e7eb";
    pill.appendChild(swatch);

    const name = document.createElement("span");
    name.textContent = msg(`preset_${preset.id.replaceAll("-", "_")}`);
    pill.appendChild(name);

    pill.addEventListener("click", () => onPick(preset.id));
    host.appendChild(pill);
  }
  // RTL-safe initial scroll position: logical start is handled by the
  // browser; nothing to do — but keep the active pill in view.
  const active = host.querySelector<HTMLElement>('[aria-pressed="true"]');
  active?.scrollIntoView({ inline: "center", block: "nearest" });
}

export function markActivePreset(host: HTMLElement, activeId: string | null): void {
  for (const el of Array.from(host.querySelectorAll<HTMLElement>(".preset-pill"))) {
    el.setAttribute("aria-pressed", String(el.dataset.presetId === activeId));
  }
}

/** Update the contrast badge under the preview. Hidden while transparent
 *  (contrast then depends on where the code is placed, not on bgColor). */
export function updateScannability(el: HTMLElement, design: DesignConfig, hasData: boolean): void {
  if (!hasData || design.transparentBg) {
    el.hidden = true;
    return;
  }
  // Gradients: rate the "from" stop — matches the studio's behaviour of
  // warning on the weakest practical case.
  const fg = design.gradient ? design.gradient.from : design.fgColor;
  const rating = rateScannability(fg, design.bgColor);
  el.hidden = false;
  el.dataset.level = rating.level;
  el.textContent =
    rating.level === "low"
      ? msg("lowContrastWarning")
      : msg(rating.level === "excellent" ? "ratingExcellent" : "ratingGood");
}
