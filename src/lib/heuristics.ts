import { emptyCV, uid, type CVData } from "./types";
import { extractKeywords, hasKeyword, cvToText } from "./match";

const SECTIONS: Record<string, RegExp> = {
  summary: /^(professional\s+)?(summary|profile|about(\s+me)?|objective)$/i,
  experience: /^(work\s+|professional\s+)?(experience|employment(\s+history)?|work\s+history)$/i,
  education: /^(education|academic\s+background|qualifications)$/i,
  skills: /^((technical|key|core)\s+)?(skills|competencies|technologies)$/i,
  languages: /^languages$/i,
};

const splitList = (lines: string[]) =>
  lines
    .join(", ")
    .split(/[,;•·|\n]+/)
    .map((s) => s.replace(/^[-–*\s]+/, "").trim())
    .filter((s) => s && s.length < 60);

/**
 * Best-effort CV parsing without AI: finds contact details and the common section headings.
 * The result is a starting point the user corrects in the editor.
 */
export function parseCVBasic(text: string): CVData {
  const cv = emptyCV();
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  cv.personal.email = text.match(/[\w.+-]+@[\w-]+\.[\w.-]+/)?.[0] ?? "";
  cv.personal.phone = text.match(/\+?\d[\d\s().-]{7,}\d/)?.[0]?.trim() ?? "";
  cv.personal.website = text.match(/(https?:\/\/|www\.|linkedin\.com\/)\S+/i)?.[0] ?? "";
  cv.personal.fullName = lines.find((l) => /^[\p{L}][\p{L}.'-]*(\s+[\p{L}][\p{L}.'-]*){1,3}$/u.test(l)) ?? "";

  const afterName = lines[lines.indexOf(cv.personal.fullName) + 1] ?? "";
  if (cv.personal.fullName && afterName.length < 60 && !/[@\d]/.test(afterName) && !Object.values(SECTIONS).some((r) => r.test(afterName))) {
    cv.personal.title = afterName;
  }

  const buckets: Record<string, string[]> = { head: [] };
  let current = "head";
  for (const line of lines) {
    const heading = line.replace(/[:\s]+$/, "");
    const section = Object.keys(SECTIONS).find((k) => SECTIONS[k].test(heading));
    if (section) {
      current = section;
      buckets[current] ??= [];
    } else {
      buckets[current].push(line);
    }
  }

  cv.summary = (buckets.summary ?? []).join(" ");
  cv.skills = splitList(buckets.skills ?? []);
  cv.languages = splitList(buckets.languages ?? []);
  if (buckets.experience?.length) {
    const [role, ...rest] = buckets.experience;
    cv.experience = [
      {
        id: uid(),
        role,
        company: "",
        location: "",
        start: "",
        end: "",
        bullets: rest.map((l) => l.replace(/^[-–•*·\s]+/, "")),
      },
    ];
  }
  if (buckets.education?.length) {
    const [degree, school = "", ...rest] = buckets.education;
    cv.education = [{ id: uid(), degree, school, start: "", end: "", details: rest.join(" ") }];
  }
  return cv;
}

/** Keyword-only tailoring without AI: puts the skills the job mentions first and reports what is missing. */
export function tailorBasic(cv: CVData, description: string) {
  const keywords = extractKeywords(description);
  const relevant = (s: string) => keywords.some((k) => hasKeyword(s, k)) || hasKeyword(description, s);
  const skills = [...cv.skills.filter(relevant), ...cv.skills.filter((s) => !relevant(s))];
  const text = cvToText(cv);
  return {
    keywords,
    cv: { ...cv, skills },
    changes: skills.join() === cv.skills.join() ? [] : ["Moved the skills this job mentions to the front of your skills list."],
    gaps: keywords.filter((k) => !hasKeyword(text, k)),
  };
}
