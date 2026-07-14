"use client";
import { useState } from "react";
import { LoaderCircle, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/field";

export function LoginForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setLoading(true); setError("");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: form.get("email"), password: form.get("password") }) });
    const result = await response.json();
    if (!response.ok) { setError(result.error ?? "Unable to sign in."); setLoading(false); return; }
    window.location.assign(result.destination);
  }
  return <form onSubmit={submit} className="space-y-5"><div><Label htmlFor="email">Email address</Label><Input id="email" name="email" type="email" autoComplete="email" required placeholder="instructor@example.com" /></div><div><Label htmlFor="password">Password</Label><Input id="password" name="password" type="password" autoComplete="current-password" required minLength={8} /></div>{error && <p role="alert" className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}<Button className="w-full" size="lg" disabled={loading}>{loading ? <LoaderCircle className="animate-spin" size={18}/> : <LogIn size={18}/>}Sign in securely</Button></form>;
}
