import { z } from "zod";

export const insightSchema = z.object({
  rank: z.number().int().min(1).max(5),
  title: z.string().min(3).max(120),
  finding: z.string().min(10).max(1000),
  evidence: z.string().min(10).max(1000),
  recommendation: z.string().min(10).max(1000),
  priority: z.enum(["high", "medium", "low"]),
});

export const aiAnalysisSchema = z.object({
  summary: z.string().min(20).max(2000),
  response_count: z.number().int().min(0),
  insights: z.array(insightSchema).length(5).superRefine((insights, context) => {
    const ranks = insights.map((item) => item.rank).sort();
    if (ranks.join(",") !== "1,2,3,4,5") context.addIssue({ code: "custom", message: "Ranks must be 1 through 5." });
  }),
  limitations: z.string().min(10).max(1500),
});

export type AIAnalysis = z.infer<typeof aiAnalysisSchema>;
