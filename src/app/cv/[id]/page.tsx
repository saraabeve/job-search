"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { CVPreview, TEMPLATES } from "@/components/CVPreview";
import { ListEditor } from "@/components/ListEditor";
import { Button, Card, Input, Notice, Textarea } from "@/components/ui";
import { actions, useStore } from "@/lib/store";
import { uid, type CV, type CVData, type Education, type Experience } from "@/lib/types";

const STEPS = ["Contact", "Profile", "Experience", "Education", "Skills", "Template"] as const;

function Editor() {
  const { id } = useParams<{ id: string }>();
  const imported = useSearchParams().get("imported");
  const store = useStore();
  const [step, setStep] = useState(0);

  if (!store) return null;
  const cv = store.cvs.find((c) => c.id === id);
  if (!cv) {
    return (
      <Card>
        <p>This CV doesn&apos;t exist in this browser.</p>
        <Link href="/cv" className="mt-2 inline-block text-sm font-medium text-brand">
          Back to my CVs
        </Link>
      </Card>
    );
  }

  const save = (patch: Partial<CV>) => actions.saveCV({ ...cv, ...patch });
  const setData = (patch: Partial<CVData>) => save({ data: { ...cv.data, ...patch } });
  const d = cv.data;
  const personal = (key: keyof CVData["personal"]) => ({
    value: d.personal[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => setData({ personal: { ...d.personal, [key]: e.target.value } }),
  });
  const setExp = (expId: string, patch: Partial<Experience>) =>
    setData({ experience: d.experience.map((e) => (e.id === expId ? { ...e, ...patch } : e)) });
  const setEdu = (eduId: string, patch: Partial<Education>) =>
    setData({ education: d.education.map((e) => (e.id === eduId ? { ...e, ...patch } : e)) });

  return (
    <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)]">
      <div className="space-y-4 print:hidden">
        <input
          aria-label="CV name"
          className="w-full rounded-lg border border-transparent bg-transparent px-1 text-2xl font-semibold tracking-tight outline-none hover:border-line focus:border-brand"
          value={cv.name}
          onChange={(e) => save({ name: e.target.value })}
        />
        {imported === "basic" && (
          <Notice>
            We filled in what we could read from your file. Check each step and correct anything that landed in the
            wrong place.
          </Notice>
        )}
        {imported === "ai" && <Notice>Your CV was imported. Review each step to make sure nothing was missed.</Notice>}

        <ol className="flex flex-wrap gap-1">
          {STEPS.map((name, i) => (
            <li key={name}>
              <button
                type="button"
                aria-current={i === step ? "step" : undefined}
                onClick={() => setStep(i)}
                className={`cursor-pointer rounded-full px-3 py-1 text-xs font-medium ${
                  i === step ? "bg-brand text-white" : "bg-white text-muted ring-1 ring-line hover:text-ink"
                }`}
              >
                {i + 1}. {name}
              </button>
            </li>
          ))}
        </ol>

        <Card className="space-y-4">
          {step === 0 && (
            <>
              <Input label="Full name" autoComplete="name" {...personal("fullName")} />
              <Input label="Professional title" placeholder="e.g. Marketing Manager" {...personal("title")} />
              <div className="grid grid-cols-2 gap-3">
                <Input label="Email" type="email" autoComplete="email" {...personal("email")} />
                <Input label="Phone" type="tel" autoComplete="tel" {...personal("phone")} />
              </div>
              <Input label="Location" placeholder="City, Country" {...personal("location")} />
              <Input label="LinkedIn or website" {...personal("website")} />
            </>
          )}

          {step === 1 && (
            <Textarea
              label="Profile summary"
              rows={8}
              placeholder="Two to four sentences on who you are professionally and what you're best at."
              value={d.summary}
              onChange={(e) => setData({ summary: e.target.value })}
            />
          )}

          {step === 2 && (
            <>
              {d.experience.map((e, i) => (
                <fieldset key={e.id} className="space-y-3 border-b border-line pb-4">
                  <legend className="sr-only">Position {i + 1}</legend>
                  <div className="grid grid-cols-2 gap-3">
                    <Input label="Job title" value={e.role} onChange={(ev) => setExp(e.id, { role: ev.target.value })} />
                    <Input label="Company" value={e.company} onChange={(ev) => setExp(e.id, { company: ev.target.value })} />
                    <Input label="Start" placeholder="Mar 2021" value={e.start} onChange={(ev) => setExp(e.id, { start: ev.target.value })} />
                    <Input label="End" placeholder="Present" value={e.end} onChange={(ev) => setExp(e.id, { end: ev.target.value })} />
                  </div>
                  <Input label="Location" value={e.location} onChange={(ev) => setExp(e.id, { location: ev.target.value })} />
                  <Textarea
                    label="Achievements — one per line"
                    rows={5}
                    placeholder={"Led a team of 5 to launch…\nCut reporting time by 30% by…"}
                    value={e.bullets.join("\n")}
                    onChange={(ev) => setExp(e.id, { bullets: ev.target.value.split("\n") })}
                  />
                  <Button
                    variant="danger"
                    className="px-2 py-1"
                    onClick={() => setData({ experience: d.experience.filter((x) => x.id !== e.id) })}
                  >
                    Remove position
                  </Button>
                </fieldset>
              ))}
              <Button
                variant="secondary"
                onClick={() =>
                  setData({
                    experience: [...d.experience, { id: uid(), role: "", company: "", location: "", start: "", end: "", bullets: [] }],
                  })
                }
              >
                + Add position
              </Button>
            </>
          )}

          {step === 3 && (
            <>
              {d.education.map((e, i) => (
                <fieldset key={e.id} className="space-y-3 border-b border-line pb-4">
                  <legend className="sr-only">Education {i + 1}</legend>
                  <Input label="Degree or qualification" value={e.degree} onChange={(ev) => setEdu(e.id, { degree: ev.target.value })} />
                  <Input label="School" value={e.school} onChange={(ev) => setEdu(e.id, { school: ev.target.value })} />
                  <div className="grid grid-cols-2 gap-3">
                    <Input label="Start" value={e.start} onChange={(ev) => setEdu(e.id, { start: ev.target.value })} />
                    <Input label="End" value={e.end} onChange={(ev) => setEdu(e.id, { end: ev.target.value })} />
                  </div>
                  <Input label="Details (optional)" placeholder="Honours, thesis, relevant courses" value={e.details} onChange={(ev) => setEdu(e.id, { details: ev.target.value })} />
                  <Button
                    variant="danger"
                    className="px-2 py-1"
                    onClick={() => setData({ education: d.education.filter((x) => x.id !== e.id) })}
                  >
                    Remove
                  </Button>
                </fieldset>
              ))}
              <Button
                variant="secondary"
                onClick={() =>
                  setData({ education: [...d.education, { id: uid(), school: "", degree: "", start: "", end: "", details: "" }] })
                }
              >
                + Add education
              </Button>
            </>
          )}

          {step === 4 && (
            <>
              <ListEditor
                label="Skills"
                placeholder="Type a skill and press Enter (or paste a comma-separated list)"
                items={d.skills}
                onChange={(skills) => setData({ skills })}
              />
              <ListEditor
                label="Languages"
                placeholder="e.g. English (native)"
                items={d.languages}
                onChange={(languages) => setData({ languages })}
              />
            </>
          )}

          {step === 5 && (
            <>
              <div className="grid gap-2" role="radiogroup" aria-label="Template">
                {TEMPLATES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    role="radio"
                    aria-checked={cv.template === t.id}
                    onClick={() => save({ template: t.id })}
                    className={`cursor-pointer rounded-lg border px-4 py-3 text-left ${
                      cv.template === t.id ? "border-brand bg-brand-soft" : "border-line hover:bg-paper"
                    }`}
                  >
                    <span className="block text-sm font-medium">{t.name}</span>
                    <span className="block text-xs text-muted">{t.blurb}</span>
                  </button>
                ))}
              </div>
              <Button className="w-full" onClick={() => window.print()}>
                Download as PDF
              </Button>
              <p className="text-xs text-muted">
                Opens your browser&apos;s print dialog — choose &ldquo;Save as PDF&rdquo;. Next,{" "}
                <Link href="/jobs" className="font-medium text-brand">
                  add a job
                </Link>{" "}
                to tailor this CV to it.
              </p>
            </>
          )}
        </Card>

        <div className="flex justify-between">
          <Button variant="ghost" disabled={step === 0} onClick={() => setStep(step - 1)}>
            ← Back
          </Button>
          {step < STEPS.length - 1 && <Button onClick={() => setStep(step + 1)}>Next: {STEPS[step + 1]} →</Button>}
        </div>
        <p className="text-xs text-muted">Changes are saved automatically in this browser.</p>
      </div>

      <div className="lg:sticky lg:top-6">
        <CVPreview data={d} template={cv.template} />
      </div>
    </div>
  );
}

export default function CVEditorPage() {
  return (
    <Suspense>
      <Editor />
    </Suspense>
  );
}
