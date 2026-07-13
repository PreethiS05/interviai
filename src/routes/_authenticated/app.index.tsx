import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listThreads } from "@/lib/interviews.functions";
import { listResumes } from "@/lib/resume.functions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, MessagesSquare, FileText, Sparkles, TrendingUp } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export const Route = createFileRoute("/_authenticated/app/")({
  component: Overview,
});

function Overview() {
  const fetchThreads = useServerFn(listThreads);
  const fetchResumes = useServerFn(listResumes);
  const threadsQ = useQuery({ queryKey: ["threads"], queryFn: () => fetchThreads() });
  const resumesQ = useQuery({ queryKey: ["resumes"], queryFn: () => fetchResumes() });

  const threads = threadsQ.data ?? [];
  const resumes = resumesQ.data ?? [];
  const latestAts = resumes[0]?.ats_score ?? null;

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Workspace</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Good to see you back.</h1>
          <p className="mt-1 text-muted-foreground">
            Pick up where you left off, or start a new loop.
          </p>
        </div>
        <Button asChild className="rounded-full">
          <Link to="/app/interviews">
            Start interview <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon={MessagesSquare} label="Interviews" value={String(threads.length)} />
        <Stat icon={FileText} label="Resumes analyzed" value={String(resumes.length)} />
        <Stat
          icon={TrendingUp}
          label="Latest ATS score"
          value={latestAts !== null ? `${latestAts}` : "—"}
          hint={latestAts !== null ? "out of 100" : "upload a resume"}
        />
        <Stat icon={Sparkles} label="Model" value="Gemini 3" hint="Streaming" />
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Card className="border-border/60 bg-surface/60 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Recent interviews
            </h2>
            <Button asChild variant="ghost" size="sm">
              <Link to="/app/interviews">View all</Link>
            </Button>
          </div>
          {threadsQ.isLoading ? (
            <SkeletonList />
          ) : threads.length === 0 ? (
            <EmptyState
              title="No interviews yet"
              body="Kick off your first mock interview — Nova will tailor it to your target role."
              cta={
                <Button asChild size="sm">
                  <Link to="/app/interviews">Start interview</Link>
                </Button>
              }
            />
          ) : (
            <ul className="divide-y divide-border/60">
              {threads.slice(0, 5).map((t) => (
                <li key={t.id}>
                  <Link
                    to="/app/interviews/$threadId"
                    params={{ threadId: t.id }}
                    className="flex items-center justify-between py-3 transition hover:bg-surface-2/50"
                  >
                    <div>
                      <p className="font-medium text-foreground">{t.title}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {[t.role, t.seniority, t.company].filter(Boolean).join(" · ") || "Untitled"}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(t.updated_at), { addSuffix: true })}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="border-border/60 bg-surface/60 p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Quick actions
          </h2>
          <div className="mt-4 space-y-2">
            <QuickAction to="/app/interviews" title="Start a mock interview" subtitle="Behavioral, systems, or coding" />
            <QuickAction to="/app/resume" title="Analyze a resume" subtitle="Get seniority, gaps & ATS score" />
            <QuickAction to="/app/analytics" title="See your readiness" subtitle="Skill radar & confidence curve" />
          </div>
        </Card>
      </div>
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <Card className="border-border/60 bg-surface/60 p-5">
      <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <p className="mt-2 font-display text-3xl font-semibold tracking-tight">{value}</p>
      {hint ? <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p> : null}
    </Card>
  );
}

function QuickAction({ to, title, subtitle }: { to: string; title: string; subtitle: string }) {
  return (
    <Link
      to={to}
      className="group flex items-center justify-between rounded-lg border border-border/50 bg-background/60 p-3 text-sm transition hover:border-border hover:bg-surface-2"
    >
      <div>
        <p className="font-medium">{title}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
      </div>
      <ArrowRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-foreground" />
    </Link>
  );
}

function SkeletonList() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="h-10 animate-pulse rounded-md bg-surface-2/60" />
      ))}
    </div>
  );
}

export function EmptyState({
  title,
  body,
  cta,
}: {
  title: string;
  body: string;
  cta?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/60 px-6 py-12 text-center">
      <p className="text-sm font-medium">{title}</p>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{body}</p>
      {cta ? <div className="mt-4">{cta}</div> : null}
    </div>
  );
}
