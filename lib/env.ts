import "server-only";
import { z } from "zod";

const serverEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  DEEPSEEK_API_KEY: z.string().optional(),
  DEEPSEEK_BASE_URL: z.string().url().default("https://api.deepseek.com"),
  DEEPSEEK_MODEL: z.string().default("deepseek-v4-pro"),
  AI_PROVIDER_MODE: z.enum(["deepseek", "mock"]).default("deepseek"),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  TURNSTILE_SECRET_KEY: z.string().optional(),
  RATE_LIMIT_SECRET: z.string().optional(),
});

export const env = serverEnvSchema.parse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || undefined,
  DEEPSEEK_API_KEY: process.env.DEEPSEEK_API_KEY || undefined,
  DEEPSEEK_BASE_URL: process.env.DEEPSEEK_BASE_URL,
  DEEPSEEK_MODEL: process.env.DEEPSEEK_MODEL,
  AI_PROVIDER_MODE: process.env.AI_PROVIDER_MODE,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  TURNSTILE_SECRET_KEY: process.env.TURNSTILE_SECRET_KEY || undefined,
  RATE_LIMIT_SECRET: process.env.RATE_LIMIT_SECRET || undefined,
});

export function requireServerSecret(name: "SUPABASE_SERVICE_ROLE_KEY" | "DEEPSEEK_API_KEY") {
  const value = env[name];
  if (!value) throw new Error(`${name} is not configured.`);
  return value;
}
