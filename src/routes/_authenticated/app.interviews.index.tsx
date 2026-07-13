import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listThreads, createThread, deleteThread } from "@/lib/interviews.functions";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Plus, Trash2, MessagesSquare, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { EmptyState } from "./app.index";

export const Route = createFileRoute("/_authenticated/app/interviews/")({
  component: Interviews,
});

function Interviews() {
  const fetchThreads = useServerFn(listThreads);
  const createFn = useServerFn(createThread);
  const deleteFn = useServerFn(deleteThread);
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const threadsQ = useQuery({ queryKey: ["threads"], queryFn: () => fetchThreads() });

  const createM = useMutation({
    mutationFn: (input: { title: string; role?: string; seniority?: string; company?: string }) =>
      createFn({ data: input }),
    onSuccess: async ({ id }) => {
      await qc.invalidateQueries({ queryKey: ["threads"] });
      setOpen(false);
      navigate({ to: "/app/interviews/$threadId", params: { threadId: id } });
    },
    onError: (e) => toast.error("Couldn't create interview", { description: (e as Error).message }),
  });

  const deleteM = useMutation({
    mutationFn: (id: string) => deleteFn({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["threads"] }),
    onError: (e) => toast.error("Delete failed", { description: (e as Error).message }),
  });

  const threads = threadsQ.data ?? [];

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Sessions</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Interviews</h1>
          <p className="mt-1 text-muted-foreground">Practice on your schedule. History syncs across devices.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-full">
              <Plus className="mr-1 h-4 w-4" /> New interview
            </Button>
          </DialogTrigger>
          <NewInterviewDialog onCreate={(v) => createM.mutate(v)} pending={createM.isPending} />
        </Dialog>
      </div>

      <div className="mt-8">
        {threadsQ.isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-16 animate-pulse rounded-xl bg-surface-2/60" />
            ))}
          </div>
        ) : threads.length === 0 ? (
          <EmptyState
            title="No interviews yet"
            body="Start your first session — Nova adapts to your target role and seniority."
            cta={<Button onClick={() => setOpen(true)}><Plus className="mr-1 h-4 w-4" /> New interview</Button>}
          />
        ) : (
          <ul className="space-y-2">
            {threads.map((t) => (
              <li key={t.id}>
                <Card className="flex items-center justify-between gap-3 border-border/60 bg-surface/60 p-4 transition hover:border-border">
                  <Link
                    to="/app/interviews/$threadId"
                    params={{ threadId: t.id }}
                    className="flex flex-1 items-center gap-4 text-left"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-gradient text-brand-foreground shadow-glow">
                      <MessagesSquare className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{t.title}</p>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {[t.role, t.seniority, t.company].filter(Boolean).join(" · ") || "General"} ·{" "}
                        updated {formatDistanceToNow(new Date(t.updated_at), { addSuffix: true })}
                      </p>
                    </div>
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Delete interview"
                    onClick={() => {
                      if (confirm("Delete this interview and all messages?")) deleteM.mutate(t.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function NewInterviewDialog({
  onCreate,
  pending,
}: {
  onCreate: (v: { title: string; role?: string; seniority?: string; company?: string }) => void;
  pending: boolean;
}) {
  const [role, setRole] = useState("");
  const [seniority, setSeniority] = useState("Senior");
  const [company, setCompany] = useState("");

  return (
    <DialogContent className="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>New interview</DialogTitle>
      </DialogHeader>
      <form
        id="new-interview"
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          const title =
            [role, seniority && `(${seniority})`, company && `@ ${company}`]
              .filter(Boolean)
              .join(" ") || "New interview";
          onCreate({ title, role: role || undefined, seniority: seniority || undefined, company: company || undefined });
        }}
      >
        <div className="space-y-1.5">
          <Label htmlFor="role">Role</Label>
          <Input id="role" value={role} onChange={(e) => setRole(e.target.value)} placeholder="e.g. Backend Engineer" />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="seniority">Seniority</Label>
            <Input id="seniority" value={seniority} onChange={(e) => setSeniority(e.target.value)} placeholder="Junior / Mid / Senior / Staff" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="company">Company</Label>
            <Input id="company" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="e.g. Stripe" />
          </div>
        </div>
      </form>
      <DialogFooter>
        <Button form="new-interview" type="submit" disabled={pending}>
          {pending ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : null}
          Start session
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
