export type TemplateId = "classic" | "modern" | "compact";

export interface Experience {
  id: string;
  role: string;
  company: string;
  location: string;
  start: string;
  end: string;
  bullets: string[];
}

export interface Education {
  id: string;
  school: string;
  degree: string;
  start: string;
  end: string;
  details: string;
}

export interface CVData {
  personal: {
    fullName: string;
    title: string;
    email: string;
    phone: string;
    location: string;
    website: string;
  };
  summary: string;
  experience: Experience[];
  education: Education[];
  skills: string[];
  languages: string[];
}

export interface CV {
  id: string;
  name: string;
  template: TemplateId;
  data: CVData;
  /** Set when this CV was tailored for a specific job. */
  jobId?: string;
  updatedAt: number;
}

export const JOB_STATUSES = ["saved", "applied", "interview", "offer", "rejected"] as const;
export type JobStatus = (typeof JOB_STATUSES)[number];

export interface Job {
  id: string;
  title: string;
  company: string;
  url: string;
  description: string;
  status: JobStatus;
  notes: string;
  coverLetter: string;
  tailoredCvId?: string;
  /** Result of the last tailoring run, kept so the match report survives a reload. */
  analysis?: Omit<TailorResult, "cv"> & { baseScore: number };
  createdAt: number;
  appliedAt?: number;
}

export interface TailorResult {
  /** "ai" when Claude rewrote the CV, "basic" for the keyword-only fallback. */
  mode: "ai" | "basic";
  cv: CVData;
  keywords: string[];
  changes: string[];
  gaps: string[];
}

export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

export const emptyCV = (): CVData => ({
  personal: { fullName: "", title: "", email: "", phone: "", location: "", website: "" },
  summary: "",
  experience: [],
  education: [],
  skills: [],
  languages: [],
});
