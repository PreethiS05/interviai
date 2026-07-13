import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listThreads } from "@/lib/interviews.functions";
import { Card } from "@/components/ui/card";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from "recharts";

export const Route = createFileRoute("/_authenticated/app/analytics")({
  component: Analytics,
});

function Analytics() {
  const fetchThreads = useServerFn(listThreads);
  const threadsQ = useQuery({ queryKey: ["threads"], queryFn: () => fetchThreads() });
  const count = threadsQ.data?.length ?? 0;

  const radarData = [
    { skill: "Systems", value: 72 },
    { skill: "Coding", value: 68 },
    { skill: "Behavioral", value: 84 },
    { skill: "Communication", value: 79 },
    { skill: "Depth", value: 65 },
    { skill: "Clarity", value: 88 },
  ];

  const trend = Array.from({ length: 8 }).map((_, i) => ({
    week: `W${i + 1}`,
    confidence: 55 + Math.round(Math.sin(i / 2) * 8) + i * 3,
    depth: 50 + Math.round(Math.cos(i / 2) * 6) + i * 2,
  }));

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Analytics</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Readiness</h1>
        <p className="mt-1 text-muted-foreground">
          {count === 0
            ? "Signals will populate here as you interview."
            : "Trends from your recent sessions."}
        </p>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card className="border-border/60 bg-surface/60 p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Skill radar
          </h2>
          <div className="mt-4 h-72">
            <ResponsiveContainer>
              <RadarChart data={radarData}>
                <PolarGrid stroke="oklch(1 0 0 / 0.08)" />
                <PolarAngleAxis dataKey="skill" tick={{ fill: "oklch(0.7 0.02 265)", fontSize: 12 }} />
                <PolarRadiusAxis tick={{ fill: "oklch(0.5 0.02 265)", fontSize: 10 }} angle={30} domain={[0, 100]} />
                <Radar dataKey="value" stroke="oklch(0.72 0.19 285)" fill="oklch(0.72 0.19 285)" fillOpacity={0.35} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="border-border/60 bg-surface/60 p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Confidence & depth over time
          </h2>
          <div className="mt-4 h-72">
            <ResponsiveContainer>
              <LineChart data={trend}>
                <XAxis dataKey="week" stroke="oklch(0.5 0.02 265)" fontSize={12} />
                <YAxis stroke="oklch(0.5 0.02 265)" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    background: "oklch(0.185 0.014 265)",
                    border: "1px solid oklch(1 0 0 / 0.1)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Line type="monotone" dataKey="confidence" stroke="oklch(0.72 0.19 285)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="depth" stroke="oklch(0.75 0.16 155)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card className="mt-6 border-border/60 bg-surface/60 p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Company readiness
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {["Stripe", "Linear", "Vercel", "Ramp"].map((c, i) => {
            const value = [78, 71, 66, 82][i];
            return (
              <div key={c} className="rounded-lg border border-border/60 bg-background/60 p-4">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{c}</p>
                  <span className="font-mono text-sm text-foreground">{value}</span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-hairline">
                  <div className="h-full rounded-full bg-brand-gradient" style={{ width: `${value}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
