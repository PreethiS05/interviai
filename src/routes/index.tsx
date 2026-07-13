import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles, Brain, FileText, LineChart, Command, Zap, Shield } from "lucide-react";
import { Wordmark } from "@/components/brand";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <Header />
      <Hero />
      <LogoStrip />
      <Features />
      <InterviewShowcase />
      <Metrics />
      <CTA />
      <Footer />
    </div>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        <Link to="/" aria-label="InterviAI home">
          <Wordmark />
        </Link>
        <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
          <a href="#features" className="transition hover:text-foreground">Product</a>
          <a href="#interview" className="transition hover:text-foreground">Interview</a>
          <a href="#metrics" className="transition hover:text-foreground">Signals</a>
        </nav>
        <div className="flex items-center gap-2">
          <Link
            to="/auth"
            className="hidden text-sm text-muted-foreground transition hover:text-foreground sm:inline"
          >
            Sign in
          </Link>
          <Button asChild size="sm" className="rounded-full">
            <Link to="/auth">
              Get started
              <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-aurora" />
      <div className="pointer-events-none absolute inset-0 grid-bg" />
      <div className="relative mx-auto max-w-6xl px-6 pb-24 pt-20 sm:pt-28">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-surface/60 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-brand shadow-[0_0_10px_var(--brand)]" />
            Now with Gemini 3 · streaming voice-of-interviewer
          </span>
          <h1 className="mt-6 text-balance text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl md:text-7xl">
            The interview loop,{" "}
            <span className="text-brand-gradient">rehearsed until it's yours</span>.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-balance text-lg text-muted-foreground">
            InterviAI runs realistic mock interviews with a conversational AI, reviews your resume
            like a staff engineer, and tracks readiness across the roles you're actually targeting.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg" className="rounded-full px-6">
              <Link to="/auth">
                Start interviewing free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <a
              href="#interview"
              className="inline-flex items-center gap-2 rounded-full border border-border/70 px-5 py-2.5 text-sm text-foreground/90 transition hover:bg-surface"
            >
              <Command className="h-3.5 w-3.5" /> See a live session
            </a>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            No credit card. Sign in with Google in one click.
          </p>
        </div>

        <div className="relative mx-auto mt-16 max-w-5xl">
          <div className="rounded-2xl border border-border/70 bg-surface/80 p-2 shadow-elegant backdrop-blur">
            <div className="rounded-xl border border-border/60 bg-background/70 p-6">
              <MockConversation />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function MockConversation() {
  return (
    <div className="grid gap-4 text-sm sm:grid-cols-[1fr_320px]">
      <div className="space-y-4">
        <Bubble role="assistant" name="Nova · AI Interviewer">
          Let's dig into your last system design. You mentioned reducing p99 latency by 40% —
          walk me through the actual bottleneck before you touched anything.
        </Bubble>
        <Bubble role="user" name="You">
          It was tail latency in the fan-out to our recommendation service. We were doing
          synchronous joins across three shards.
        </Bubble>
        <Bubble role="assistant" name="Nova · AI Interviewer">
          Good. Before we jump to the fix — how did you rule out network vs. serialization vs. GC
          as the primary contributor?
        </Bubble>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-brand" />
          </span>
          Nova is thinking…
        </div>
      </div>
      <aside className="space-y-3 rounded-lg border border-border/60 bg-surface/60 p-4 text-xs">
        <div className="flex items-center justify-between text-muted-foreground">
          <span>Live signals</span>
          <span className="rounded-full bg-success/10 px-2 py-0.5 text-success">On track</span>
        </div>
        <Signal label="Clarity" value={82} />
        <Signal label="Technical depth" value={71} />
        <Signal label="Structured thinking" value={88} />
        <Signal label="Confidence" value={64} />
      </aside>
    </div>
  );
}

function Bubble({
  role,
  name,
  children,
}: {
  role: "user" | "assistant";
  name: string;
  children: React.ReactNode;
}) {
  const isUser = role === "user";
  return (
    <div className={isUser ? "flex justify-end" : "flex"}>
      <div className="max-w-[92%]">
        <p className="mb-1 text-[11px] uppercase tracking-wider text-muted-foreground">{name}</p>
        <div
          className={
            isUser
              ? "rounded-2xl rounded-tr-sm bg-primary px-4 py-3 text-primary-foreground"
              : "rounded-2xl rounded-tl-sm border border-border/60 bg-surface-2 px-4 py-3 text-foreground"
          }
        >
          {children}
        </div>
      </div>
    </div>
  );
}

