// GENERATED FILE — do not edit. Source of truth lives in apps/web.
// Refresh with: npm run sync-shared (tools/firefox-extension)

import { encode, encoders, type ContentType } from "../src/shared/qr-encoders";

describe("encode() — url", () => {
  it("prefixes a bare host with https://", () => {
    expect(encode("url", { url: "example.com" })).toBe("https://example.com");
  });
  it("leaves an existing scheme untouched", () => {
    expect(encode("url", { url: "http://example.com" })).toBe("http://example.com");
    expect(encode("url", { url: "ftp://files.example.com" })).toBe("ftp://files.example.com");
  });
  it("trims surrounding whitespace", () => {
    expect(encode("url", { url: "  example.com  " })).toBe("https://example.com");
  });
  it("returns empty string for empty input", () => {
    expect(encode("url", { url: "" })).toBe("");
    expect(encode("url", {})).toBe("");
  });
});

describe("encode() — text", () => {
  it("passes plain text through (trimmed by encode)", () => {
    expect(encode("text", { text: "  hello world  " })).toBe("hello world");
  });
  it("caps length at 4000 characters", () => {
    const long = "a".repeat(5000);
    expect(encoders.text({ text: long })).toHaveLength(4000);
  });
});

describe("encode() — email", () => {
  it("builds a mailto without query when no subject/body", () => {
    expect(encode("email", { email: "a@b.com" })).toBe("mailto:a@b.com");
  });
  it("encodes subject and body as query params", () => {
    expect(encode("email", { email: "a@b.com", subject: "Hi there", body: "Yo" })).toBe(
      "mailto:a@b.com?subject=Hi+there&body=Yo",
    );
  });
  it("returns empty for a missing address", () => {
    expect(encode("email", { subject: "x" })).toBe("");
  });
});

describe("encode() — sms / phone", () => {
  it("strips formatting from the number", () => {
    expect(encode("phone", { phone: "+1 (234) 567-8900" })).toBe("tel:+12345678900");
  });
  it("uses sms: with no body and SMSTO: with a body", () => {
    expect(encode("sms", { phone: "+1234" })).toBe("sms:+1234");
    expect(encode("sms", { phone: "+1234", body: "hello" })).toBe("SMSTO:+1234:hello");
  });
  it("returns empty for an empty number", () => {
    expect(encode("phone", { phone: "" })).toBe("");
    expect(encode("sms", {})).toBe("");
  });
});

describe("encode() — vcard", () => {
  it("emits a VERSION 3.0 card with name + optional fields", () => {
    const out = encode("vcard", {
      firstName: "John",
      lastName: "Doe",
      email: "john@doe.com",
      phone: "+1 234",
    });
    expect(out).toBe(
      ["BEGIN:VCARD", "VERSION:3.0", "N:Doe;John", "FN:John Doe", "TEL;TYPE=CELL:+1234", "EMAIL:john@doe.com", "END:VCARD"].join("\n"),
    );
  });
  it("escapes commas and semicolons in names", () => {
    const out = encode("vcard", { firstName: "A,B", lastName: "C;D" });
    expect(out).toContain("N:C\\;D;A\\,B");
  });
});

describe("encode() — mecard", () => {
  it("builds a compact MECARD", () => {
    expect(encode("mecard", { firstName: "John", lastName: "Doe", email: "j@x.com" })).toBe(
      "MECARD:N:Doe,John;EMAIL:j@x.com;;",
    );
  });
});

describe("encode() — wifi", () => {
  it("emits a WPA network with a password", () => {
    expect(encode("wifi", { ssid: "Net", password: "pass", encryption: "wpa" })).toBe(
      "WIFI:T:WPA;S:Net;P:pass;H:false;;",
    );
  });
  it("omits the password for an open (nopass) network", () => {
    expect(encode("wifi", { ssid: "Net", encryption: "nopass" })).toBe("WIFI:T:NOPASS;S:Net;H:false;;");
  });
  it("marks hidden networks", () => {
    expect(encode("wifi", { ssid: "Net", password: "p", hidden: "true" })).toContain("H:true;;");
  });
  it("escapes special characters in the SSID", () => {
    expect(encode("wifi", { ssid: "My;Net", password: "p" })).toContain("S:My\\;Net;");
  });
});

