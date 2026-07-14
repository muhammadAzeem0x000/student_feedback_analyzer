import "server-only";
import { env } from "@/lib/env";

export async function verifyTurnstile(token?: string) {
  if (!env.TURNSTILE_SECRET_KEY) return process.env.NODE_ENV !== "production";
  if (!token) return false;
  const body = new URLSearchParams({ secret: env.TURNSTILE_SECRET_KEY, response: token });
  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body, cache: "no-store" });
  const result = await response.json() as { success?: boolean };
  return result.success === true;
}