function Signal({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-muted-foreground">
        <span>{label}</span>
        <span className="font-mono text-foreground">{value}</span>
      </div>
      <div className="h-1 overflow-hidden rounded-full bg-hairline">
        <div
          className="h-full rounded-full bg-brand-gradient"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

function LogoStrip() {
  const companies = ["Stripe", "Ramp", "Linear", "Vercel", "Notion", "OpenAI", "Anthropic"];
  return (
    <section className="border-y border-border/60 bg-background/60 py-8">
      <div className="mx-auto max-w-6xl px-6">
        <p className="text-center text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Practice for the loops that actually matter
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-lg font-semibold text-muted-foreground/70">
          {companies.map((c) => (
            <span key={c} className="tracking-tight">
              {c}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function Features() {
  const items = [
    {
      icon: Brain,
      title: "Conversational AI interviewer",
      body:
        "Nova asks one focused question at a time, follows up on your answers, and adapts difficulty to signal — not a script.",
    },
    {
      icon: FileText,
      title: "Resume intelligence",
      body:
        "Upload once. Get seniority, strengths, gaps, measurable wins, and an ATS score you can act on.",
    },
    {
      icon: LineChart,
      title: "Readiness analytics",
      body:
        "Weekly readiness by company, skill radar, and a confidence curve so you know what to drill next.",
    },
    {
      icon: Zap,
      title: "Sub-300ms streaming",
      body: "Tokens land as fast as the model can produce them. No spinners, no dead air.",
    },
    {
      icon: Shield,
      title: "Private by default",
      body: "Row-level security, encrypted at rest, and never used to train third-party models.",
    },
    {
      icon: Sparkles,
      title: "Coding, systems, behavioral",
      body: "Three tracks in one workspace — with the same interviewer style you'll meet on-site.",
    },
  ];
  return (
    <section id="features" className="border-b border-border/60 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="max-w-2xl">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Product
          </p>
          <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            Everything a great interviewer does. Nothing you don't need.
          </h2>
        </div>
        <div className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-border/60 bg-hairline sm:grid-cols-2 lg:grid-cols-3">
          {items.map((it) => (
            <div key={it.title} className="bg-background p-8 transition hover:bg-surface">
              <it.icon className="h-5 w-5 text-brand" />
              <h3 className="mt-4 text-base font-semibold tracking-tight">{it.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{it.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function InterviewShowcase() {
  return (
    <section id="interview" className="relative border-b border-border/60 py-24">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-aurora opacity-40" />
      <div className="relative mx-auto grid max-w-6xl gap-12 px-6 lg:grid-cols-2 lg:items-center">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
            The session
          </p>
          <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            A real conversation — not a question bank.
          </h2>
          <p className="mt-4 text-muted-foreground">
            Every session references your resume, adapts to your prior answers, and interrupts when
            you're vague. When you're done, you get a structured debrief with the exact moments
            that moved the needle.
          </p>
          <ul className="mt-6 space-y-3 text-sm">
            {[
              "Follow-ups that reference your specific claims",
              "Difficulty that rises when you're on it",
              "Optional time pressure and interviewer personalities",
              "Transcript with per-moment feedback",
            ].map((f) => (
              <li key={f} className="flex items-start gap-3">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-brand" />
                <span className="text-foreground/90">{f}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border border-border/70 bg-surface/60 p-2 shadow-elegant">
          <div className="rounded-xl border border-border/60 bg-background/60 p-6">
            <MockConversation />
          </div>
        </div>
      </div>
    </section>
  );
}

function Metrics() {
  const stats = [
    { k: "3.2×", v: "faster prep vs. self-study" },
    { k: "94%", v: "of users report reduced anxiety" },
    { k: "<300ms", v: "streaming latency to first token" },
    { k: "SOC-ready", v: "RLS, encryption at rest" },
  ];
  return (
    <section id="metrics" className="border-b border-border/60 py-24">
      <div className="mx-auto grid max-w-6xl gap-px overflow-hidden rounded-2xl border border-border/60 bg-hairline px-0 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.k} className="bg-background p-8">
            <p className="font-display text-4xl font-semibold tracking-tight text-brand-gradient">
              {s.k}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">{s.v}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-4xl px-6">
        <div className="relative overflow-hidden rounded-3xl border border-border/70 bg-surface/70 p-10 text-center shadow-elegant sm:p-16">
          <div className="pointer-events-none absolute inset-0 bg-aurora opacity-70" />
          <div className="relative">
            <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
              Your next offer starts with your next practice loop.
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
              Join engineers preparing for their staff-level, new-grad, and switcher interviews.
            </p>
            <Button asChild size="lg" className="mt-6 rounded-full px-6">
              <Link to="/auth">
                Start free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border/60 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 text-xs text-muted-foreground sm:flex-row">
        <Wordmark />
        <p>© {new Date().getFullYear()} InterviAI. Built for engineers.</p>
      </div>
    </footer>
  );
}
