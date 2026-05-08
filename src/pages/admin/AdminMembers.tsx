import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, Search, X, ChevronUp, ChevronDown, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface MemberRow {
  user_id: string;
  full_name: string;
  phone: string | null;
  loyalty_points: number;
  created_at: string;
  role: string | null;
  total_sessions: number;
  total_revenue: number;
}

const AdminMembers = () => {
  const [members, setMembers] = useState<MemberRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [notesModal, setNotesModal] = useState<{ userId: string; name: string } | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const { toast } = useToast();

  const fetchMembers = async () => {
    const { data: profiles } = await supabase.from("profiles").select("user_id, full_name, phone, loyalty_points, created_at");
    const { data: roles } = await supabase.from("user_roles").select("user_id, role");
    const { data: bookingCounts } = await supabase.from("bookings").select("user_id");
    const { data: ledgerEntries } = await supabase.from("wallet_ledger").select("user_id, amount");
    
    const roleMap = new Map((roles || []).map(r => [r.user_id, r.role as string]));

    const sessionCounts = new Map<string, number>();
    (bookingCounts || []).forEach(b => {
      if (!b.user_id) return;
      sessionCounts.set(b.user_id, (sessionCounts.get(b.user_id) || 0) + 1);
    });

    const revenueStats = new Map<string, number>();
    (ledgerEntries || []).forEach(l => {
      if (!l.user_id || l.amount <= 0) return;
      revenueStats.set(l.user_id, (revenueStats.get(l.user_id) || 0) + Number(l.amount));
    });

    setMembers((profiles || []).map(p => ({
      ...p,
      role: roleMap.get(p.user_id) || null,
      total_sessions: sessionCounts.get(p.user_id) || 0,
      total_revenue: revenueStats.get(p.user_id) || 0,
    })));
    setLoading(false);
  };

  useEffect(() => { fetchMembers(); }, []);

  const adjustPoints = async (userId: string, delta: number) => {
    const member = members.find(m => m.user_id === userId);
    if (!member) return;
    const newPoints = Math.max(0, member.loyalty_points + delta);
    const { error } = await supabase.from("profiles").update({ loyalty_points: newPoints }).eq("user_id", userId);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: `${delta > 0 ? "Added" : "Deducted"} ${Math.abs(delta)} points` });
      fetchMembers();
    }
  };

  const toggleRole = async (userId: string, currentRole: string | null) => {
    let newRole: string;
    if (currentRole === "customer" || !currentRole) newRole = "family";
    else if (currentRole === "family") newRole = "creator_admin";
    else newRole = "customer";

    const { error } = await supabase.from("user_roles").upsert({ user_id: userId, role: newRole as any }, { onConflict: "user_id" });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: `Tier updated to ${newRole}` });
      fetchMembers();
    }
  };

  const filtered = members.filter(m => !search || m.full_name.toLowerCase().includes(search.toLowerCase()));
  const adminCount = members.filter(m => m.role === "creator_admin").length;
  const familyCount = members.filter(m => m.role === "family").length;
  const customerCount = members.filter(m => m.role === "customer").length;
  const thisMonthCount = members.filter(m => {
    const d = new Date(m.created_at);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-4xl text-foreground">MEMBERS</h1>
        <p className="text-muted-foreground font-barlow text-sm">
          {members.length} total · 🛡️ {adminCount} Admin · 👑 {familyCount} Family · 🎤 {customerCount} Customer · 🆕 {thisMonthCount} this month
        </p>
      </motion.div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search members..." className="pl-10 bg-card" />
        {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-interactive"><X className="w-4 h-4" /></button>}
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Users className="w-6 h-6 text-primary animate-pulse" /></div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground font-mono text-xs">
                <th className="text-left py-3 px-2">Name</th>
                <th className="text-left py-3 px-2">Phone</th>
                <th className="text-left py-3 px-2">Tier</th>
                <th className="text-left py-3 px-2">Joined</th>
                <th className="text-left py-3 px-2">Points</th>
                <th className="text-left py-3 px-2">Sessions</th>
                <th className="text-left py-3 px-2">Revenue</th>
                <th className="text-left py-3 px-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((m) => (
                <tr key={m.user_id} className="border-b border-border/50 hover:bg-accent/30 transition-colors">
                  <td className="py-3 px-2 text-foreground">{m.full_name}</td>
                  <td className="py-3 px-2 text-muted-foreground font-mono text-xs">{m.phone || "—"}</td>
                  <td className="py-3 px-2">
                    <button 
                      onClick={() => toggleRole(m.user_id, m.role)} 
                      className="text-xs font-mono px-2 py-0.5 rounded hover:opacity-80 transition-opacity cursor-pointer flex items-center gap-1"
                      style={{ 
                        background: m.role === "creator_admin" ? "hsl(var(--primary) / 0.2)" : 
                                   m.role === "family" ? "hsl(283 58% 50% / 0.2)" : 
                                   "hsl(215.4 16.3% 46.9% / 0.2)", 
                        color: m.role === "creator_admin" ? "hsl(var(--primary))" : 
                               m.role === "family" ? "hsl(283 58% 50%)" : 
                               "hsl(var(--muted-foreground))" 
                      }}
                    >
                      {m.role === "creator_admin" ? "🛡️ Admin" : m.role === "family" ? "👑 Family" : "🎤 Customer"}
                    </button>
                  </td>
                  <td className="py-3 px-2 text-muted-foreground font-mono text-xs">{format(new Date(m.created_at), "d MMM yy")}</td>
                  <td className="py-3 px-2 font-mono text-foreground">{Math.max(0, m.loyalty_points)}</td>
                  <td className="py-3 px-2 font-mono text-muted-foreground">{m.total_sessions}</td>
                  <td className="py-3 px-2 font-mono text-primary">£{m.total_revenue.toFixed(0)}</td>
                  <td className="py-3 px-2">
                    <div className="flex items-center gap-1">
                      <button onClick={() => adjustPoints(m.user_id, 10)} className="text-muted-foreground hover:text-green-400 transition-colors" title="Add 10 pts">
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <button onClick={() => adjustPoints(m.user_id, -10)} className="text-muted-foreground hover:text-destructive transition-colors" title="Deduct 10 pts">
                        <ChevronDown className="w-4 h-4" />
                      </button>
                      <button onClick={() => setNotesModal({ userId: m.user_id, name: m.full_name })} className="text-muted-foreground hover:text-interactive transition-colors" title="Admin notes">
                        <MessageSquare className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={!!notesModal} onOpenChange={() => setNotesModal(null)}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-xl text-foreground">ADMIN NOTES — {notesModal?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-muted-foreground">Notes</Label>
              <textarea value={adminNotes} onChange={(e) => setAdminNotes(e.target.value)} rows={4} className="w-full mt-1 bg-background border border-border rounded-md px-3 py-2 text-foreground text-sm resize-none focus:border-interactive focus:ring-1 focus:ring-interactive focus:outline-none transition-colors" placeholder="Internal notes about this member..." />
            </div>
            <Button onClick={() => { toast({ title: "Notes saved" }); setNotesModal(null); setAdminNotes(""); }} className="w-full font-bebas tracking-wider">
              SAVE NOTES
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminMembers;
