import { createFileRoute } from "@tanstack/react-router";
import { streamChatCompletion, type ChatMessage } from "@/lib/ai-gateway.server";

const INTERVIEWER_SYSTEM = `You are Nova, a principal engineer at a top-tier tech company acting as a live technical interviewer for InterviAI.

Style:
- Warm, sharp, and Socratic. Ask one focused question at a time.
- Reference the candidate's prior answers by name/detail. Probe for depth.
- If an answer is vague, ask a pointed follow-up. If it's inconsistent, gently surface it.
- Adapt difficulty to signal: raise the bar when they nail it, scaffold when they struggle.
- Never dump a list of questions. This is a real conversation.
- Keep responses short (2–4 sentences) unless giving structured feedback.
- Use markdown sparingly for emphasis and code.

Always ground questions in the role/seniority/company context you were given.`;

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let payload: {
          messages?: ChatMessage[];
          context?: { role?: string; seniority?: string; company?: string };
        };
        try {
          payload = await request.json();
        } catch {
          return new Response("Invalid JSON", { status: 400 });
        }

        const messages = payload.messages;
        if (!Array.isArray(messages) || messages.length === 0) {
          return new Response("messages required", { status: 400 });
        }

        const ctx = payload.context ?? {};
        const contextLine = [
          ctx.role && `Role: ${ctx.role}`,
          ctx.seniority && `Seniority: ${ctx.seniority}`,
          ctx.company && `Company: ${ctx.company}`,
        ]
          .filter(Boolean)
          .join(" · ");

        const systemMessages: ChatMessage[] = [
          { role: "system", content: INTERVIEWER_SYSTEM },
          ...(contextLine ? [{ role: "system" as const, content: `Interview context — ${contextLine}` }] : []),
        ];

        let upstream: Response;
        try {
          upstream = await streamChatCompletion({
            messages: [...systemMessages, ...messages],
          });
        } catch (err) {
          if (err instanceof Response) return err;
          console.error("[chat] gateway error", err);
          return new Response("Upstream error", { status: 502 });
        }

        // Transform OpenAI-style SSE chunks into a plain text stream of tokens.
        const decoder = new TextDecoder();
        const encoder = new TextEncoder();
        let buffer = "";

        const stream = new ReadableStream({
          async start(controller) {
            const reader = upstream.body!.getReader();
            try {
              while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                buffer += decoder.decode(value, { stream: true });
                const parts = buffer.split("\n");
                buffer = parts.pop() ?? "";
                for (const line of parts) {
                  const trimmed = line.trim();
                  if (!trimmed.startsWith("data:")) continue;
                  const data = trimmed.slice(5).trim();
                  if (data === "[DONE]") continue;
                  try {
                    const json = JSON.parse(data);
                    const token = json.choices?.[0]?.delta?.content;
                    if (typeof token === "string" && token.length > 0) {
                      controller.enqueue(encoder.encode(token));
                    }
                  } catch {
                    // ignore keep-alives / partial frames
                  }
                }
              }
            } catch (err) {
              console.error("[chat] stream error", err);
            } finally {
              controller.close();
            }
          },
        });

        return new Response(stream, {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "no-cache, no-transform",
            "X-Accel-Buffering": "no",
          },
        });
      },
    },
  },
});
