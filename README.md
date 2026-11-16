# TailorCV

A web app that helps people apply for jobs with a CV tailored to each posting.

- **Upload a CV** (PDF, DOCX or text) and have it read into an editable, structured CV — or **build one step by step** with a guided wizard and a live preview.
- **Three templates** (Classic, Modern, Compact), exported as a text-based, ATS-readable PDF through the browser's print dialog.
- **Add a job posting** and **tailor the CV to it**: the summary, bullets and skills are rewritten to match the job's language, with a keyword match score, a list of what changed, and the gaps the CV doesn't cover. Tailoring never invents experience.
- **Cover letter** drafted from the CV and the posting.
- **Application tracker**: saved → applied → interview → offer / rejected.

## Run it

```bash
npm install
cp .env.example .env.local   # then add your ANTHROPIC_API_KEY
npm run dev
```

Open http://localhost:3000.

Without `ANTHROPIC_API_KEY` the app still works in a basic mode: uploads are parsed with simple heuristics, tailoring is a keyword analysis that only reorders skills, and cover letters are unavailable.

## How it is built

- Next.js (App Router) + TypeScript + Tailwind CSS.
- `src/lib/ai.ts` — the three Claude calls (parse CV, tailor CV, cover letter), using structured outputs so responses always fit the CV schema.
- `src/lib/heuristics.ts`, `src/lib/match.ts` — the no-AI fallback and the keyword match score.
- `src/lib/store.ts` — CVs and jobs are stored in the browser's `localStorage`. There are no accounts or database yet, so data stays on the user's device and does not sync between devices.
- `src/components/CVPreview.tsx` — the CV templates.

## Not built yet

- User accounts and server-side storage.
- Importing a job posting from its URL (the description is pasted in).
- Submitting applications to employers automatically — the user downloads the PDF and applies on the employer's site.
- Rate limiting on the AI endpoints; add it before exposing the app publicly, since each call costs money.
