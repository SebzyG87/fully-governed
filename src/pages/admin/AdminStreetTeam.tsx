import { useEffect, useState } from "react";
import { Users, CheckCircle, XCircle, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

interface Application {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  instagram: string | null;
  location: string | null;
  skills: string[] | null;
  reason: string | null;
  status: string;
  user_id: string | null;
  created_at: string;
}

interface Member {
  id: string;
  user_id: string;
  points: number;
  tier: string;
  joined_at: string;
  full_name: string;
}

const filterOptions = ["all", "pending", "approved", "rejected"];

const AdminStreetTeam = () => {
  const { toast } = useToast();
  const [apps, setApps] = useState<Application[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [pointsEdit, setPointsEdit] = useState<Record<string, string>>({});

  const fetchAll = async () => {
    const [appsRes, membersRes] = await Promise.all([
      supabase.from("street_team_applications").select("*").order("created_at", { ascending: false }),
      supabase.from("street_team_members").select("*").order("joined_at", { ascending: false }),
    ]);
    setApps((appsRes.data as Application[]) || []);

    const rawMembers = (membersRes.data || []) as any[];
    if (rawMembers.length > 0) {
      const userIds = rawMembers.map(m => m.user_id);
      const { data: profiles } = await supabase.from("profiles").select("user_id, full_name").in("user_id", userIds);
      const profileMap = new Map((profiles || []).map((p: any) => [p.user_id, p.full_name]));
      setMembers(rawMembers.map(m => ({ ...m, full_name: profileMap.get(m.user_id) || "Unknown" })));
    } else {
      setMembers([]);
    }
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const updateStatus = async (app: Application, status: string) => {
    const { error } = await supabase.from("street_team_applications").update({ status } as any).eq("id", app.id);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }

    if (status === "approved" && app.user_id) {
      await supabase.from("street_team_members").insert({ user_id: app.user_id } as any);
    }
    toast({ title: `Application ${status}` });
    fetchAll();
  };

  const adjustPoints = async (memberId: string, userId: string, currentPoints: number) => {
    const delta = parseInt(pointsEdit[memberId] || "0");
    if (!delta) return;
    const { error } = await supabase.from("street_team_members").update({ points: currentPoints + delta } as any).eq("id", memberId);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: `Points adjusted by ${delta > 0 ? "+" : ""}${delta}` }); setPointsEdit(prev => ({ ...prev, [memberId]: "" })); fetchAll(); }
  };

  const exportCSV = () => {
    const rows = filteredApps.map(a =>
      `"${a.full_name}","${a.email}","${a.phone || ""}","${a.location || ""}","${(a.skills || []).join("; ")}","${a.status}","${format(new Date(a.created_at), "yyyy-MM-dd")}"`
    );
    const csv = "Name,Email,Phone,Location,Skills,Status,Date\n" + rows.join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "street-team-applications.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  const filteredApps = apps.filter(a => filter === "all" || a.status === filter);
  const statusColor = (s: string) => s === "approved" ? "text-emerald-400" : s === "rejected" ? "text-destructive" : "text-amber-400";
  const tierColor = (t: string) => t === "gold" ? "text-primary" : t === "silver" ? "text-muted-foreground" : t === "platinum" ? "text-purple-400" : "text-amber-600";

  return (
    <div className="p-6 space-y-8">
      {/* Section A: Applications */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-bebas text-3xl text-foreground tracking-wider">STREET TEAM</h1>
            <p className="text-sm text-muted-foreground font-barlow">{apps.length} applications</p>
          </div>
          <Button variant="outline" size="sm" onClick={exportCSV} disabled={filteredApps.length === 0}><Download className="w-4 h-4 mr-1" />Export CSV</Button>
        </div>

        <div className="flex gap-2 flex-wrap">
          {filterOptions.map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1 rounded-full text-xs font-mono capitalize transition-colors ${filter === f ? "bg-interactive text-background" : "bg-card border border-border text-muted-foreground hover:text-foreground"}`}>
              {f === "all" ? `All (${apps.length})` : `${f} (${apps.filter(a => a.status === f).length})`}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-lg" />)}</div>
        ) : filteredApps.length === 0 ? (
          <div className="text-center py-12"><Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" /><p className="text-muted-foreground">No applications found.</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground font-mono text-xs">
                  <th className="text-left py-3 px-2">Date</th>
                  <th className="text-left py-3 px-2">Name</th>
                  <th className="text-left py-3 px-2">Email</th>
                  <th className="text-left py-3 px-2">Location</th>
                  <th className="text-left py-3 px-2">Skills</th>
                  <th className="text-left py-3 px-2">Status</th>
                  <th className="text-left py-3 px-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredApps.map((a) => (
                  <tr key={a.id} className="border-b border-border/50 hover:bg-accent/30 transition-colors">
                    <td className="py-3 px-2 font-mono text-foreground">{format(new Date(a.created_at), "d MMM yy")}</td>
                    <td className="py-3 px-2 text-foreground">{a.full_name}</td>
                    <td className="py-3 px-2 text-muted-foreground text-xs">{a.email}</td>
                    <td className="py-3 px-2 text-muted-foreground text-xs">{a.location || "—"}</td>
                    <td className="py-3 px-2 text-muted-foreground text-xs">{(a.skills || []).join(", ") || "—"}</td>
                    <td className="py-3 px-2"><span className={`text-xs font-mono capitalize ${statusColor(a.status)}`}>{a.status}</span></td>
                    <td className="py-3 px-2">
                      {a.status === "pending" && (
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => updateStatus(a, "approved")}><CheckCircle className="w-3 h-3 mr-1" />Approve</Button>
                          <Button size="sm" variant="destructive" onClick={() => updateStatus(a, "rejected")}><XCircle className="w-3 h-3 mr-1" />Reject</Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Section B: Active Members */}
      <div className="space-y-4">
        <h2 className="font-bebas text-2xl text-foreground tracking-wider">ACTIVE MEMBERS</h2>
        {members.length === 0 ? (
          <p className="text-muted-foreground text-sm">No active members yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground font-mono text-xs">
                  <th className="text-left py-3 px-2">Member</th>
                  <th className="text-left py-3 px-2">Points</th>
                  <th className="text-left py-3 px-2">Tier</th>
                  <th className="text-left py-3 px-2">Joined</th>
                  <th className="text-left py-3 px-2">Adjust Points</th>
                </tr>
              </thead>
              <tbody>
                {members.map((m) => (
                  <tr key={m.id} className="border-b border-border/50 hover:bg-accent/30 transition-colors">
                    <td className="py-3 px-2 text-foreground">{m.full_name}</td>
                    <td className="py-3 px-2 font-mono text-primary">{m.points}</td>
                    <td className="py-3 px-2"><span className={`text-xs font-mono capitalize ${tierColor(m.tier)}`}>{m.tier}</span></td>
                    <td className="py-3 px-2 font-mono text-muted-foreground">{format(new Date(m.joined_at), "d MMM yy")}</td>
                    <td className="py-3 px-2">
                      <div className="flex gap-1 items-center">
                        <Input type="number" value={pointsEdit[m.id] || ""} onChange={(e) => setPointsEdit(prev => ({ ...prev, [m.id]: e.target.value }))} placeholder="+/-" className="w-20 h-8 bg-background text-xs" />
                        <Button size="sm" variant="outline" className="h-8" onClick={() => adjustPoints(m.id, m.user_id, m.points)}>Save</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminStreetTeam;
