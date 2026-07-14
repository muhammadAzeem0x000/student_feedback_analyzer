import { describe, expect, it } from "vitest";
import { aiAnalysisSchema } from "@/lib/ai/schema";

function analysis(count = 5) { return { summary: "A sufficiently detailed overall summary of the anonymous feedback.", response_count: 10, insights: Array.from({ length: count }, (_, index) => ({ rank: index + 1, title: `Insight ${index + 1}`, finding: "A sufficiently detailed finding supported by the submitted feedback.", evidence: "Aggregated ratings and written responses support this interpretation.", recommendation: "Make one specific adjustment and compare the same measure next time.", priority: index < 2 ? "high" : index < 4 ? "medium" : "low" })), limitations: "The findings represent participating respondents and do not establish objective fact." }; }

describe("AI output schema", () => {
  it("accepts exactly five ranked insights", () => expect(aiAnalysisSchema.safeParse(analysis()).success).toBe(true));
  it("rejects fewer than five insights", () => expect(aiAnalysisSchema.safeParse(analysis(4)).success).toBe(false));
  it("rejects duplicate ranks", () => { const value = analysis(); value.insights[4].rank = 4; expect(aiAnalysisSchema.safeParse(value).success).toBe(false); });
});
