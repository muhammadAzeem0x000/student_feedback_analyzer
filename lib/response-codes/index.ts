import { createHash, randomInt } from "node:crypto";

const ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";

export function generateResponseCode(length = 8) {
  const characters = Array.from({ length }, () => ALPHABET[randomInt(0, ALPHABET.length)]).join("");
  return `${characters.slice(0, 4)}-${characters.slice(4)}`;
}

export function normalizeResponseCode(code: string) {
  return code.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

export function hashResponseCode(code: string) {
  return createHash("sha256").update(normalizeResponseCode(code), "utf8").digest("hex");
}

export function generateUniqueCodes(count: number) {
  const codes = new Set<string>();
  while (codes.size < count) codes.add(generateResponseCode());
  return [...codes];
}
