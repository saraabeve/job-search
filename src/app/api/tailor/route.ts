import { aiEnabled, tailorCV } from "@/lib/ai";
import { CVBody, JobBody, handleError } from "@/lib/api";
import { tailorBasic } from "@/lib/heuristics";
import type { TailorResult } from "@/lib/types";
import { z } from "zod";

export const maxDuration = 300;

export async function POST(req: Request) {
  try {
    const { cv, job } = z.object({ cv: CVBody, job: JobBody }).parse(await req.json());
    const result: TailorResult = aiEnabled()
      ? { mode: "ai", ...(await tailorCV(cv, job)) }
      : { mode: "basic", ...tailorBasic(cv, job.description) };
    return Response.json(result);
  } catch (err) {
    return handleError(err);
  }
}
