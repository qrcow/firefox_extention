// GENERATED FILE — do not edit. Source of truth lives in apps/web.
// Refresh with: npm run sync-shared (tools/firefox-extension)

/**
 * WCAG-style contrast ratio for a foreground/background colour pair, used to
 * tell the user whether their QR is actually scannable. QR scanners need a
 * minimum of about 3:1 to read reliably; 7:1 is what we call "Excellent."
 */

function hexToRgb(hex: string): [number, number, number] {
  const m = hex.replace("#", "");
  const expanded =
    m.length === 3
      ? m
          .split("")
          .map((c) => c + c)
          .join("")
      : m;
  const n = parseInt(expanded || "0", 16);
  return [(n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff];
}

function relativeLuminance([r, g, b]: [number, number, number]): number {
  const channel = (v: number) => {
    const x = v / 255;
    return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

/** Standard WCAG contrast ratio. Always >= 1; 21 for black on white. */
export function contrastRatio(fg: string, bg: string): number {
  const l1 = relativeLuminance(hexToRgb(fg));
  const l2 = relativeLuminance(hexToRgb(bg));
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

export type ScanRating = {
  level: "excellent" | "good" | "low";
  label: string;
  ratio: number;
};

export function rateScannability(fg: string, bg: string): ScanRating {
  const r = contrastRatio(fg, bg);
  if (r >= 7) return { level: "excellent", label: "Excellent", ratio: r };
  if (r >= 3.5) return { level: "good", label: "Good", ratio: r };
  return { level: "low", label: "Low, may not scan", ratio: r };
}
