"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/field";

export function DepartmentForm(){const[loading,setLoading]=useState(false);const router=useRouter();async function submit(e:React.FormEvent<HTMLFormElement>){e.preventDefault();setLoading(true);const formElement=e.currentTarget;const form=new FormData(formElement);const response=await fetch("/api/admin/departments",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:form.get("name")})});const result=await response.json();setLoading(false);if(!response.ok)return toast.error(result.error);formElement.reset();toast.success("Department added");router.refresh();}return <form onSubmit={submit} className="flex gap-2"><Input name="name" required placeholder="Department name"/><Button disabled={loading}>{loading?<LoaderCircle className="animate-spin" size={16}/>:<Plus size={16}/>}Add</Button></form>}
export function InstructorToggle({id,active}:{id:string;active:boolean}){const[loading,setLoading]=useState(false);const router=useRouter();async function toggle(){setLoading(true);const response=await fetch(`/api/admin/instructors/${id}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({isActive:!active})});const result=await response.json();setLoading(false);if(!response.ok)return toast.error(result.error);toast.success(active?"Instructor deactivated":"Instructor activated");router.refresh();}return <Button variant={active?"secondary":"primary"} size="sm" disabled={loading} onClick={toggle}>{loading?<LoaderCircle className="animate-spin" size={15}/>:active?"Deactivate":"Activate"}</Button>}
