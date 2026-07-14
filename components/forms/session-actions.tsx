"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, LoaderCircle, Play } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function SessionActions({ sessionId, status }: { sessionId: string; status: string }) {
  const [loading,setLoading]=useState(false); const router=useRouter();
  const next = status === "draft" ? "open" : status === "open" ? "closed" : null;
  if(!next) return null;
  async function change(){ if(next==="closed"&&!window.confirm("Close this session? Students will no longer be able to submit."))return; setLoading(true); const response=await fetch(`/api/sessions/${sessionId}/status`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({status:next})}); const result=await response.json(); setLoading(false); if(!response.ok)return toast.error(result.error); toast.success(next==="open"?"Session is now open":"Session closed"); router.refresh(); }
  return <Button onClick={change} disabled={loading} variant={next==="closed"?"secondary":"primary"}>{loading?<LoaderCircle className="animate-spin" size={16}/>:next==="open"?<Play size={16}/>:<Lock size={16}/>} {next==="open"?"Open session":"Close session"}</Button>;
}
