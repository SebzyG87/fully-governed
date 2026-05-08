import { useEffect, useState } from "react";
import { Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

interface EmailLog {
  id: string;
  recipient_email: string;
  subject: string;
  template: string | null;
  status: string;
  created_at: string;
}

const filterOptions = ["all", "sent", "failed"];

const AdminEmailLog = () => {
  const [logs, setLogs] = useState<EmailLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    supabase.from("email_logs").select("*").order("created_at", { ascending: false }).limit(200)
      .then(({ data }) => { setLogs((data as EmailLog[]) || []); setLoading(false); });
  }, []);

  const filtered = logs.filter(l => filter === "all" || l.status === filter);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="font-bebas text-3xl text-foreground tracking-wider">EMAIL LOG</h1>
        <p className="text-sm text-muted-foreground font-barlow">{logs.length} emails tracked</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {filterOptions.map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1 rounded-full text-xs font-mono capitalize transition-colors ${filter === f ? "bg-interactive text-background" : "bg-card border border-border text-muted-foreground hover:text-foreground"}`}>
            {f === "all" ? `All (${logs.length})` : `${f} (${logs.filter(l => l.status === f).length})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-lg" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16"><Mail className="w-12 h-12 text-muted-foreground mx-auto mb-4" /><p className="text-muted-foreground">No emails found.</p></div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground font-mono text-xs">
                <th className="text-left py-3 px-2">Date</th>
                <th className="text-left py-3 px-2">Recipient</th>
                <th className="text-left py-3 px-2">Subject</th>
                <th className="text-left py-3 px-2">Template</th>
                <th className="text-left py-3 px-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((l) => (
                <tr key={l.id} className="border-b border-border/50 hover:bg-accent/30 transition-colors">
                  <td className="py-3 px-2 font-mono text-muted-foreground">{format(new Date(l.created_at), "d MMM yy HH:mm")}</td>
                  <td className="py-3 px-2 text-foreground">{l.recipient_email}</td>
                  <td className="py-3 px-2 text-foreground">{l.subject}</td>
                  <td className="py-3 px-2 text-muted-foreground text-xs">{l.template || "—"}</td>
                  <td className="py-3 px-2"><span className={`text-xs font-mono ${l.status === "sent" ? "text-emerald-400" : "text-destructive"}`}>{l.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminEmailLog;
