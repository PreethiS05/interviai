import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/app/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [headline, setHeadline] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) return;
      setEmail(data.user.email ?? "");
      const { data: p } = await supabase
        .from("profiles")
        .select("display_name, headline, target_role")
        .eq("id", data.user.id)
        .maybeSingle();
      if (p) {
        setDisplayName(p.display_name ?? "");
        setHeadline(p.headline ?? "");
        setTargetRole(p.target_role ?? "");
      }
      setLoading(false);
    })();
  }, []);

  async function save() {
    setSaving(true);
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return;
    const { error } = await supabase
      .from("profiles")
      .update({ display_name: displayName, headline, target_role: targetRole })
      .eq("id", u.user.id);
    setSaving(false);
    if (error) toast.error("Save failed", { description: error.message });
    else toast.success("Profile saved");
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Settings</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Profile</h1>
      </div>
      <Card className="mt-8 border-border/60 bg-surface/60 p-6">
        {loading ? (
          <div className="h-40 animate-pulse rounded-md bg-surface-2/60" />
        ) : (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input value={email} disabled />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="dn">Display name</Label>
              <Input id="dn" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="hl">Headline</Label>
              <Input
                id="hl"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="Senior Backend Engineer · fintech"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tr">Target role</Label>
              <Input
                id="tr"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="Staff engineer @ Stripe"
              />
            </div>
            <Button onClick={save} disabled={saving}>
              {saving ? "Saving…" : "Save changes"}
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