describe("encode() — event", () => {
  it("formats DTSTART/DTEND as UTC basic-format timestamps", () => {
    const out = encode("event", {
      title: "Launch",
      location: "HQ",
      start: "2026-06-07T10:30:00Z",
      end: "2026-06-07T11:30:00Z",
    });
    expect(out).toBe(
      [
        "BEGIN:VEVENT",
        "SUMMARY:Launch",
        "LOCATION:HQ",
        "DTSTART:20260607T103000Z",
        "DTEND:20260607T113000Z",
        "END:VEVENT",
      ].join("\n"),
    );
  });
  it("emits an empty DTSTART value for an unparseable date", () => {
    const out = encode("event", { title: "X", start: "not-a-date" });
    // fmtVDate returns "" for invalid input, so the line has no timestamp.
    expect(out).toContain("DTSTART:\n");
    expect(out).not.toMatch(/DTSTART:\d/);
  });
});

describe("encode() — location", () => {
  it("emits a geo: URI", () => {
    expect(encode("location", { lat: "40.7", lng: "-74.0" })).toBe("geo:40.7,-74.0");
  });
  it("adds an URL-encoded query when present", () => {
    expect(encode("location", { lat: "40.7", lng: "-74.0", query: "New York" })).toBe(
      "geo:40.7,-74.0?q=New%20York",
    );
  });
  it("returns empty when a coordinate is missing", () => {
    expect(encode("location", { lat: "40.7" })).toBe("");
  });
});

describe("encode() — social", () => {
  it("strips a leading @ and builds the canonical URL per network", () => {
    expect(encode("social", { network: "instagram", handle: "@bob" })).toBe("https://instagram.com/bob");
    expect(encode("social", { network: "x", handle: "bob" })).toBe("https://x.com/bob");
    expect(encode("social", { network: "twitter", handle: "bob" })).toBe("https://x.com/bob");
    expect(encode("social", { network: "youtube", handle: "bob" })).toBe("https://youtube.com/@bob");
    expect(encode("social", { network: "tiktok", handle: "bob" })).toBe("https://www.tiktok.com/@bob");
    expect(encode("social", { network: "linkedin", handle: "bob" })).toBe("https://linkedin.com/in/bob");
  });
  it("builds a wa.me link for whatsapp, digits only", () => {
    expect(encode("social", { network: "whatsapp", handle: "+1 (234)" })).toBe("https://wa.me/+1234");
  });
  it("falls back to a normalised URL for unknown networks", () => {
    expect(encode("social", { network: "myspace", handle: "example.com/me" })).toBe(
      "https://example.com/me",
    );
  });
  it("returns empty for a missing handle", () => {
    expect(encode("social", { network: "instagram", handle: "" })).toBe("");
  });
});

describe("encode() — crypto", () => {
  it("builds a BIP-21 style URI with optional amount", () => {
    expect(encode("crypto", { network: "bitcoin", address: "abc", amount: "0.1" })).toBe(
      "bitcoin:abc?amount=0.1",
    );
  });
  it("defaults the scheme to bitcoin", () => {
    expect(encode("crypto", { address: "abc" })).toBe("bitcoin:abc");
  });
  it("lowercases the network scheme", () => {
    expect(encode("crypto", { network: "ETHEREUM", address: "0xabc" })).toBe("ethereum:0xabc");
  });
});

describe("encode() — app", () => {
  it("normalises a bare host", () => {
    expect(encode("app", { url: "apps.apple.com/app/x" })).toBe("https://apps.apple.com/app/x");
  });
});

describe("encoders registry", () => {
  it("has an encoder for every declared content type", () => {
    const types: ContentType[] = [
      "url", "text", "email", "sms", "phone", "vcard", "mecard",
      "wifi", "event", "location", "social", "crypto", "app",
    ];
    for (const t of types) {
      expect(typeof encoders[t]).toBe("function");
    }
  });
});
