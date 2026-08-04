// GENERATED FILE — do not edit. Source of truth lives in apps/web.
// Refresh with: npm run sync-shared (tools/firefox-extension)

import type { DesignConfig } from "./types";

/**
 * Maps a studio DesignConfig to a qr-code-styling options object.
 *
 * Pure function, no framework imports — it is vendored verbatim into the
 * Firefox extension (tools/firefox-extension/src/shared/) by its
 * sync-shared script so the extension renders pixel-identical codes.
 * Keep it dependency-free.
 */
export type StyleOpts = Record<string, unknown>;

export function buildStyleOptions(data: string, d: DesignConfig): StyleOpts {
  const fg = d.fgColor;
  const dotsOptions: Record<string, unknown> = { type: d.dotsType };
  if (d.gradient) {
    dotsOptions.gradient = {
      type: "linear",
      rotation: (d.gradient.rotation * Math.PI) / 180,
      colorStops: [
        { offset: 0, color: d.gradient.from },
        { offset: 1, color: d.gradient.to },
      ],
    };
  } else {
    dotsOptions.color = fg;
  }
  const opts: StyleOpts = {
    type: "svg",
    margin: 4,
    data: data || " ", // qr-code-styling needs *some* content
    qrOptions: { errorCorrectionLevel: d.errorCorrection },
    dotsOptions,
    cornersSquareOptions: {
      type: d.cornersSquareType,
      color: d.cornersSquareColor ?? fg,
    },
    cornersDotOptions: {
      type: d.cornersDotType,
      color: d.cornersDotColor ?? fg,
    },
    backgroundOptions: d.transparentBg ? { color: "rgba(0,0,0,0)" } : { color: d.bgColor },
  };
  if (d.logoDataUrl) {
    opts.image = d.logoDataUrl;
    opts.imageOptions = {
      hideBackgroundDots: d.hideBgBehindLogo,
      imageSize: d.logoSize,
      margin: 6,
      crossOrigin: "anonymous",
    };
  }
  return opts;
}
