import "server-only";
import { createHmac } from "node:crypto";
import { headers } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import { env } from "@/lib/env";

export async function consumeSubmissionRateLimit() {
  if (!env.SUPABASE_SERVICE_ROLE_KEY) return process.env.NODE_ENV !== "production";
  const headerStore = await headers();
  const ip = headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ?? headerStore.get("x-real-ip") ?? "unknown";
  const secret = env.RATE_LIMIT_SECRET ?? env.SUPABASE_SERVICE_ROLE_KEY;
  const keyHash = createHmac("sha256", secret).update(ip).digest("hex");
  const window = new Date();
  window.setMinutes(Math.floor(window.getMinutes() / 10) * 10, 0, 0);
  const { data, error } = await createAdminClient().rpc("consume_submission_rate_limit", {
    target_key_hash: keyHash,
    target_window: window.toISOString(),
    maximum_requests: 15,
  });
  if (error) throw error;
  return data;
}
