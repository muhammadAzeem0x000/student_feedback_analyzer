import { loadEnvConfig } from "@next/env";
import { createClient } from "@supabase/supabase-js";

loadEnvConfig(process.cwd());
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const instructorEmail = process.env.DEMO_INSTRUCTOR_EMAIL ?? "instructor@example.com";
const instructorPassword = process.env.DEMO_INSTRUCTOR_PASSWORD;
const adminPassword = process.env.DEMO_ADMIN_PASSWORD;
if (!url || !key || !instructorPassword || !adminPassword) throw new Error("Configure the Supabase service role key and both demo passwords in .env.local first.");

const supabase = createClient(url, key, { auth: { persistSession: false } });

async function main() {
  for (const account of [
    { email: instructorEmail, password: instructorPassword, full_name: "Demo Instructor", role: "instructor" },
    { email: "admin@example.com", password: adminPassword, full_name: "Platform Admin", role: "admin" },
  ]) {
    const { data: existing } = await supabase.auth.admin.listUsers({ perPage: 1000 });
    let user = existing.users.find((candidate) => candidate.email === account.email);
    if (!user) {
      const { data, error } = await supabase.auth.admin.createUser({ email: account.email, password: account.password, email_confirm: true, user_metadata: { full_name: account.full_name } });
      if (error) throw error;
      user = data.user;
      console.log(`Created ${account.email}`);
    } else {
      console.log(`${account.email} already exists`);
    }
    const { error: profileError } = await supabase.from("profiles").update({ full_name: account.full_name, role: account.role as "instructor" | "admin", is_active: true }).eq("id", user.id);
    if (profileError) throw profileError;
  }
}

main().catch((error) => { console.error(error instanceof Error ? error.message : error); process.exitCode = 1; });
