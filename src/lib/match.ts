import type { CVData } from "./types";

const STOP = new Set(
  `a about above across after all also an and any are as at be been being both but by can could do does each etc for from
get has have having he her here him his how i if in into is it its just like may more most must my no nor not of on once
only or other our out over own per she should so some such than that the their them then there these they this those
through to too under until up us very was we were what when where which while who will with within without would you your
ability able strong excellent good great work working experience experienced years year role team teams company join
looking seeking candidate candidates ideal including include includes required requirements requirement preferred plus
responsibilities responsible opportunity opportunities position job jobs skills skill knowledge understanding proven
well new use using used help make ensure provide across based day days time full part high level key need needs want
environment best world apply offer benefits salary equal employer please people business businesses`.split(/\s+/),
);

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9+#./\- ]+/g, " ");

/** Frequency-based keyword extraction, used when no AI keyword list is available. */
export function extractKeywords(text: string, limit = 24): string[] {
  const counts = new Map<string, number>();
  for (const raw of norm(text).split(/\s+/)) {
    const w = raw.replace(/^[./-]+|[./-]+$/g, "");
    if (w.length < 2 || STOP.has(w) || /^\d+$/.test(w)) continue;
    counts.set(w, (counts.get(w) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || b[0].length - a[0].length)
    .slice(0, limit)
    .map(([w]) => w);
}

export function cvToText(cv: CVData): string {
  const p = cv.personal;
  return [
    p.fullName,
    p.title,
    cv.summary,
    ...cv.experience.flatMap((e) => [e.role, e.company, ...e.bullets]),
    ...cv.education.flatMap((e) => [e.degree, e.school, e.details]),
    cv.skills.join(", "),
    cv.languages.join(", "),
  ]
    .filter(Boolean)
    .join("\n");
}

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export function hasKeyword(haystack: string, keyword: string): boolean {
  const k = keyword.toLowerCase().trim();
  if (!k) return false;
  return new RegExp(`(^|[^a-z0-9])${escapeRe(k)}([^a-z0-9]|$)`).test(haystack.toLowerCase());
}

/** Share of job keywords that literally appear in the CV — the same check a keyword-based ATS filter makes. */
export function scoreMatch(cv: CVData, keywords: string[]) {
  const text = cvToText(cv);
  const matched = keywords.filter((k) => hasKeyword(text, k));
  const missing = keywords.filter((k) => !matched.includes(k));
  const score = keywords.length ? Math.round((matched.length / keywords.length) * 100) : 0;
  return { score, matched, missing };
}
