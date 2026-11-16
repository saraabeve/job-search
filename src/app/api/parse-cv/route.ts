import { aiEnabled, parseCV } from "@/lib/ai";
import { fail, handleError } from "@/lib/api";
import { parseCVBasic } from "@/lib/heuristics";
import mammoth from "mammoth";
import { extractText, getDocumentProxy } from "unpdf";

export const maxDuration = 300;

const MAX_BYTES = 8 * 1024 * 1024;
// Uploads are user-supplied text that ends up in a prompt; cap it rather than send an arbitrarily large file.
const MAX_CHARS = 60_000;

export async function POST(req: Request) {
  try {
    const file = (await req.formData()).get("file");
    if (!(file instanceof File)) return fail("No file uploaded.");
    if (file.size > MAX_BYTES) return fail("That file is too large (8 MB max).", 413);

    const name = file.name.toLowerCase();
    const bytes = new Uint8Array(await file.arrayBuffer());
    const isPdf = name.endsWith(".pdf") || file.type === "application/pdf";
    const ai = aiEnabled();

    // Claude reads PDFs directly, including scanned ones with no text layer.
    if (isPdf && ai) {
      const cv = await parseCV({ pdfBase64: Buffer.from(bytes).toString("base64") });
      return Response.json({ mode: "ai", cv });
    }

    let text: string;
    if (isPdf) {
      const pdf = await getDocumentProxy(bytes);
      text = (await extractText(pdf, { mergePages: true })).text;
    } else if (name.endsWith(".docx")) {
      text = (await mammoth.extractRawText({ buffer: Buffer.from(bytes) })).value;
    } else if (name.endsWith(".txt") || name.endsWith(".md") || file.type.startsWith("text/")) {
      text = new TextDecoder().decode(bytes);
    } else {
      return fail("Unsupported file type. Upload a PDF, DOCX or TXT file.", 415);
    }

    if (!text.trim()) return fail("No text could be read from that file. If it is a scan, try a text-based PDF.", 422);
    if (text.length > MAX_CHARS) return fail("That document is too long to be a CV. Upload a shorter file.", 413);

    return ai
      ? Response.json({ mode: "ai", cv: await parseCV({ text }) })
      : Response.json({ mode: "basic", cv: parseCVBasic(text) });
  } catch (err) {
    return handleError(err);
  }
}
