import { aiEnabled, coverLetter } from "@/lib/ai";
import { CVBody, JobBody, fail, handleError } from "@/lib/api";
import { z } from "zod";

export const maxDuration = 300;

export async function POST(req: Request) {
  try {
    if (!aiEnabled()) return fail("Cover letters need AI. Set ANTHROPIC_API_KEY on the server to enable them.", 503);
    const { cv, job } = z.object({ cv: CVBody, job: JobBody }).parse(await req.json());
    return Response.json({ letter: await coverLetter(cv, job) });
  } catch (err) {
    return handleError(err);
  }
}
