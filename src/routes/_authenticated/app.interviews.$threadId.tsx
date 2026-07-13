import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getThread, saveTurn } from "@/lib/interviews.functions";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, ArrowUp, Loader2, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/app/interviews/$threadId")({
  component: ThreadPage,
});

type Msg = { id: string; role: "user" | "assistant" | "system"; content: string };

function ThreadPage() {
  const { threadId } = Route.useParams();
  const fetchThread = useServerFn(getThread);
  const persistFn = useServerFn(saveTurn);
  const qc = useQueryClient();

  const threadQ = useQuery({
    queryKey: ["thread", threadId],
    queryFn: () => fetchThread({ data: { id: threadId } }),
    retry: false,
  });

  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [streaming, setStreaming] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (threadQ.data) setMessages(threadQ.data.messages as Msg[]);
  }, [threadQ.data]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, streaming]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [threadId]);

  if (threadQ.isError) throw notFound();

  const persistM = useMutation({
    mutationFn: (v: { threadId: string; userMessage: string; assistantMessage: string }) =>
      persistFn({ data: v }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["threads"] }),
  });

  async function send() {
    const text = draft.trim();
    if (!text || sending) return;
    setSending(true);

    const userMsg: Msg = { id: crypto.randomUUID(), role: "user", content: text };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setDraft("");
    setStreaming("");

    const thread = threadQ.data?.thread;
    const payload = {
      messages: nextMessages.map((m) => ({ role: m.role, content: m.content })),
      context: {
        role: thread?.role ?? undefined,
        seniority: thread?.seniority ?? undefined,
        company: thread?.company ?? undefined,
      },
    };

    let assistantText = "";
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok || !res.body) throw new Error(`Chat failed (${res.status})`);
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        assistantText += decoder.decode(value, { stream: true });
        setStreaming(assistantText);
      }
      setMessages((m) => [...m, { id: crypto.randomUUID(), role: "assistant", content: assistantText }]);
      setStreaming(null);
      if (assistantText.trim()) {
        persistM.mutate({ threadId, userMessage: text, assistantMessage: assistantText });
      }
    } catch (err) {
      toast.error("Interview stream failed", { description: (err as Error).message });
      setStreaming(null);
      setMessages((m) => m.slice(0, -1));
      setDraft(text);
    } finally {
      setSending(false);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }

  // Kick off an opener if the thread is empty
  useEffect(() => {
    if (!threadQ.data) return;
    if (messages.length > 0 || streaming !== null || sending) return;
    void openInterview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [threadQ.data]);

  async function openInterview() {
    const thread = threadQ.data?.thread;
    if (!thread) return;
    setSending(true);
    setStreaming("");
    let assistantText = "";
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: "Please begin the interview with a warm intro and your first question." }],
          context: {
            role: thread.role ?? undefined,
            seniority: thread.seniority ?? undefined,
            company: thread.company ?? undefined,
          },
        }),
      });
      if (!res.ok || !res.body) throw new Error(`Chat failed (${res.status})`);
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        assistantText += decoder.decode(value, { stream: true });
        setStreaming(assistantText);
      }
      setMessages([{ id: crypto.randomUUID(), role: "assistant", content: assistantText }]);
      setStreaming(null);
      // Persist opener as an assistant-only message (skip: no user turn yet)
      if (assistantText.trim()) {
        const { data: sess } = await supabase.auth.getSession();
        const userId = sess.session?.user.id;
        if (userId) {
          await supabase.from("interview_messages").insert({
            thread_id: threadId,
            user_id: userId,
            role: "assistant",
            content: assistantText,
          });
        }
      }
    } catch (err) {
      toast.error("Failed to start interview", { description: (err as Error).message });
      setStreaming(null);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  }

  const thread = threadQ.data?.thread;

  return (
    <div className="flex h-[calc(100dvh-3rem)] flex-col">
      <div className="flex items-center justify-between border-b border-border/60 bg-background/70 px-6 py-3 backdrop-blur">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="icon" aria-label="Back to interviews">
            <Link to="/app/interviews">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <p className="text-sm font-medium">{thread?.title ?? "Interview"}</p>
            <p className="text-xs text-muted-foreground">
              {[thread?.role, thread?.seniority, thread?.company].filter(Boolean).join(" · ") || "Live session"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5 text-brand" />
          Nova · Gemini 3
        </div>
      </div>

      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl space-y-6 px-6 py-8">
          {messages.map((m) => (
            <MessageBubble key={m.id} role={m.role} content={m.content} />
          ))}
          {streaming !== null && <MessageBubble role="assistant" content={streaming} streaming />}
          {threadQ.isLoading && (
            <div className="flex justify-center">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-border/60 bg-background/80 p-4 backdrop-blur">
        <div className="mx-auto max-w-3xl">
          <div className="relative rounded-2xl border border-border/70 bg-surface/70 focus-within:border-brand/60 focus-within:shadow-glow">
            <Textarea
              ref={inputRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void send();
                }
              }}
              placeholder="Type your answer — press Enter to send, Shift+Enter for a new line"
              rows={2}
              className="min-h-[64px] resize-none border-0 bg-transparent px-4 py-3 pr-14 text-sm focus-visible:ring-0"
              disabled={sending || threadQ.isLoading}
            />
            <Button
              size="icon"
              className="absolute bottom-2 right-2 h-9 w-9 rounded-full"
              onClick={send}
              disabled={sending || !draft.trim()}
              aria-label="Send"
            >
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowUp className="h-4 w-4" />}
            </Button>
          </div>
          <p className="mt-2 text-center text-[11px] text-muted-foreground">
            Nova can ask follow-ups. Be specific — mention actual systems, numbers, decisions.
          </p>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({
  role,
  content,
  streaming,
}: {
  role: "user" | "assistant" | "system";
  content: string;
  streaming?: boolean;
}) {
  if (role === "system") return null;
  const isUser = role === "user";
  return (
    <div className={isUser ? "flex justify-end" : "flex gap-3"}>
      {!isUser && (
        <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-gradient text-brand-foreground">
          <Sparkles className="h-3.5 w-3.5" />
        </div>
      )}
      <div className={isUser ? "max-w-[85%]" : "max-w-[85%] flex-1"}>
        {!isUser && (
          <p className="mb-1 text-[11px] uppercase tracking-wider text-muted-foreground">
            Nova {streaming ? "· typing…" : ""}
          </p>
        )}
        <div
          className={
            isUser
              ? "rounded-2xl rounded-tr-sm bg-primary px-4 py-2.5 text-primary-foreground"
              : "prose prose-invert prose-sm max-w-none text-foreground"
          }
        >
          {isUser ? (
            <p className="whitespace-pre-wrap">{content}</p>
          ) : (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{content || "…"}</ReactMarkdown>
          )}
        </div>
      </div>
    </div>
  );
}
