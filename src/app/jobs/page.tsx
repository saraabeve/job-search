"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, Card, Input, Textarea } from "@/components/ui";
import { actions, useStore } from "@/lib/store";
import { JOB_STATUSES, uid, type Job } from "@/lib/types";

const STATUS_STYLE: Record<Job["status"], string> = {
  saved: "bg-neutral-100 text-neutral-700",
  applied: "bg-blue-50 text-blue-700",
  interview: "bg-amber-50 text-amber-800",
  offer: "bg-emerald-50 text-emerald-700",
  rejected: "bg-red-50 text-red-700",
};

export default function JobsPage() {
  const store = useStore();
  const router = useRouter();
  const [form, setForm] = useState({ title: "", company: "", url: "", description: "" });
  const field = (key: keyof typeof form) => ({
    value: form[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm({ ...form, [key]: e.target.value }),
  });

  function add(e: React.FormEvent) {
    e.preventDefault();
    const job: Job = { id: uid(), ...form, status: "saved", notes: "", coverLetter: "", createdAt: Date.now() };
    actions.saveJob(job);
    router.push(`/jobs/${job.id}`);
  }

  return (
    <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,24rem)_minmax(0,1fr)]">
      <Card>
        <h1 className="text-lg font-semibold">Add a job</h1>
        <p className="mt-1 text-sm text-muted">Paste the posting so your CV can be tailored to it.</p>
        <form onSubmit={add} className="mt-4 space-y-3">
          <Input label="Job title" required {...field("title")} />
          <Input label="Company" {...field("company")} />
          <Input label="Link to the posting" type="url" placeholder="https://…" {...field("url")} />
          <Textarea label="Job description" required rows={10} placeholder="Paste the full job description here" {...field("description")} />
          <Button type="submit" className="w-full">
            Save job
          </Button>
        </form>
      </Card>

      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Applications</h2>
        {store && store.jobs.length === 0 && (
          <p className="mt-3 text-sm text-muted">No jobs yet. Add the first one you want to apply for.</p>
        )}
        <ul className="mt-4 space-y-2">
          {store?.jobs.map((job) => (
            <li key={job.id}>
              <Card className="flex items-center gap-4 py-3">
                <div className="min-w-0 flex-1">
                  <Link href={`/jobs/${job.id}`} className="block truncate font-medium hover:text-brand">
                    {job.title}
                  </Link>
                  <p className="truncate text-xs text-muted">
                    {[job.company, `added ${new Date(job.createdAt).toLocaleDateString()}`].filter(Boolean).join(" · ")}
                    {job.analysis && " · CV tailored"}
                  </p>
                </div>
                <select
                  aria-label={`Status of ${job.title}`}
                  value={job.status}
                  onChange={(e) => {
                    const status = e.target.value as Job["status"];
                    actions.saveJob({ ...job, status, appliedAt: status === "applied" ? Date.now() : job.appliedAt });
                  }}
                  className={`cursor-pointer rounded-full px-3 py-1 text-xs font-medium capitalize ${STATUS_STYLE[job.status]}`}
                >
                  {JOB_STATUSES.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </Card>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
