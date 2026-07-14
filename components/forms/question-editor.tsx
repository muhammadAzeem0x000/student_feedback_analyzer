"use client";
import { useState } from "react";
import { GripVertical, LoaderCircle, Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/field";

type Question = { type: "rating" | "single_choice" | "long_text"; prompt: string; isRequired: boolean; options?: string[] | null };
const defaults: Question[] = [
  { type: "rating", prompt: "The learning objectives were clear.", isRequired: true },
  { type: "rating", prompt: "The pace of the session supported my learning.", isRequired: true },
  { type: "single_choice", prompt: "Which activity helped you learn the most?", isRequired: true, options: ["Live coding", "Worked examples", "Pair exercise", "Discussion"] },
  { type: "long_text", prompt: "What was the clearest part of the session?", isRequired: true },
  { type: "long_text", prompt: "What is one change that would improve the next session?", isRequired: true },
];

export function QuestionEditor({ sessionId, initial, editable }: { sessionId: string; initial: Question[]; editable: boolean }) {
  const [questions, setQuestions] = useState<Question[]>(initial.length ? initial : defaults); const [loading, setLoading] = useState(false);
  function update(index: number, patch: Partial<Question>) { setQuestions(items => items.map((item, i) => i === index ? { ...item, ...patch } : item)); }
  async function save() { setLoading(true); const response = await fetch(`/api/sessions/${sessionId}/questions`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ questions }) }); const result = await response.json(); setLoading(false); if (response.ok) toast.success("Questions saved"); else toast.error(result.error ?? "Unable to save questions."); }
  if (!editable) return <div className="space-y-3">{questions.map((q,i) => <div key={i} className="rounded-xl border bg-white p-4"><p className="text-xs font-bold uppercase tracking-wider text-[#7a8883]">{q.type.replace("_", " ")} · {q.isRequired ? "Required" : "Optional"}</p><p className="mt-1 font-medium">{q.prompt}</p></div>)}</div>;
  return <div className="space-y-3">{questions.map((question,index) => <div key={index} className="rounded-xl border bg-white p-4"><div className="flex gap-3"><GripVertical className="mt-3 shrink-0 text-[#9aa49f]" size={18}/><div className="grid flex-1 gap-3 sm:grid-cols-[170px_1fr_auto]"><select aria-label={`Question ${index+1} type`} value={question.type} onChange={e => update(index,{ type:e.target.value as Question["type"], options:e.target.value === "single_choice" ? ["Option 1","Option 2"] : null })} className="focus-ring h-11 rounded-xl border px-3 text-sm"><option value="rating">Rating 1–5</option><option value="single_choice">Single choice</option><option value="long_text">Long text</option></select><Input aria-label={`Question ${index+1} prompt`} value={question.prompt} onChange={e => update(index,{prompt:e.target.value})} /><Button variant="ghost" aria-label={`Delete question ${index+1}`} onClick={() => setQuestions(items => items.filter((_,i) => i !== index))}><Trash2 size={17}/></Button></div></div>{question.type === "single_choice" && <div className="ml-8 mt-3 grid gap-2 sm:grid-cols-2">{(question.options ?? []).map((option, optionIndex) => <Input key={optionIndex} aria-label={`Option ${optionIndex+1}`} value={option} onChange={e => update(index,{options:(question.options ?? []).map((item,i) => i === optionIndex ? e.target.value : item)})} />)}<Button variant="ghost" size="sm" onClick={() => update(index,{options:[...(question.options ?? []),`Option ${(question.options?.length ?? 0)+1}`]})}><Plus size={15}/>Add option</Button></div>}<label className="ml-8 mt-3 flex items-center gap-2 text-sm text-[#66756f]"><input type="checkbox" checked={question.isRequired} onChange={e => update(index,{isRequired:e.target.checked})} />Required</label></div>)}<div className="flex flex-wrap gap-2"><Button variant="secondary" onClick={() => setQuestions(items => [...items,{type:"rating",prompt:"New feedback question",isRequired:true}])}><Plus size={16}/>Add question</Button><Button onClick={save} disabled={loading || questions.length === 0}>{loading ? <LoaderCircle className="animate-spin" size={16}/> : <Save size={16}/>}Save questions</Button></div></div>;
}
