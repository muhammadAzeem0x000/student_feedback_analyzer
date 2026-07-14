import "server-only";
import OpenAI from "openai";
import { aiAnalysisSchema, type AIAnalysis } from "@/lib/ai/schema";
import { env, requireServerSecret } from "@/lib/env";

export interface AnalysisInput {
  course: { name: string; code: string };
  session: { title: string; description: string | null };
  responseCount: number;
  questions: unknown[];
  statistics: unknown;
  writtenResponses: unknown[];
  reflection: unknown;
  materialText?: string;
}

export interface AIProvider {
  analyze(input: AnalysisInput): Promise<AIAnalysis>;
}

const systemPrompt = `You are analyzing anonymous classroom feedback for an instructor.
Use student feedback, aggregate results, written responses, instructor reflection, and class material.
Return JSON only. Generate exactly five prioritized insights ranked 1 through 5.
Do not identify or speculate about individual students. Anonymous feedback is not objective proof.
Separate evidence from inference, explain disagreement, avoid long quotations, and include supported strengths.
Every recommendation must be specific and actionable. Priority must be high, medium, or low.`;

export class DeepSeekProvider implements AIProvider {
  private client = new OpenAI({ apiKey: requireServerSecret("DEEPSEEK_API_KEY"), baseURL: env.DEEPSEEK_BASE_URL });

  async analyze(input: AnalysisInput) {
    const response = await this.client.chat.completions.create({
      model: env.DEEPSEEK_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Analyze this dataset and return the required JSON schema:\n${JSON.stringify(input)}` },
      ],
      response_format: { type: "json_object" },
      temperature: 0.2,
      max_tokens: 5000,
    });
    const content = response.choices[0]?.message.content;
    if (!content) throw new Error("The AI provider returned an empty response.");
    return aiAnalysisSchema.parse(JSON.parse(content));
  }
}

export class MockAIProvider implements AIProvider {
  async analyze(input: AnalysisInput) {
    return aiAnalysisSchema.parse({
      summary: "Students generally valued the practical structure while identifying opportunities to refine pacing and checks for understanding.",
      response_count: input.responseCount,
      insights: Array.from({ length: 5 }, (_, index) => ({
        rank: index + 1,
        title: ["Clarify key transitions", "Protect practice time", "Check understanding earlier", "Keep worked examples", "Close the feedback loop"][index],
        finding: "The available feedback indicates a consistent teaching pattern worth reviewing in context.",
        evidence: "This finding combines aggregate ratings, written responses, and the instructor reflection.",
        recommendation: "Make one observable adjustment in the next class and compare the same feedback measure afterward.",
        priority: index < 2 ? "high" : index < 4 ? "medium" : "low",
      })),
      limitations: "Anonymous feedback represents participating students and should be interpreted alongside teaching context and response volume.",
    });
  }
}
