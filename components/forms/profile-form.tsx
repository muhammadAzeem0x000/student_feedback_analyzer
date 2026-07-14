"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/field";

export function ProfileForm({name,departmentId,departments}:{name:string;departmentId:string|null;departments:{id:string;name:string}[]}){const[loading,setLoading]=useState(false);const router=useRouter();async function submit(e:React.FormEvent<HTMLFormElement>){e.preventDefault();setLoading(true);const f=new FormData(e.currentTarget);const response=await fetch("/api/profile",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({fullName:f.get("fullName"),departmentId:f.get("departmentId")||null})});const result=await response.json();setLoading(false);if(!response.ok)return toast.error(result.error);toast.success("Profile updated");router.refresh();}return <form onSubmit={submit} className="space-y-4"><div><Label htmlFor="full-name">Full name</Label><Input id="full-name" name="fullName" defaultValue={name} required/></div><div><Label htmlFor="department">Department</Label><select id="department" name="departmentId" defaultValue={departmentId??""} className="focus-ring h-11 w-full rounded-xl border bg-white px-3 text-sm"><option value="">Not assigned</option>{departments.map(d=><option value={d.id} key={d.id}>{d.name}</option>)}</select></div><Button disabled={loading}>{loading?<LoaderCircle className="animate-spin" size={16}/>:<Save size={16}/>}Save profile</Button></form>}
