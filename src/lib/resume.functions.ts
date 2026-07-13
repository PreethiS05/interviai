import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { streamChatCompletion } from "@/lib/ai-gateway.server";
import { z } from "zod";

const AnalyzeInput = z.object({
  filename: z.string().min(1).max(200),
  rawText: z.string().min(50).max(30000),
});

async function readStreamText(res: Response): Promise<string> {
  const reader = res.body!.getReader();
  const decoder = new TextDecoder();
  let out = "";
  let buffer = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      const t = line.trim();
      if (!t.startsWith("data:")) continue;
      const data = t.slice(5).trim();
      if (data === "[DONE]") continue;
      try {
        const json = JSON.parse(data);
        const token = json.choices?.[0]?.delta?.content;
        if (typeof token === "string") out += token;
      } catch {
        // ignore
      }
    }
  }
  return out;
}

const RESUME_PROMPT = `You are an elite technical recruiter and staff engineer.
Analyze the resume below and return STRICT JSON matching this TypeScript type:
{
  "summary": string,        // 2 sentence candidate summary
  "seniority": "Junior" | "Mid" | "Senior" | "Staff" | "Principal",
  "skills": string[],       // up to 20 concrete skills, deduped, normalized
  "strengths": string[],    // 3-5 bullets
  "gaps": string[],         // 3-5 missing / weak areas
  "achievements": string[], // measurable wins, "40% faster", "$2M saved"
  "atsScore": number        // 0-100 ATS compatibility
}
Return ONLY the JSON object. No prose, no code fences.`;

export const analyzeResume = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw: unknown) => AnalyzeInput.parse(raw))
  .handler(async ({ data, context }) => {
    const res = await streamChatCompletion({
      messages: [
        { role: "system", content: RESUME_PROMPT },
        { role: "user", content: `Resume:\n\n${data.rawText}` },
      ],
      temperature: 0.2,
    });
    const text = await readStreamText(res);
    const jsonStart = text.indexOf("{");
    const jsonEnd = text.lastIndexOf("}");
    let parsed: Record<string, unknown> = {};
    if (jsonStart >= 0 && jsonEnd > jsonStart) {
      try {
        parsed = JSON.parse(text.slice(jsonStart, jsonEnd + 1));
      } catch {
        parsed = { summary: text.slice(0, 500) };
      }
    }
    const ats = Math.max(0, Math.min(100, Number(parsed.atsScore) || 70));

    const { data: row, error } = await context.supabase
      .from("resumes")
      .insert({
        user_id: context.userId,
        filename: data.filename,
        raw_text: data.rawText,
        parsed: parsed as never,
        ats_score: ats,
      })
      .select("id, filename, parsed, ats_score, created_at")
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const listResumes = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("resumes")
      .select("id, filename, parsed, ats_score, created_at")
      .order("created_at", { ascending: false })
      .limit(20);
    if (error) throw new Error(error.message);
    return data ?? [];
  });
