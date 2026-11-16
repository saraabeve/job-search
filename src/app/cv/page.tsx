"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Button, Card, Notice } from "@/components/ui";
import { actions, useStore } from "@/lib/store";
import { emptyCV, uid, type CV, type CVData } from "@/lib/types";

export default function CVListPage() {
  const store = useStore();
  const router = useRouter();
  const fileInput = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  function create(data: CVData, name: string, query = "") {
    const cv: CV = { id: uid(), name, template: "modern", data, updatedAt: Date.now() };
    actions.saveCV(cv);
    router.push(`/cv/${cv.id}${query}`);
  }

  async function upload(file: File) {
    setBusy(true);
    setError("");
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/parse-cv", { method: "POST", body });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      create(json.cv, file.name.replace(/\.[^.]+$/, ""), `?imported=${json.mode}`);
    } catch (err) {
      setError(err instanceof Error && err.message ? err.message : "Upload failed. Try again.");
      setBusy(false);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">My CVs</h1>
        <p className="mt-1 text-sm text-muted">Start from a file you already have, or build one from scratch.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <h2 className="font-semibold">Upload a CV</h2>
          <p className="mt-1 text-sm text-muted">PDF, Word (.docx) or text. We read it into an editable CV.</p>
          <input
            ref={fileInput}
            type="file"
            accept=".pdf,.docx,.txt,.md"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              if (file) upload(file);
            }}
          />
          <Button className="mt-4" disabled={busy} onClick={() => fileInput.current?.click()}>
            {busy ? "Reading your CV…" : "Choose file"}
          </Button>
        </Card>
        <Card>
          <h2 className="font-semibold">Build step by step</h2>
          <p className="mt-1 text-sm text-muted">Answer a few short sections and pick a template as you go.</p>
          <Button className="mt-4" variant="secondary" disabled={busy} onClick={() => create(emptyCV(), "My CV")}>
            Start a new CV
          </Button>
        </Card>
      </div>
      {error && <Notice tone="error">{error}</Notice>}

      {store && store.cvs.length > 0 && (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {store.cvs.map((cv) => {
            const job = store.jobs.find((j) => j.id === cv.jobId);
            return (
              <li key={cv.id}>
                <Card className="flex h-full flex-col">
                  <Link href={`/cv/${cv.id}`} className="font-medium hover:text-brand">
                    {cv.name || "Untitled CV"}
                  </Link>
                  <p className="mt-1 text-xs text-muted">
                    {job ? `Tailored for ${job.title}${job.company ? ` at ${job.company}` : ""}` : "Base CV"} · edited{" "}
                    {new Date(cv.updatedAt).toLocaleDateString()}
                  </p>
                  <div className="mt-auto flex gap-1 pt-4">
                    <Link href={`/cv/${cv.id}`} className="rounded-lg px-3 py-1.5 text-sm font-medium text-brand hover:bg-brand-soft">
                      Edit
                    </Link>
                    <Button
                      variant="danger"
                      className="px-3 py-1.5"
                      onClick={() => confirm(`Delete "${cv.name}"?`) && actions.deleteCV(cv.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
