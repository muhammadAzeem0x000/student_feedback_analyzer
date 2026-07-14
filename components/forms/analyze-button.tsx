"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { BrainCircuit, LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function AnalyzeButton({sessionId,enabled,regenerate=false}:{sessionId:string;enabled:boolean;regenerate?:boolean}){const[loading,setLoading]=useState(false);const router=useRouter();async function analyze(){setLoading(true);const response=await fetch(`/api/sessions/${sessionId}/analyze`,{method:"POST"});const result=await response.json();setLoading(false);if(!response.ok)return toast.error(result.error??"Analysis failed.");toast.success("Five new teaching insights are ready");router.refresh();}return <Button onClick={analyze} disabled={!enabled||loading}>{loading?<LoaderCircle className="animate-spin" size={17}/>:<BrainCircuit size={17}/>} {loading?"Analyzing feedback…":regenerate?"Generate a new version":"Generate five insights"}</Button>}
