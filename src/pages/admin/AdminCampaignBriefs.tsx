import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface CampaignBriefRow {
  id: string;
  brief_type: string;
  contact_name: string;
  contact_email: string;
  project_name: string | null;
  goal: string;
  budget_range: string | null;
  timeline: string | null;
  platforms: string[];
  services: string[];
  status: string;
  created_at: string;
}

export default function AdminCampaignBriefs() {
  const { toast } = useToast();
  const [briefs, setBriefs] = useState<CampaignBriefRow[]>([]);

  const loadBriefs = async () => {
    const { data } = await supabase
      .from("fg_campaign_briefs" as any)
      .select("*")
      .order("created_at", { ascending: false });
    setBriefs((data as CampaignBriefRow[]) || []);
  };

  useEffect(() => {
    loadBriefs();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("fg_campaign_briefs" as any).update({ status }).eq("id", id);
    if (error) {
      toast({ title: "Status update failed", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Brief updated" });
    loadBriefs();
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-4xl text-foreground">CAMPAIGN BRIEFS</h1>
        <p className="text-muted-foreground font-barlow text-sm">Review Artist Development, Creative Services, Business Growth and campaign submissions.</p>
      </div>

      {briefs.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-10 text-center">
          <Inbox className="mx-auto h-10 w-10 text-primary" />
          <p className="mt-3 text-sm text-muted-foreground">No campaign briefs found.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {briefs.map((brief) => (
            <article key={brief.id} className="rounded-lg border border-border bg-card/55 p-5">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">{brief.brief_type.replace(/_/g, " ")}</p>
                  <h2 className="font-bebas text-2xl tracking-wide text-foreground">{brief.project_name || brief.contact_name}</h2>
                  <p className="text-xs text-muted-foreground">{brief.contact_name} · {brief.contact_email} · {format(new Date(brief.created_at), "d MMM yyyy HH:mm")}</p>
                </div>
                <div className="flex gap-2">
                  {["reviewing", "quoted", "approved", "archived"].map((status) => (
                    <Button key={status} size="sm" variant={brief.status === status ? "default" : "outline"} onClick={() => updateStatus(brief.id, status)} className="font-mono text-xs">
                      {status}
                    </Button>
                  ))}
                </div>
              </div>

              <p className="mt-4 rounded-md border border-border bg-background/45 p-3 text-sm text-muted-foreground">{brief.goal}</p>
              <div className="mt-4 grid gap-3 md:grid-cols-4 text-xs">
                <div><span className="text-muted-foreground">Budget:</span> <span className="text-foreground">{brief.budget_range || "Not set"}</span></div>
                <div><span className="text-muted-foreground">Timeline:</span> <span className="text-foreground">{brief.timeline || "Not set"}</span></div>
                <div><span className="text-muted-foreground">Services:</span> <span className="text-foreground">{brief.services?.join(", ") || "None selected"}</span></div>
                <div><span className="text-muted-foreground">Platforms:</span> <span className="text-foreground">{brief.platforms?.join(", ") || "None selected"}</span></div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
