import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const CreateThreadInput = z.object({
  title: z.string().min(1).max(120).default("New interview"),
  role: z.string().max(80).optional(),
  seniority: z.string().max(40).optional(),
  company: z.string().max(80).optional(),
});

export const createThread = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw: unknown) => CreateThreadInput.parse(raw))
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("interview_threads")
      .insert({
        user_id: context.userId,
        title: data.title,
        role: data.role,
        seniority: data.seniority,
        company: data.company,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: row.id as string };
  });

export const listThreads = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("interview_threads")
      .select("id, title, role, seniority, company, status, updated_at, created_at")
      .order("updated_at", { ascending: false })
      .limit(100);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const getThread = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw: unknown) => z.object({ id: z.string().uuid() }).parse(raw))
  .handler(async ({ data, context }) => {
    const [thread, messages] = await Promise.all([
      context.supabase
        .from("interview_threads")
        .select("id, title, role, seniority, company, status, created_at")
        .eq("id", data.id)
        .single(),
      context.supabase
        .from("interview_messages")
        .select("id, role, content, created_at")
        .eq("thread_id", data.id)
        .order("created_at", { ascending: true }),
    ]);
    if (thread.error) throw new Error(thread.error.message);
    if (messages.error) throw new Error(messages.error.message);
    return { thread: thread.data, messages: messages.data ?? [] };
  });

const SaveTurnInput = z.object({
  threadId: z.string().uuid(),
  userMessage: z.string().min(1).max(8000),
  assistantMessage: z.string().min(1).max(20000),
});

export const saveTurn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw: unknown) => SaveTurnInput.parse(raw))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("interview_messages").insert([
      { thread_id: data.threadId, user_id: context.userId, role: "user", content: data.userMessage },
      { thread_id: data.threadId, user_id: context.userId, role: "assistant", content: data.assistantMessage },
    ]);
    if (error) throw new Error(error.message);
    await context.supabase
      .from("interview_threads")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", data.threadId);
    return { ok: true };
  });

export const deleteThread = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw: unknown) => z.object({ id: z.string().uuid() }).parse(raw))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("interview_threads").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
