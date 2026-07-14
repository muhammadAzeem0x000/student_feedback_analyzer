import { describe, expect, it } from "vitest";
import { calculateResponsePercentage } from "@/lib/analytics/calculations";

describe("response percentage", () => {
  it("calculates and rounds to one decimal place", () => expect(calculateResponsePercentage(2, 3)).toBe(66.7));
  it("returns null for missing or zero targets", () => { expect(calculateResponsePercentage(2, null)).toBeNull(); expect(calculateResponsePercentage(2, 0)).toBeNull(); });
});
