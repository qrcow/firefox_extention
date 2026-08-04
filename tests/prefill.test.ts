import { isPrefillableUrl, parsePrefill } from "../src/popup/prefill";

describe("isPrefillableUrl", () => {
  it("accepts http and https", () => {
    expect(isPrefillableUrl("https://example.com/x")).toBe(true);
    expect(isPrefillableUrl("http://example.com")).toBe(true);
  });
  it("rejects privileged/irrelevant schemes and empties", () => {
    expect(isPrefillableUrl("about:newtab")).toBe(false);
    expect(isPrefillableUrl("moz-extension://abc/popup.html")).toBe(false);
    expect(isPrefillableUrl("file:///etc/hosts")).toBe(false);
    expect(isPrefillableUrl("")).toBe(false);
    expect(isPrefillableUrl(undefined)).toBe(false);
    expect(isPrefillableUrl(null)).toBe(false);
  });
});

describe("parsePrefill", () => {
  it("parses a context-menu page/link prefill", () => {
    const p = parsePrefill("?mode=window&type=url&url=https%3A%2F%2Fexample.com%2Fa");
    expect(p.mode).toBe("window");
    expect(p.type).toBe("url");
    expect(p.values).toEqual({ url: "https://example.com/a" });
  });

  it("parses a selection prefill and truncates to 4000 chars", () => {
    const long = "x".repeat(5000);
    const p = parsePrefill(`?mode=window&type=text&text=${encodeURIComponent(long)}`);
    expect(p.type).toBe("text");
    expect(p.values.text).toHaveLength(4000);
  });

  it("drops non-http url values but keeps the type intent", () => {
    const p = parsePrefill("?type=url&url=about%3Aconfig");
    expect(p.type).toBe("url");
    expect(p.values).toEqual({});
  });

  it("ignores unknown types and defaults to popup mode", () => {
    const p = parsePrefill("?type=wifi&ssid=x");
    expect(p.mode).toBe("popup");
    expect(p.type).toBeNull();
    expect(p.values).toEqual({});
  });

  it("caps url prefills at 2048 chars", () => {
    const long = "https://example.com/" + "a".repeat(3000);
    const p = parsePrefill(`?type=url&url=${encodeURIComponent(long)}`);
    expect(p.values.url).toHaveLength(2048);
  });
});
