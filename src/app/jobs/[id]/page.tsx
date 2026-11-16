"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Suspense, useState } from "react";
import { CVPreview } from "@/components/CVPreview";
import { Button, buttonClass, Card, Field, Input, inputClass, Notice, Textarea } from "@/components/ui";
import { scoreMatch } from "@/lib/match";
import { actions, useStore } from "@/lib/store";
import { JOB_STATUSES, uid, type CV, type Job, type TailorResult } from "@/lib/types";

async function post<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || "Something went wrong. Try again.");
  return json;
}

function Chips({ items, tone }: { items: string[]; tone: "good" | "bad" }) {
  return (
    <ul className="mt-1.5 flex flex-wrap gap-1.5">
      {items.map((k) => (
        <li
          key={k}
          className={`rounded-full px-2.5 py-0.5 text-xs ${tone === "good" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-800"}`}
        >
          {k}
        </li>
      ))}
    </ul>
  );
}

function JobDetail() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const store = useStore();
  const [baseId, setBaseId] = useState("");
  const [busy, setBusy] = useState<"" | "tailor" | "letter">("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  if (!store) return null;
  const job = store.jobs.find((j) => j.id === id);
  if (!job) {
    return (
      <Card>
        <p>This job doesn&apos;t exist in this browser.</p>
        <Link href="/jobs" className="mt-2 inline-block text-sm font-medium text-brand">
          Back to jobs
        </Link>
      </Card>
    );
  }

  const save = (patch: Partial<Job>) => actions.saveJob({ ...job, ...patch });
  const baseCVs = store.cvs.filter((c) => !c.jobId);
  const base = baseCVs.find((c) => c.id === baseId) ?? baseCVs[0];
  const tailored = store.cvs.find((c) => c.id === job.tailoredCvId);
  const analysis = tailored && job.analysis;
  const match = analysis ? scoreMatch(tailored.data, analysis.keywords) : null;
  const jobInput = { title: job.title, company: job.company, description: job.description };

  async function run(kind: "tailor" | "letter", task: () => Promise<void>) {
    setBusy(kind);
    setError("");
    try {
      await task();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Try again.");
    } finally {
      setBusy("");
    }
  }

  const tailor = () =>
    run("tailor", async () => {
      if (!base) return;
      const { cv: data, ...rest } = await post<TailorResult>("/api/tailor", { cv: base.data, job: jobInput });
      const cv: CV = {
        id: tailored?.id ?? uid(),
        name: `${base.name} — ${job.company || job.title}`,
        template: base.template,
        data,
        jobId: job.id,
        updatedAt: Date.now(),
      };
      actions.saveCV(cv);
      save({ tailoredCvId: cv.id, analysis: { ...rest, baseScore: scoreMatch(base.data, rest.keywords).score } });
    });

  const writeLetter = () =>
    run("letter", async () => {
      const cv = tailored ?? base;
      if (!cv) return;
      const { letter } = await post<{ letter: string }>("/api/cover-letter", { cv: cv.data, job: jobInput });
      save({ coverLetter: letter });
    });

  return (
    <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,24rem)_minmax(0,1fr)]">
      <div className="space-y-4">
        <Card className="space-y-3">
          <Input label="Job title" value={job.title} onChange={(e) => save({ title: e.target.value })} />
          <Input label="Company" value={job.company} onChange={(e) => save({ company: e.target.value })} />
          <Input label="Link to the posting" type="url" value={job.url} onChange={(e) => save({ url: e.target.value })} />
          <Field label="Status">
            <select
              className={`${inputClass} capitalize`}
              value={job.status}
              onChange={(e) => {
                const status = e.target.value as Job["status"];
                save({ status, appliedAt: status === "applied" ? Date.now() : job.appliedAt });
              }}
            >
              {JOB_STATUSES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </Field>
          <Textarea label="Job description" rows={10} value={job.description} onChange={(e) => save({ description: e.target.value })} />
          <Textarea label="Notes" rows={3} placeholder="Contacts, deadlines, salary range…" value={job.notes} onChange={(e) => save({ notes: e.target.value })} />
          <Button
            variant="danger"
            className="px-2 py-1"
            onClick={() => {
              if (!confirm("Delete this job?")) return;
              actions.deleteJob(job.id);
              router.push("/jobs");
            }}
          >
            Delete job
          </Button>
        </Card>
      </div>

      <div className="space-y-4">
        {error && <Notice tone="error">{error}</Notice>}

        <Card className="space-y-4">
          <h2 className="text-lg font-semibold">1. Tailor your CV to this job</h2>
          {baseCVs.length === 0 ? (
            <p className="text-sm text-muted">
              You need a CV first.{" "}
              <Link href="/cv" className="font-medium text-brand">
                Create or upload one
              </Link>
              .
            </p>
          ) : (
            <div className="flex flex-wrap items-end gap-3">
              <Field label="Start from" className="min-w-48 flex-1">
                <select className={inputClass} value={base?.id} onChange={(e) => setBaseId(e.target.value)}>
                  {baseCVs.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name || "Untitled CV"}
                    </option>
                  ))}
                </select>
              </Field>
              <Button disabled={busy !== "" || !job.description.trim()} onClick={tailor}>
                {busy === "tailor" ? "Tailoring… this can take a minute" : tailored ? "Tailor again" : "Tailor my CV"}
              </Button>
            </div>
          )}

          {analysis && match && (
            <div className="space-y-4 border-t border-line pt-4">
              {analysis.mode === "basic" && (
                <Notice>
                  Basic mode: AI rewriting isn&apos;t configured on this server, so this is a keyword analysis only. Use
                  the missing keywords below to edit your CV by hand.
                </Notice>
              )}
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-semibold text-brand">{match.score}%</span>
                <span className="text-sm text-muted">
                  keyword match{match.score !== analysis.baseScore && ` — up from ${analysis.baseScore}% before tailoring`}
                </span>
              </div>
              {match.matched.length > 0 && (
                <div>
                  <h3 className="text-xs font-medium text-muted">Keywords your CV covers</h3>
                  <Chips items={match.matched} tone="good" />
                </div>
              )}
              {match.missing.length > 0 && (
                <div>
                  <h3 className="text-xs font-medium text-muted">Keywords not in your CV</h3>
                  <Chips items={match.missing} tone="bad" />
                </div>
              )}
              {analysis.changes.length > 0 && (
                <div>
                  <h3 className="text-xs font-medium text-muted">What changed</h3>
                  <ul className="mt-1 list-disc space-y-1 pl-5 text-sm">
                    {analysis.changes.map((c) => (
                      <li key={c}>{c}</li>
                    ))}
                  </ul>
                </div>
              )}
              {analysis.mode === "ai" && analysis.gaps.length > 0 && (
                <div>
                  <h3 className="text-xs font-medium text-muted">Gaps to be ready for</h3>
                  <p className="text-xs text-muted">
                    The job asks for these and your CV doesn&apos;t show them. Nothing was invented — add them yourself
                    only if they&apos;re true.
                  </p>
                  <ul className="mt-1 list-disc space-y-1 pl-5 text-sm">
                    {analysis.gaps.map((g) => (
                      <li key={g}>{g}</li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="flex flex-wrap gap-2">
                <Link href={`/cv/${tailored.id}`} className={buttonClass("secondary")}>
                  Review, edit &amp; download PDF
                </Link>
              </div>
              <CVPreview data={tailored.data} template={tailored.template} />
            </div>
          )}
        </Card>

        <Card className="space-y-3">
          <h2 className="text-lg font-semibold">2. Cover letter</h2>
          {job.coverLetter && (
            <Textarea label="Edit before sending" rows={14} value={job.coverLetter} onChange={(e) => save({ coverLetter: e.target.value })} />
          )}
          <div className="flex flex-wrap gap-2">
            <Button variant={job.coverLetter ? "secondary" : "primary"} disabled={busy !== "" || !base} onClick={writeLetter}>
              {busy === "letter" ? "Writing…" : job.coverLetter ? "Rewrite" : "Write a cover letter"}
            </Button>
            {job.coverLetter && (
              <Button
                variant="secondary"
                onClick={async () => {
                  await navigator.clipboard.writeText(job.coverLetter);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
              >
                {copied ? "Copied" : "Copy"}
              </Button>
            )}
          </div>
        </Card>

        <Card className="space-y-3">
          <h2 className="text-lg font-semibold">3. Apply</h2>
          <p className="text-sm text-muted">
            Download your tailored CV as a PDF, submit it on the employer&apos;s site, then mark the job as applied to
            track it.
          </p>
          <div className="flex flex-wrap gap-2">
            {/^https?:\/\//i.test(job.url) && (
              <a href={job.url} target="_blank" rel="noopener noreferrer" className={buttonClass("primary")}>
                Open application page ↗
              </a>
            )}
            {job.status === "saved" ? (
              <Button variant="secondary" onClick={() => save({ status: "applied", appliedAt: Date.now() })}>
                Mark as applied
              </Button>
            ) : (
              <span className="self-center text-sm capitalize text-muted">
                Status: {job.status}
                {job.appliedAt && ` · applied ${new Date(job.appliedAt).toLocaleDateString()}`}
              </span>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

export default function JobPage() {
  return (
    <Suspense>
      <JobDetail />
    </Suspense>
  );
}
