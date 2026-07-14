"use client";
import { useState } from "react";
import { FlaskConical, LoaderCircle, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/field";

export function LoginForm() {
  const [loading, setLoading] = useState<"credentials" | "demo" | null>(null);
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading("credentials");
    setError("");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: form.get("email"), password: form.get("password") }),
    });
    const result = await response.json();
    if (!response.ok) {
      setError(result.error ?? "Unable to sign in.");
      setLoading(null);
      return;
    }
    window.location.assign(result.destination);
  }

  async function loginAsDemo() {
    setLoading("demo");
    setError("");
    const response = await fetch("/api/auth/demo-login", { method: "POST" });
    const result = await response.json();
    if (!response.ok) {
      setError(result.error ?? "Unable to start the test session.");
      setLoading(null);
      return;
    }
    window.location.assign(result.destination);
  }

  return <div className="space-y-5">
    <Button type="button" variant="secondary" className="w-full" size="lg" disabled={loading !== null} onClick={loginAsDemo}>
      {loading === "demo" ? <LoaderCircle className="animate-spin" size={18}/> : <FlaskConical size={18}/>}
      Login as test instructor
    </Button>
    <p className="text-center text-xs leading-5 text-[#7b8984]">Explore instantly without credentials. AI analysis uses safe demo results.</p>
    {error && <p role="alert" className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
    <div className="flex items-center gap-3" aria-hidden="true">
      <span className="h-px flex-1 bg-[#dfe5e2]"/>
      <span className="text-xs font-semibold uppercase tracking-[.16em] text-[#9aa49f]">or</span>
      <span className="h-px flex-1 bg-[#dfe5e2]"/>
    </div>
    <form onSubmit={submit} className="space-y-5">
      <div><Label htmlFor="email">Email address</Label><Input id="email" name="email" type="email" autoComplete="email" required placeholder="instructor@example.com" /></div>
      <div><Label htmlFor="password">Password</Label><Input id="password" name="password" type="password" autoComplete="current-password" required minLength={8} /></div>
      <Button className="w-full" size="lg" disabled={loading !== null}>
        {loading === "credentials" ? <LoaderCircle className="animate-spin" size={18}/> : <LogIn size={18}/>}
        Sign in securely
      </Button>
    </form>
  </div>;
}
