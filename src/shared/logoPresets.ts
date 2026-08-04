// GENERATED FILE — do not edit. Source of truth lives in apps/web.
// Refresh with: npm run sync-shared (tools/firefox-extension)

/**
 * Preset logos for the QR studio.
 *
 * The SVG source is inlined here (rather than referenced as a `/qr-logos/X.svg`
 * file path) so we can recolour it at runtime. Every preset uses `#111` for
 * both `stroke` and `fill`; the recolour helper just does a string replace.
 *
 * If you add a new preset, follow the same convention: `stroke="#111"` /
 * `fill="#111"` (or `fill="none"` for outline-only icons). Anything else
 * the user picks as a logo colour will get applied via the same replace.
 */

export const PRESET_LOGO_COLOR_PLACEHOLDER = "#111";

export type PresetLogo = {
  id: string;
  label: string;
  /** Raw SVG markup. Coloured with `recolourPresetSvg`. */
  svg: string;
};

export const PRESET_LOGOS: PresetLogo[] = [
  {
    id: "web",
    label: "Web",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#111" stroke-width="2"><circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18"/></svg>`,
  },
  {
    id: "email",
    label: "Email",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#111" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>`,
  },
  {
    id: "phone",
    label: "Phone",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#111"><path d="M6.6 10.8a15 15 0 006.6 6.6l2.2-2.2c.3-.3.7-.4 1-.3 1.2.4 2.5.6 3.8.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1A18 18 0 013 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.4.2 2.6.6 3.8.1.4 0 .8-.3 1L6.6 10.8z"/></svg>`,
  },
  {
    id: "audio",
    label: "Audio",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#111"><path d="M9 17V5l12-2v12M9 17a3 3 0 11-3-3 3 3 0 013 3zm12-2a3 3 0 11-3-3 3 3 0 013 3z" fill="none" stroke="#111" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  },
  {
    id: "video",
    label: "Video",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#111" stroke-width="2" stroke-linejoin="round"><rect x="3" y="6" width="13" height="12" rx="2"/><path d="M16 10l5-3v10l-5-3z"/></svg>`,
  },
  {
    id: "image",
    label: "Image",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#111" stroke-width="2" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="1.5" fill="#111"/><path d="M21 17l-6-6-8 8"/></svg>`,
  },
  {
    id: "doc",
    label: "Document",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#111" stroke-width="2" stroke-linejoin="round"><path d="M14 3H6a2 2 0 00-2 2v14a2 2 0 002 2h12a2 2 0 002-2V9z"/><path d="M14 3v6h6"/><path d="M8 14h8M8 17h6"/></svg>`,
  },
  {
    id: "pin",
    label: "Location",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#111"><path d="M12 2C7.6 2 4 5.6 4 10c0 6 8 12 8 12s8-6 8-12c0-4.4-3.6-8-8-8zm0 11a3 3 0 110-6 3 3 0 010 6z"/></svg>`,
  },
];

/** Build a data URL containing the SVG markup recoloured to `color`. */
export function recolourPresetSvg(svg: string, color: string): string {
  const recoloured = svg.split(PRESET_LOGO_COLOR_PLACEHOLDER).join(color);
  return `data:image/svg+xml;utf8,${encodeURIComponent(recoloured)}`;
}
