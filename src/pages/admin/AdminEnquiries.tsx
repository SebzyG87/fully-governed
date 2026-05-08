import { useEffect, useState } from "react";
import { MessageSquare, ChevronDown, ChevronUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";

interface QuoteRequest {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  service: string;
  description: string | null;
  budget: string | null;
  timeline: string | null;
  referral_source: string | null;
  status: string;
  created_at: string;
}

const statusColors: Record<string, string> = {
  new: "bg-amber-500/20 text-amber-400",
  pending: "bg-amber-500/20 text-amber-400",
  "in progress": "bg-blue-500/20 text-blue-400",
  responded: "bg-emerald-500/20 text-emerald-400",
  closed: "bg-muted text-muted-foreground",
};

const statusOptions = ["new", "in progress", "responded", "closed"];
const filterOptions = ["all", "new", "in progress", "responded", "closed"];

const AdminEnquiries = () => {
  const { toast } = useToast();
  const [items, setItems] = useState<QuoteRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchData = async () => {
    const { data } = await supabase.from("quote_requests").select("*").order("created_at", { ascending: false });
    setItems((data as QuoteRequest[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("quote_requests").update({ status }).eq("id", id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: `Marked as ${status}` }); fetchData(); }
  };

  const filtered = items.filter(q => {
    if (filter === "all") return true;
    const s = q.status === "pending" ? "new" : q.status;
    return s === filter;
  });

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="font-bebas text-3xl text-foreground tracking-wider">ENQUIRIES</h1>
        <p className="text-sm text-muted-foreground font-barlow">{items.length} quote requests</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {filterOptions.map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1 rounded-full text-xs font-mono capitalize transition-colors ${filter === f ? "bg-interactive text-background" : "bg-card border border-border text-muted-foreground hover:text-foreground"}`}>
            {f === "all" ? `All (${items.length})` : `${f} (${items.filter(q => (q.status === "pending" ? "new" : q.status) === f).length})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-lg" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16"><MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" /><p className="text-muted-foreground">No enquiries found.</p></div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground font-mono text-xs">
                <th className="text-left py-3 px-2">Date</th>
                <th className="text-left py-3 px-2">Name</th>
                <th className="text-left py-3 px-2">Email</th>
                <th className="text-left py-3 px-2">Phone</th>
                <th className="text-left py-3 px-2">Service</th>
                <th className="text-left py-3 px-2">Budget</th>
                <th className="text-left py-3 px-2">Status</th>
                <th className="text-left py-3 px-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((q) => {
                const displayStatus = q.status === "pending" ? "new" : q.status;
                return (
                  <tr key={q.id} className="border-b border-border/50 hover:bg-accent/30 transition-colors cursor-pointer" onClick={() => setExpandedId(expandedId === q.id ? null : q.id)}>
                    <td className="py-3 px-2 font-mono text-foreground">{format(new Date(q.created_at), "d MMM yy")}</td>
                    <td className="py-3 px-2 text-foreground">{q.name}</td>
                    <td className="py-3 px-2 text-muted-foreground text-xs">{q.email}</td>
                    <td className="py-3 px-2 text-muted-foreground text-xs">{q.phone || "—"}</td>
                    <td className="py-3 px-2 text-primary font-mono text-xs">{q.service}</td>
                    <td className="py-3 px-2 text-muted-foreground text-xs">{q.budget || "—"}</td>
                    <td className="py-3 px-2">
                      <select
                        value={displayStatus}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => { e.stopPropagation(); updateStatus(q.id, e.target.value); }}
                        className="bg-background border border-border rounded px-2 py-1 text-xs font-mono text-foreground"
                      >
                        {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td className="py-3 px-2">
                      {expandedId === q.id ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {expandedId && (() => {
            const q = filtered.find(i => i.id === expandedId);
            if (!q) return null;
            return (
              <div className="bg-card border border-border rounded-lg p-4 mt-2 space-y-2 text-sm font-barlow">
                {q.description && <p><span className="text-muted-foreground">Description:</span> <span className="text-foreground">{q.description}</span></p>}
                {q.timeline && <p><span className="text-muted-foreground">Timeline:</span> {q.timeline}</p>}
                {q.referral_source && <p><span className="text-muted-foreground">Referral:</span> {q.referral_source}</p>}
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};

export default AdminEnquiries;
