import Link from "next/link";
import { buttonClass, Card } from "@/components/ui";

const STEPS = [
  {
    title: "1. Start with your CV",
    text: "Upload the CV you already have (PDF, Word or text), or build one step by step with a guided template.",
  },
  {
    title: "2. Add the job you want",
    text: "Paste the job posting. You get a match score and the keywords the employer is screening for.",
  },
  {
    title: "3. Tailor and apply",
    text: "Get a version of your CV rewritten for that job — truthfully — plus a cover letter. Download the PDF and track the application.",
  },
];

export default function Home() {
  return (
    <div className="py-10">
      <h1 className="max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">
        A CV that fits <span className="text-brand">every job</span> you apply for.
      </h1>
      <p className="mt-4 max-w-xl text-lg text-muted">
        Build or upload your CV once. For each job, get a tailored version that speaks the posting&apos;s language, then
        submit it with confidence.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/cv" className={buttonClass("primary")}>
          Create or upload a CV
        </Link>
        <Link href="/jobs" className={buttonClass("secondary")}>
          Add a job
        </Link>
      </div>
      <div className="mt-14 grid gap-4 md:grid-cols-3">
        {STEPS.map((s) => (
          <Card key={s.title}>
            <h2 className="font-semibold">{s.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">{s.text}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
