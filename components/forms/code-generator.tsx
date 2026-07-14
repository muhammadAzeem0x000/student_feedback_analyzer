"use client";
import { useState } from "react";
import { Check, Copy, Download, KeyRound, LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/field";

export function CodeGenerator({ sessionId, enabled }: { sessionId: string; enabled: boolean }) {
  const [count,setCount] = useState(20); const [codes,setCodes] = useState<string[]>([]); const [loading,setLoading] = useState(false); const [copied,setCopied] = useState(false);
  async function generate() { setLoading(true); const response = await fetch(`/api/sessions/${sessionId}/codes`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({count})}); const result = await response.json(); setLoading(false); if(!response.ok) return toast.error(result.error); setCodes(result.codes); toast.success(`${result.codes.length} single-use codes generated`); }
  async function copy() { await navigator.clipboard.writeText(codes.join("\n")); setCopied(true); setTimeout(()=>setCopied(false),1500); }
  function download() { const blob = new Blob([codes.join("\n")],{type:"text/plain"}); const url=URL.createObjectURL(blob); const link=document.createElement("a"); link.href=url; link.download="signalroom-response-codes.txt"; link.click(); URL.revokeObjectURL(url); }
  return <div><div className="flex flex-wrap items-end gap-3"><div><label htmlFor="code-count" className="mb-1.5 block text-sm font-semibold">Number of codes</label><Input id="code-count" className="w-32" type="number" min="1" max="500" value={count} onChange={e=>setCount(Number(e.target.value))}/></div><Button onClick={generate} disabled={!enabled||loading}>{loading?<LoaderCircle className="animate-spin" size={16}/>:<KeyRound size={16}/>}Generate</Button></div>{codes.length>0&&<div className="mt-4 rounded-xl border bg-[#f5f6f2] p-4"><div className="flex items-center justify-between"><p className="text-sm font-semibold">Copy or download now. Plaintext codes are never stored.</p><div className="flex gap-2"><Button variant="ghost" size="sm" onClick={copy}>{copied?<Check size={15}/>:<Copy size={15}/>}Copy</Button><Button variant="ghost" size="sm" onClick={download}><Download size={15}/>Download</Button></div></div><div className="mt-3 grid max-h-44 grid-cols-2 gap-2 overflow-auto font-mono text-sm sm:grid-cols-4">{codes.map(code=><span key={code} className="rounded-lg bg-white px-2 py-1.5 text-center">{code}</span>)}</div></div>}</div>;
}
