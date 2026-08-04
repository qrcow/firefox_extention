// GENERATED FILE — do not edit. Source of truth lives in apps/web.
// Refresh with: npm run sync-shared (tools/firefox-extension)

import type { DesignConfig } from "./types";

export type Preset = { id: string; name: string; design: Partial<DesignConfig> };

// Named for the use case OR the palette the visitor is reaching for, not
// the underlying design tokens. "Restaurant" or "Sunset" is much easier
// to pick than "Friendly Rounded #2".
//
// Gradients come from palettes commonly used in modern SaaS hero / button
// gradients (Stripe-like, Linear-like, Vercel-like) so they read as
// "premium" out of the gate.
export const PRESETS: Preset[] = [
  // ── Use-case templates ───────────────────────────────────────────────
  {
    id: "restaurant",
    name: "Restaurant",
    design: {
      dotsType: "rounded",
      cornersSquareType: "extra-rounded",
      cornersDotType: "dot",
      fgColor: "#1F2937",
      bgColor: "#FFFDF9",
      gradient: null,
    },
  },
  {
    id: "cafe",
    name: "Café",
    design: {
      dotsType: "rounded",
      cornersSquareType: "extra-rounded",
      cornersDotType: "dot",
      fgColor: "#92400E",
      bgColor: "#FEF3C7",
      gradient: { from: "#92400E", to: "#D97706", rotation: 45 },
    },
  },
  {
    id: "tech",
    name: "Tech",
    design: {
      dotsType: "dots",
      cornersSquareType: "dot",
      cornersDotType: "dot",
      fgColor: "#0F172A",
      bgColor: "#FFFFFF",
      gradient: null,
    },
  },
  {
    id: "event",
    name: "Event",
    design: {
      dotsType: "classy-rounded",
      cornersSquareType: "extra-rounded",
      cornersDotType: "dot",
      fgColor: "#7c3aed",
      bgColor: "#FFFFFF",
      gradient: { from: "#ec4899", to: "#7c3aed", rotation: 45 },
    },
  },
  {
    id: "retail",
    name: "Retail",
    design: {
      dotsType: "rounded",
      cornersSquareType: "extra-rounded",
      cornersDotType: "dot",
      fgColor: "#F97316",
      bgColor: "#FFFDF9",
      gradient: { from: "#F97316", to: "#F5A300", rotation: 45 },
    },
  },
  {
    id: "wedding",
    name: "Wedding",
    design: {
      dotsType: "extra-rounded",
      cornersSquareType: "extra-rounded",
      cornersDotType: "dot",
      fgColor: "#9F1239",
      bgColor: "#FFF1F2",
      gradient: { from: "#fb7185", to: "#be185d", rotation: 45 },
    },
  },
  {
    id: "healthcare",
    name: "Healthcare",
    design: {
      dotsType: "rounded",
      cornersSquareType: "extra-rounded",
      cornersDotType: "dot",
      fgColor: "#0E7490",
      bgColor: "#ECFEFF",
      gradient: { from: "#06b6d4", to: "#0e7490", rotation: 45 },
    },
  },
  {
    id: "real-estate",
    name: "Real estate",
    design: {
      dotsType: "square",
      cornersSquareType: "extra-rounded",
      cornersDotType: "square",
      fgColor: "#1E3A8A",
      bgColor: "#EFF6FF",
      gradient: { from: "#1e3a8a", to: "#3b82f6", rotation: 90 },
    },
  },
  {
    id: "business-card",
    name: "Business card",
    design: {
      dotsType: "square",
      cornersSquareType: "square",
      cornersDotType: "square",
      fgColor: "#111111",
      bgColor: "#FFFFFF",
      gradient: null,
    },
  },
  {
    id: "crypto",
    name: "Crypto",
    design: {
      dotsType: "classy-rounded",
      cornersSquareType: "extra-rounded",
      cornersDotType: "dot",
      fgColor: "#06B6D4",
      bgColor: "#0B0F19",
      gradient: { from: "#06b6d4", to: "#7c3aed", rotation: 90 },
      errorCorrection: "H",
    },
  },

  // ── Gradient-led palettes ────────────────────────────────────────────
  {
    id: "sunset",
    name: "Sunset",
    design: {
      dotsType: "extra-rounded",
      cornersSquareType: "extra-rounded",
      cornersDotType: "dot",
      fgColor: "#f97316",
      bgColor: "#FFF7ED",
      gradient: { from: "#f97316", to: "#db2777", rotation: 45 },
    },
  },
  {
    id: "ocean",
    name: "Ocean",
    design: {
      dotsType: "rounded",
      cornersSquareType: "extra-rounded",
      cornersDotType: "dot",
      fgColor: "#0369a1",
      bgColor: "#F0F9FF",
      gradient: { from: "#0ea5e9", to: "#0369a1", rotation: 90 },
    },
  },
  {
    id: "forest",
    name: "Forest",
    design: {
      dotsType: "rounded",
      cornersSquareType: "extra-rounded",
      cornersDotType: "dot",
      fgColor: "#166534",
      bgColor: "#F0FDF4",
      gradient: { from: "#22c55e", to: "#166534", rotation: 45 },
    },
  },
  {
    id: "aurora",
    name: "Aurora",
    design: {
      dotsType: "classy-rounded",
      cornersSquareType: "extra-rounded",
      cornersDotType: "dot",
      fgColor: "#7c3aed",
      bgColor: "#FAF5FF",
      gradient: { from: "#22d3ee", to: "#a855f7", rotation: 60 },
    },
  },
  {
    id: "berry",
    name: "Berry",
    design: {
      dotsType: "extra-rounded",
      cornersSquareType: "extra-rounded",
      cornersDotType: "dot",
      fgColor: "#9d174d",
      bgColor: "#FDF2F8",
      gradient: { from: "#d946ef", to: "#9d174d", rotation: 45 },
    },
  },
  {
    id: "mono",
    name: "Mono",
    design: {
      dotsType: "rounded",
      cornersSquareType: "extra-rounded",
      cornersDotType: "dot",
      fgColor: "#0a0a0a",
      bgColor: "#FFFFFF",
      gradient: { from: "#374151", to: "#0a0a0a", rotation: 45 },
    },
  },
];

// PRESET_LOGOS moved to ./logoPresets.ts so the SVG source can be
// inlined and recoloured at runtime via the logo-colour picker.
