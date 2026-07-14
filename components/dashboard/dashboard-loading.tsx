function Block({ className = "" }: { className?: string }) {
  return <div className={`rounded-xl bg-[#dde3dd] ${className}`} />;
}

export function DashboardLoading() {
  return <div role="status" aria-label="Loading workspace" className="animate-pulse" aria-live="polite">
    <span className="sr-only">Loading workspace…</span>
    <div className="mb-8"><Block className="h-3 w-28"/><Block className="mt-3 h-9 w-72 max-w-full"/><Block className="mt-3 h-4 w-full max-w-xl"/></div>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[0, 1, 2, 3].map(item => <div key={item} className="rounded-2xl border bg-[#fffdf8] p-5"><div className="flex items-start justify-between"><div className="w-2/3"><Block className="h-4 w-24"/><Block className="mt-4 h-9 w-16"/></div><Block className="size-10"/></div></div>)}</div>
    <div className="mt-6 rounded-2xl border bg-[#fffdf8] p-5"><div className="flex justify-between"><div><Block className="h-5 w-48"/><Block className="mt-2 h-3 w-64 max-w-full"/></div><Block className="h-4 w-16"/></div><div className="mt-6 space-y-4">{[0, 1, 2].map(item => <div key={item} className="flex items-center justify-between border-t pt-4"><div className="w-2/3"><Block className="h-4 w-56 max-w-full"/><Block className="mt-2 h-3 w-32"/></div><Block className="h-7 w-20 rounded-full"/></div>)}</div></div>
  </div>;
}
