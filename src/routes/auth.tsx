import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Wordmark } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const AuthSearch = z.object({ redirect: z.string().optional() });

export const Route = createFileRoute("/auth")({
  validateSearch: AuthSearch,
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { redirect } = useSearch({ from: "/auth" });
  const target = sanitizePath(redirect) ?? "/app";

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: target, replace: true });
    });
  }, [navigate, target]);

  return (
    <div className="relative min-h-dvh bg-background">
      <div className="pointer-events-none absolute inset-0 bg-aurora opacity-70" />
      <div className="pointer-events-none absolute inset-0 grid-bg" />
      <div className="relative mx-auto flex min-h-dvh max-w-md flex-col justify-center px-6 py-16">
        <Link to="/" aria-label="InterviAI home" className="mb-10 inline-flex">
          <Wordmark />
        </Link>
        <div className="rounded-2xl border border-border/70 bg-surface/80 p-6 shadow-elegant backdrop-blur">
          <h1 className="text-2xl font-semibold tracking-tight">Welcome to InterviAI</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Sign in to start your interview loop.
          </p>

          <GoogleButton target={target} />

          <div className="my-6 flex items-center gap-3 text-[11px] uppercase tracking-widest text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            or
            <span className="h-px flex-1 bg-border" />
          </div>

          <Tabs defaultValue="signin">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign in</TabsTrigger>
              <TabsTrigger value="signup">Create account</TabsTrigger>
            </TabsList>
            <TabsContent value="signin" className="mt-4">
              <EmailForm mode="signin" onDone={() => navigate({ to: target, replace: true })} />
            </TabsContent>
            <TabsContent value="signup" className="mt-4">
              <EmailForm mode="signup" onDone={() => navigate({ to: target, replace: true })} />
            </TabsContent>
          </Tabs>
        </div>
        <p className="mt-6 text-center text-xs text-muted-foreground">
          By continuing you agree to our terms of service and privacy policy.
        </p>
      </div>
    </div>
  );
}

function sanitizePath(input?: string): string | null {
  if (!input) return null;
  if (!input.startsWith("/") || input.startsWith("//")) return null;
  return input;
}

function GoogleButton({ target }: { target: string }) {
  const [loading, setLoading] = useState(false);
  return (
    <Button
      variant="outline"
      className="mt-6 w-full justify-center gap-2"
      disabled={loading}
      onClick={async () => {
        setLoading(true);
        try {
          if (target && target !== "/app") {
            sessionStorage.setItem("interviai:postAuthRedirect", target);
          }
          const result = await lovable.auth.signInWithOAuth("google", {
            redirect_uri: window.location.origin,
          });
          if (result.error) {
            toast.error("Google sign-in failed", { description: result.error.message });
            setLoading(false);
          }
        } catch (e) {
          toast.error("Google sign-in failed", {
            description: e instanceof Error ? e.message : String(e),
          });
          setLoading(false);
        }
      }}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden>
          <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.8 32.6 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C33.9 6 29.2 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.4-.4-3.5z"/>
          <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.9 19 13 24 13c3 0 5.8 1.1 7.9 3l5.7-5.7C33.9 7 29.2 5 24 5 16.3 5 9.7 9 6.3 14.7z"/>
          <path fill="#4CAF50" d="M24 43c5.1 0 9.7-1.9 13.2-5.1l-6.1-5c-2 1.4-4.5 2.1-7.1 2.1-5.3 0-9.7-3.4-11.3-8l-6.5 5C9.4 39 16.1 43 24 43z"/>
          <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.2 5.7l6.1 5c-.4.4 6.8-5 6.8-14.7 0-1.2-.1-2.4-.4-3.5z"/>
        </svg>
      )}
      Continue with Google
    </Button>
  );
}

function EmailForm({ mode, onDone }: { mode: "signin" | "signup"; onDone: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  return (
    <form
      className="space-y-3"
      onSubmit={async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
          if (mode === "signup") {
            const { error } = await supabase.auth.signUp({
              email,
              password,
              options: { emailRedirectTo: window.location.origin + "/app" },
            });
            if (error) throw error;
            toast.success("Account created", { description: "You're signed in." });
          } else {
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) throw error;
            toast.success("Welcome back");
          }
          onDone();
        } catch (err) {
          toast.error(mode === "signup" ? "Sign-up failed" : "Sign-in failed", {
            description: err instanceof Error ? err.message : String(err),
          });
        } finally {
          setLoading(false);
        }
      }}
    >
      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.com"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          minLength={6}
          autoComplete={mode === "signup" ? "new-password" : "current-password"}
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="At least 6 characters"
        />
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : mode === "signup" ? "Create account" : "Sign in"}
      </Button>
    </form>
  );
}
