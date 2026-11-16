import "server-only";
import { z } from "zod";
import { AIError } from "./ai";

const item = { id: z.string() };
export const CVBody = z.object({
  personal: z.object({
    fullName: z.string(),
    title: z.string(),
    email: z.string(),
    phone: z.string(),
    location: z.string(),
    website: z.string(),
  }),
  summary: z.string(),
  experience: z.array(
    z.object({
      ...item,
      role: z.string(),
      company: z.string(),
      location: z.string(),
      start: z.string(),
      end: z.string(),
      bullets: z.array(z.string()),
    }),
  ),
  education: z.array(
    z.object({ ...item, school: z.string(), degree: z.string(), start: z.string(), end: z.string(), details: z.string() }),
  ),
  skills: z.array(z.string()),
  languages: z.array(z.string()),
});

export const JobBody = z.object({
  title: z.string().max(300),
  company: z.string().max(300),
  description: z.string().min(1).max(30_000),
});

export const fail = (message: string, status = 400) => Response.json({ error: message }, { status });

export function handleError(err: unknown) {
  if (err instanceof AIError) return fail(err.message, err.status);
  if (err instanceof z.ZodError || err instanceof SyntaxError) return fail("Invalid request.");
  console.error(err);
  return fail("Something went wrong. Try again.", 500);
}
