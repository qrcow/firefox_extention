// GENERATED FILE — do not edit. Source of truth lives in apps/web.
// Refresh with: npm run sync-shared (tools/firefox-extension)

import { contrastRatio, rateScannability } from "../src/shared/qr-contrast";

describe("contrastRatio", () => {
  it("returns 21 for black on white", () => {
    expect(contrastRatio("#000000", "#ffffff")).toBeCloseTo(21, 5);
  });
  it("returns 1 for identical colours", () => {
    expect(contrastRatio("#3366cc", "#3366cc")).toBeCloseTo(1, 5);
  });
  it("is symmetric (order of fg/bg does not matter)", () => {
    expect(contrastRatio("#123456", "#abcdef")).toBeCloseTo(
      contrastRatio("#abcdef", "#123456"),
      10,
    );
  });
  it("expands 3-digit hex like the 6-digit form", () => {
    expect(contrastRatio("#000", "#fff")).toBeCloseTo(contrastRatio("#000000", "#ffffff"), 10);
  });
  it("tolerates colours without a leading #", () => {
    expect(contrastRatio("000000", "ffffff")).toBeCloseTo(21, 5);
  });
});

describe("rateScannability", () => {
  it("rates a high-contrast pair as excellent (>= 7)", () => {
    const r = rateScannability("#000000", "#ffffff");
    expect(r.level).toBe("excellent");
    expect(r.label).toBe("Excellent");
    expect(r.ratio).toBeGreaterThanOrEqual(7);
  });
  it("rates a mid-contrast pair as good (3.5 - 7)", () => {
    // grey on white sits in the "good" band
    const r = rateScannability("#767676", "#ffffff");
    expect(r.level).toBe("good");
    expect(r.ratio).toBeGreaterThanOrEqual(3.5);
    expect(r.ratio).toBeLessThan(7);
  });
  it("rates a low-contrast pair as low", () => {
    const r = rateScannability("#bbbbbb", "#ffffff");
    expect(r.level).toBe("low");
    expect(r.label).toContain("Low");
    expect(r.ratio).toBeLessThan(3.5);
  });
});
