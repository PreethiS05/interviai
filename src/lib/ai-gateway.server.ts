// Server-only helper for calling the Lovable AI Gateway with SSE streaming.
// Never import this from client code.

const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

export type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

export async function streamChatCompletion(opts: {
  model?: string;
  messages: ChatMessage[];
  temperature?: number;
}): Promise<Response> {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("Missing LOVABLE_API_KEY");

  const res = await fetch(GATEWAY_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: opts.model ?? "google/gemini-3-flash-preview",
      messages: opts.messages,
      temperature: opts.temperature ?? 0.7,
      stream: true,
    }),
  });

  if (!res.ok || !res.body) {
    const text = await res.text().catch(() => "");
    throw new Response(text || "AI gateway error", { status: res.status });
  }

  return res;
}
