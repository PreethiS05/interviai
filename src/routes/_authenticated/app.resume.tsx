import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { analyzeResume, listResumes } from "@/lib/resume.functions";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, FileText, Sparkles, Upload } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

export const Route = createFileRoute("/_authenticated/app/resume")({
  component: ResumePage,
});

type Parsed = {
  summary?: string;
  seniority?: string;
  skills?: string[];
  strengths?: string[];
  gaps?: string[];
  achievements?: string[];
};

function ResumePage() {
  const analyzeFn = useServerFn(analyzeResume);
  const fetchResumes = useServerFn(listResumes);
  const qc = useQueryClient();

  const resumesQ = useQuery({ queryKey: ["resumes"], queryFn: () => fetchResumes() });

  const [filename, setFilename] = useState("resume.txt");
  const [text, setText] = useState("");

  const analyzeM = useMutation({
    mutationFn: () => analyzeFn({ data: { filename, rawText: text } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["resumes"] });
      toast.success("Resume analyzed");
      setText("");
    },
    onError: (e) => toast.error("Analysis failed", { description: (e as Error).message }),
  });

  async function onFileChange(file: File) {
    setFilename(file.name);
    if (file.type.startsWith("text/") || file.name.endsWith(".txt") || file.name.endsWith(".md")) {
      const t = await file.text();
      setText(t.slice(0, 30000));
    } else {
      toast.info("Paste your resume text below", {
        description: "PDF parsing runs on upload — for now, paste the plain text.",
      });
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Resume intelligence</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Analyze your resume</h1>
        <p className="mt-1 text-muted-foreground">
          Get seniority, strengths, gaps, and an ATS-compatibility score in seconds.
        </p>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_1fr]">
        <Card className="border-border/60 bg-surface/60 p-6">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="fname">Filename</Label>
              <Input id="fname" value={filename} onChange={(e) => setFilename(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="rtext">Resume text</Label>
              <label
                htmlFor="file"
                className="flex cursor-pointer items-center justify-between rounded-lg border border-dashed border-border/60 bg-background/40 px-4 py-3 text-sm text-muted-foreground transition hover:bg-surface-2"
              >
                <span className="flex items-center gap-2">
                  <Upload className="h-4 w-4" /> Upload .txt / .md, or paste below
                </span>
                <input
                  id="file"
                  type="file"
                  accept=".txt,.md,text/plain"
                  className="sr-only"
                  onChange={(e) => e.target.files?.[0] && onFileChange(e.target.files[0])}
                />
              </label>
              <Textarea
                id="rtext"
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={14}
                placeholder="Paste your resume here…"
                className="font-mono text-xs"
              />
            </div>
            <Button
              onClick={() => analyzeM.mutate()}
              disabled={analyzeM.isPending || text.trim().length < 50}
              className="w-full"
            >
              {analyzeM.isPending ? (
                <><Loader2 className="mr-1 h-4 w-4 animate-spin" /> Analyzing…</>
              ) : (
                <><Sparkles className="mr-1 h-4 w-4" /> Analyze resume</>
              )}
            </Button>
          </div>
        </Card>

        <Card className="border-border/60 bg-surface/60 p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Latest analyses
          </h2>
          {resumesQ.isLoading ? (
            <div className="mt-4 h-40 animate-pulse rounded-lg bg-surface-2/60" />
          ) : (resumesQ.data ?? []).length === 0 ? (
            <div className="mt-6 flex flex-col items-center justify-center rounded-xl border border-dashed border-border/60 px-6 py-10 text-center">
              <FileText className="h-6 w-6 text-muted-foreground" />
              <p className="mt-3 text-sm font-medium">No resumes analyzed yet</p>
              <p className="mt-1 max-w-sm text-xs text-muted-foreground">
                Paste your resume on the left and hit Analyze. Results appear here.
              </p>
            </div>
          ) : (
            <div className="mt-4 space-y-4">
              {(resumesQ.data ?? []).map((r) => {
                const p = (r.parsed ?? {}) as Parsed;
                return (
                  <div key={r.id} className="rounded-xl border border-border/60 bg-background/60 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium">{r.filename}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(r.created_at), { addSuffix: true })} · {p.seniority ?? "—"}
                        </p>
                      </div>
                      <AtsScore score={r.ats_score ?? 0} />
                    </div>
                    {p.summary && (
                      <p className="mt-3 text-sm text-foreground/90">{p.summary}</p>
                    )}
                    {p.skills && p.skills.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {p.skills.slice(0, 12).map((s) => (
                          <Badge key={s} variant="secondary" className="rounded-full font-normal">
                            {s}
                          </Badge>
                        ))}
                      </div>
                    )}
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      <ListBlock title="Strengths" items={p.strengths} tone="success" />
                      <ListBlock title="Gaps" items={p.gaps} tone="warning" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function AtsScore({ score }: { score: number }) {
  const color =
    score >= 80 ? "text-success" : score >= 60 ? "text-warning" : "text-destructive";
  return (
    <div className="text-right">
      <p className={`font-display text-3xl font-semibold tabular-nums ${color}`}>{score}</p>
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground">ATS score</p>
    </div>
  );
}

function ListBlock({
  title,
  items,
  tone,
}: {
  title: string;
  items?: string[];
  tone: "success" | "warning";
}) {
  if (!items || items.length === 0) return null;
  const dot = tone === "success" ? "bg-success" : "bg-warning";
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{title}</p>
      <ul className="mt-1.5 space-y-1 text-xs text-foreground/90">
        {items.slice(0, 4).map((s) => (
          <li key={s} className="flex items-start gap-2">
            <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${dot}`} />
            <span>{s}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
