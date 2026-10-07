import { useEffect, useState } from "react";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface BanRow {
  id: string;
  person_name: string;
  person_type: string;
  risk_status: string;
  ban_status: string;
  review_status: string;
  reason: string;
  required_action: string | null;
  created_at: string;
}

export default function AdminBans() {
  const { toast } = useToast();
  const [rows, setRows] = useState<BanRow[]>([]);

  const loadRows = async () => {
    const { data } = await supabase
      .from("fg_ban_registry" as any)
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    setRows((data as BanRow[]) || []);
  };

  useEffect(() => {
    loadRows();
  }, []);

  const updateReview = async (id: string, review_status: string, ban_status?: string) => {
    const { error } = await supabase
      .from("fg_ban_registry" as any)
      .update({ review_status, ...(ban_status ? { ban_status } : {}), reviewed_at: new Date().toISOString() })
      .eq("id", id);
    if (error) {
      toast({ title: "Review update failed", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Review updated" });
    loadRows();
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-4xl text-foreground">BANS & RISK REVIEW</h1>
        <p className="text-muted-foreground font-barlow text-sm">Management review workflow for flagged clients, guests and groups.</p>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-10 text-center">
          <ShieldAlert className="mx-auto h-10 w-10 text-primary" />
          <p className="mt-3 text-sm text-muted-foreground">No risk records found.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {rows.map((row) => (
            <article key={row.id} className="rounded-lg border border-border bg-card/55 p-5">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">{row.person_type} · {row.risk_status}</p>
                  <h2 className="font-bebas text-2xl tracking-wide text-foreground">{row.person_name}</h2>
                  <p className="text-xs text-muted-foreground">Ban: {row.ban_status} · Review: {row.review_status}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={() => updateReview(row.id, "approved", row.risk_status === "red" ? "banned" : row.ban_status)} className="font-mono text-xs">approve</Button>
                  <Button size="sm" variant="outline" onClick={() => updateReview(row.id, "needs_more_info")} className="font-mono text-xs">more info</Button>
                  <Button size="sm" variant="outline" onClick={() => updateReview(row.id, "rejected", "watch")} className="font-mono text-xs">reject</Button>
                  <Button size="sm" variant="outline" onClick={() => updateReview(row.id, "approved", "lifted")} className="font-mono text-xs">lift</Button>
                </div>
              </div>
              <p className="mt-4 rounded-md border border-border bg-background/45 p-3 text-sm text-muted-foreground">{row.reason}</p>
              {row.required_action ? <p className="mt-2 text-xs text-foreground">Action: {row.required_action}</p> : null}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
