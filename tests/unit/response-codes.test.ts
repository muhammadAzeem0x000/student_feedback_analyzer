import { describe, expect, it } from "vitest";
import { generateResponseCode, generateUniqueCodes, hashResponseCode, normalizeResponseCode } from "@/lib/response-codes";

describe("anonymous response codes", () => {
  it("generates readable codes without ambiguous characters", () => {
    const code = generateResponseCode();
    expect(code).toMatch(/^[2-9A-HJ-NP-Z]{4}-[2-9A-HJ-NP-Z]{4}$/);
  });
  it("normalizes case, spaces, and separators", () => expect(normalizeResponseCode(" abcd - 2345 ")).toBe("ABCD2345"));
  it("hashes normalized codes with SHA-256", () => {
    expect(hashResponseCode("ABCD-2345")).toBe(hashResponseCode("abcd 2345"));
    expect(hashResponseCode("ABCD-2345")).toMatch(/^[a-f0-9]{64}$/);
  });
  it("creates the requested number of unique codes", () => expect(new Set(generateUniqueCodes(100)).size).toBe(100));
});
