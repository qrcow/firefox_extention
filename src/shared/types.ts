// GENERATED FILE — do not edit. Source of truth lives in apps/web.
// Refresh with: npm run sync-shared (tools/firefox-extension)

import type { ContentType } from "./qr-encoders";

export type { ContentType };

export type GradientConfig = { from: string; to: string; rotation: number } | null;

export type DesignConfig = {
  dotsType: "square" | "dots" | "rounded" | "classy" | "classy-rounded" | "extra-rounded";
  cornersSquareType: "square" | "extra-rounded" | "dot";
  cornersDotType: "square" | "dot";
  fgColor: string;
  bgColor: string;
  transparentBg: boolean;
  gradient: GradientConfig;
  cornersSquareColor: string | null; // null = inherit fg
  cornersDotColor: string | null;    // null = inherit fg
  logoDataUrl: string | null;        // base64 data URL of the rendered logo (preset-recoloured or user upload)
  logoSize: number;                  // 0.1 – 0.5 fraction of QR
  hideBgBehindLogo: boolean;
  // When the user picks a preset (web/email/phone/…), we store its id here.
  // Custom uploads leave it as null. Used by DesignPanel to know whether
  // the colour picker can recolour the logo or not.
  presetLogoId: string | null;
  // Colour applied to preset logos. Ignored for custom uploads.
  logoColor: string;
  errorCorrection: "L" | "M" | "Q" | "H";
};

export type StudioFields = Partial<Record<ContentType, Record<string, string>>>;

export type StudioState = {
  contentType: ContentType;
  fields: StudioFields;
  design: DesignConfig;
};

export const defaultDesign: DesignConfig = {
  dotsType: "rounded",
  cornersSquareType: "extra-rounded",
  cornersDotType: "dot",
  fgColor: "#1F2937",
  bgColor: "#FFFFFF",
  transparentBg: false,
  gradient: null,
  cornersSquareColor: null,
  cornersDotColor: null,
  logoDataUrl: null,
  logoSize: 0.25,
  hideBgBehindLogo: true,
  presetLogoId: null,
  logoColor: "#111111",
  errorCorrection: "Q",
};
