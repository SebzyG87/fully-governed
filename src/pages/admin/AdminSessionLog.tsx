import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FileText, Download, Plus, Save, X, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface LogEntry {
  id: string;
  session_date: string;
  start_time: string | null;
  end_time: string | null;
  session_type: string | null;
  member_name: string | null;
  duration_hours: number | null;
  guests: number;
  engineer: string | null;
  notes: string | null;
  admin_notes: string | null;
  revenue: number;
  status: string;
  booking_id: string | null;
}

interface RatingInfo {
  booking_id: string;
  rating: number;
  comment: string | null;
}

const AdminSessionLog = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [ratings, setRatings] = useState<Map<string, RatingInfo>>(new Map());
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [memberName, setMemberName] = useState("");
  const [sessionDate, setSessionDate] = useState("");
  const [sessionType, setSessionType] = useState("");
  const [duration, setDuration] = useState("");
  const [revenue, setRevenue] = useState("0");
  const { toast } = useToast();

  const fetchLogs = async () => {
    const { data } = await supabase.from("session_logs").select("*").order("session_date", { ascending: false }).limit(200);
    const logData = (data as LogEntry[]) || [];
    setLogs(logData);

    // Fetch ratings for logs that have booking_ids
    const bookingIds = logData.map(l => l.booking_id).filter(Boolean) as string[];
    if (bookingIds.length > 0) {
      const { data: ratingData } = await (supabase.from("session_ratings").select("booking_id, rating, comment").in("booking_id", bookingIds) as any);
      const rMap = new Map<string, RatingInfo>();
      (ratingData || []).forEach((r: RatingInfo) => rMap.set(r.booking_id, r));
      setRatings(rMap);
    }
    setLoading(false);
  };

  useEffect(() => { fetchLogs(); }, []);

  const handleAdd = async () => {
    if (!memberName || !sessionDate) return;
    const { error } = await supabase.from("session_logs").insert({
      member_name: memberName,
      session_date: sessionDate,
      session_type: sessionType || null,
      duration_hours: parseFloat(duration) || null,
      revenue: parseFloat(revenue) || 0,
    });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Log entry added" });
      setMemberName(""); setSessionDate(""); setSessionType(""); setDuration(""); setRevenue("0"); setShowAdd(false);
      fetchLogs();
    }
  };

  const handleExport = () => {
    const csv = [
      "Date,Member,Type,Duration,Revenue,Status,Rating",
      ...logs.map(l => {
        const r = l.booking_id ? ratings.get(l.booking_id) : undefined;
        return `${l.session_date},${l.member_name || ""},${l.session_type || ""},${l.duration_hours || ""},${l.revenue},${l.status},${r ? r.rating : ""}`;
      })
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `session-log-${format(new Date(), "yyyy-MM-dd")}.csv`; a.click();
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl text-foreground">SESSION LOG</h1>
          <p className="text-muted-foreground font-barlow text-sm">{logs.length} entries</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExport} className="font-barlow"><Download className="w-4 h-4 mr-1" /> CSV</Button>
          <Button size="sm" onClick={() => setShowAdd(!showAdd)} className="font-bebas tracking-wider"><Plus className="w-4 h-4 mr-1" /> ADD ENTRY</Button>
        </div>
      </motion.div>

      {showAdd && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card border border-border rounded-lg p-4 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <Label className="text-muted-foreground text-xs">Member Name</Label>
              <Input value={memberName} onChange={(e) => setMemberName(e.target.value)} className="mt-1 bg-background" />
            </div>
            <div>
              <Label className="text-muted-foreground text-xs">Date</Label>
              <Input type="date" value={sessionDate} onChange={(e) => setSessionDate(e.target.value)} className="mt-1 bg-background" />
            </div>
            <div>
              <Label className="text-muted-foreground text-xs">Session Type</Label>
              <Input value={sessionType} onChange={(e) => setSessionType(e.target.value)} className="mt-1 bg-background" />
            </div>
            <div>
              <Label className="text-muted-foreground text-xs">Duration (hrs)</Label>
              <Input type="number" value={duration} onChange={(e) => setDuration(e.target.value)} className="mt-1 bg-background" />
            </div>
            <div>
              <Label className="text-muted-foreground text-xs">Revenue (£)</Label>
              <Input type="number" value={revenue} onChange={(e) => setRevenue(e.target.value)} className="mt-1 bg-background" />
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleAdd} className="font-bebas tracking-wider"><Save className="w-4 h-4 mr-1" /> SAVE</Button>
            <Button size="sm" variant="ghost" onClick={() => setShowAdd(false)}><X className="w-4 h-4" /></Button>
          </div>
        </motion.div>
      )}

      {loading ? (
        <div className="flex justify-center py-12"><FileText className="w-6 h-6 text-primary animate-pulse" /></div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground font-mono text-xs">
                <th className="text-left py-3 px-2">Date</th>
                <th className="text-left py-3 px-2">Member</th>
                <th className="text-left py-3 px-2">Type</th>
                <th className="text-left py-3 px-2">Duration</th>
                <th className="text-left py-3 px-2">Revenue</th>
                <th className="text-left py-3 px-2">Rating</th>
                <th className="text-left py-3 px-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((l) => {
                const rating = l.booking_id ? ratings.get(l.booking_id) : undefined;
                return (
                  <tr key={l.id} className="border-b border-border/50 hover:bg-accent/30 transition-colors">
                    <td className="py-3 px-2 font-mono text-foreground">{l.session_date}</td>
                    <td className="py-3 px-2 text-foreground">{l.member_name || "—"}</td>
                    <td className="py-3 px-2 text-muted-foreground">{l.session_type || "—"}</td>
                    <td className="py-3 px-2 font-mono text-muted-foreground">{l.duration_hours ? `${l.duration_hours}h` : "—"}</td>
                    <td className="py-3 px-2 font-mono text-primary">£{Number(l.revenue).toFixed(2)}</td>
                    <td className="py-3 px-2">
                      {rating ? (
                        <Tooltip>
                          <TooltipTrigger>
                            <span className="flex items-center gap-1 text-primary">
                              {Array.from({ length: rating.rating }).map((_, i) => (
                                <Star key={i} className="w-3 h-3 fill-primary" />
                              ))}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-sm">{rating.comment || "No comment"}</p>
                          </TooltipContent>
                        </Tooltip>
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </td>
                    <td className="py-3 px-2"><span className="text-xs font-mono px-2 py-0.5 rounded bg-secondary text-secondary-foreground capitalize">{l.status}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminSessionLog;
