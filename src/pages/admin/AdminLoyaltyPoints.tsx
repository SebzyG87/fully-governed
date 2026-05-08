import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Trophy, Plus, Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface PointsRow {
  id: string;
  user_id: string;
  points: number;
  reason: string;
  source: string;
  created_at: string;
  profiles?: { full_name: string; email: string };
}

interface Balance {
  user_id: string;
  full_name: string;
  email: string;
  total: number;
}

const AdminLoyaltyPoints = () => {
  const [search, setSearch] = useState("");
  const [adjUserId, setAdjUserId] = useState("");
  const [adjPoints, setAdjPoints] = useState("");
  const [adjReason, setAdjReason] = useState("");
  const [view, setView] = useState<"balances" | "history">("balances");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: history, isLoading } = useQuery({
    queryKey: ["admin_loyalty_points"],
    queryFn: async () => {
      const { data } = await supabase
        .from("fg_loyalty_points")
        .select("*, profiles(full_name, email)")
        .order("created_at", { ascending: false })
        .limit(200);
      return (data ?? []) as PointsRow[];
    },
  });

  const balances: Balance[] = Object.values(
    (history ?? []).reduce((acc: Record<string, Balance>, row) => {
      const uid = row.user_id;
      if (!acc[uid]) {
        acc[uid] = {
          user_id: uid,
          full_name: (row.profiles as any)?.full_name ?? "Unknown",
          email: (row.profiles as any)?.email ?? "",
          total: 0,
        };
      }
      acc[uid].total += row.points;
      return acc;
    }, {})
  ).sort((a, b) => b.total - a.total);

  const filtered = search
    ? balances.filter(b =>
        b.full_name.toLowerCase().includes(search.toLowerCase()) ||
        b.email.toLowerCase().includes(search.toLowerCase())
      )
    : balances;

  const adjustMutation = useMutation({
    mutationFn: async () => {
      const pts = parseInt(adjPoints);
      if (!adjUserId || isNaN(pts) || !adjReason) throw new Error("Fill all fields");
      const { error } = await supabase.from("fg_loyalty_points").insert({
        user_id: adjUserId,
        points: pts,
        reason: adjReason,
        source: "admin_adjustment",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Points adjusted" });
      setAdjUserId(""); setAdjPoints(""); setAdjReason("");
      queryClient.invalidateQueries({ queryKey: ["admin_loyalty_points"] });
    },
    onError: () => toast({ title: "Failed to adjust points", variant: "destructive" }),
  });

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex items-center gap-3">
        <Trophy className="w-6 h-6 text-primary" />
        <h1 className="font-bebas text-3xl tracking-wider text-foreground">LOYALTY POINTS</h1>
      </div>

      {/* Manual adjustment */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-4">
        <h2 className="font-bebas text-lg tracking-wider text-foreground">MANUAL ADJUSTMENT</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <Input placeholder="User ID (uuid)" value={adjUserId} onChange={e => setAdjUserId(e.target.value)} className="font-mono text-xs" />
          <Input placeholder="Points (negative to deduct)" type="number" value={adjPoints} onChange={e => setAdjPoints(e.target.value)} />
          <Input placeholder="Reason" value={adjReason} onChange={e => setAdjReason(e.target.value)} />
          <Button onClick={() => adjustMutation.mutate()} disabled={adjustMutation.isPending} className="font-bebas tracking-wider">
            {adjustMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Plus className="w-4 h-4 mr-1" />APPLY</>}
          </Button>
        </div>
      </div>

      {/* Toggle */}
      <div className="flex gap-2">
        <Button variant={view === "balances" ? "default" : "outline"} onClick={() => setView("balances")} className="font-bebas tracking-wider">BALANCES</Button>
        <Button variant={view === "history" ? "default" : "outline"} onClick={() => setView("history")} className="font-bebas tracking-wider">HISTORY</Button>
      </div>

      {view === "balances" && (
        <>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search members..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/30">
                  <th className="text-left p-3 font-bebas tracking-wider">Member</th>
                  <th className="text-right p-3 font-bebas tracking-wider">Points</th>
                  <th className="text-right p-3 font-bebas tracking-wider">Tier</th>
                </tr>
              </thead>
              <tbody className="font-barlow divide-y divide-border">
                {isLoading ? (
                  <tr><td colSpan={3} className="p-6 text-center text-muted-foreground">Loading...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={3} className="p-6 text-center text-muted-foreground">No data</td></tr>
                ) : filtered.map(b => {
                  const tier = b.total >= 2000 ? "PLATINUM MIC" : b.total >= 500 ? "GOLD MIC" : b.total >= 100 ? "SILVER MIC" : "MIC 1";
                  return (
                    <tr key={b.user_id} className="hover:bg-accent/20">
                      <td className="p-3">
                        <p className="text-foreground">{b.full_name}</p>
                        <p className="text-xs text-muted-foreground font-mono">{b.email}</p>
                      </td>
                      <td className="p-3 text-right font-mono text-primary font-bold">{b.total.toLocaleString()}</td>
                      <td className="p-3 text-right">
                        <span className="font-mono text-xs text-muted-foreground">{tier}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {view === "history" && (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/30">
                <th className="text-left p-3 font-bebas tracking-wider">Member</th>
                <th className="text-left p-3 font-bebas tracking-wider">Reason</th>
                <th className="text-right p-3 font-bebas tracking-wider">Points</th>
                <th className="text-right p-3 font-bebas tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="font-barlow divide-y divide-border">
              {isLoading ? (
                <tr><td colSpan={4} className="p-6 text-center text-muted-foreground">Loading...</td></tr>
              ) : (history ?? []).map(row => (
                <tr key={row.id} className="hover:bg-accent/20">
                  <td className="p-3 text-foreground font-mono text-xs">{(row.profiles as any)?.full_name ?? row.user_id.slice(0, 8)}</td>
                  <td className="p-3 text-muted-foreground">{row.reason}</td>
                  <td className={`p-3 text-right font-mono font-bold ${row.points >= 0 ? "text-primary" : "text-destructive"}`}>{row.points >= 0 ? "+" : ""}{row.points}</td>
                  <td className="p-3 text-right text-muted-foreground font-mono text-xs">{format(new Date(row.created_at), "dd MMM yyyy")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminLoyaltyPoints;
