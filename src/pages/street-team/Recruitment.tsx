import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Users, Download, CheckCircle, XCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Navigate } from "react-router-dom";

interface Application {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  location: string | null;
  skills: string[] | null;
  availability: string | null;
  reason: string | null;
  status: string;
  created_at: string;
}

const TABS = ["All", "Pending", "Approved", "Rejected"] as const;

const statusBadge = (status: string) => {
  if (status === "approved") return "bg-emerald-900/30 text-emerald-400 border-emerald-700/50";
  if (status === "rejected") return "bg-red-900/30 text-red-400 border-red-700/50";
  return "bg-primary/20 text-primary border-primary/30";
};

const Recruitment = () => {
  const { user, role, loading: authLoading } = useAuth();
  const isAdmin = role === "creator_admin";
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<(typeof TABS)[number]>("All");

  useEffect(() => {
    if (!isAdmin) return;
    const load = async () => {
      const { data } = await supabase
        .from("street_team_applications")
        .select("*")
        .order("created_at", { ascending: false });
      setApps((data as Application[]) || []);
      setLoading(false);
    };
    load();
  }, [isAdmin]);

  const filtered = useMemo(() => {
    if (tab === "All") return apps;
    return apps.filter((a) => a.status === tab.toLowerCase());
  }, [apps, tab]);

  const handleApprove = async (app: Application) => {
    // Update application status
    const { error: updateError } = await supabase
      .from("street_team_applications")
      .update({ status: "approved" } as any)
      .eq("id", app.id);

    if (updateError) { toast.error(updateError.message); return; }

    // Create street_team_members record if user_id exists
    if ((app as any).user_id) {
      await supabase.from("street_team_members").insert({
        user_id: (app as any).user_id,
      } as any);
    }

    setApps((prev) => prev.map((a) => a.id === app.id ? { ...a, status: "approved" } : a));
    toast.success(`${app.full_name} approved!`);
  };

  const handleReject = async (app: Application) => {
    const { error } = await supabase
      .from("street_team_applications")
      .update({ status: "rejected" } as any)
      .eq("id", app.id);

    if (error) { toast.error(error.message); return; }
    setApps((prev) => prev.map((a) => a.id === app.id ? { ...a, status: "rejected" } : a));
    toast.success(`${app.full_name} rejected.`);
  };

  const handleExportCSV = () => {
    const headers = ["Date", "Name", "Email", "Phone", "Location", "Skills", "Availability", "Motivation", "Status"];
    const rows = apps.map((a) => [
      new Date(a.created_at).toLocaleDateString("en-GB"),
      a.full_name,
      a.email,
      a.phone || "",
      a.location || "",
      (a.skills || []).join("; "),
      a.availability || "",
      a.reason || "",
      a.status,
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `street-team-applications-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!authLoading && !user) return <Navigate to="/auth" replace />;
  if (!authLoading && !isAdmin) {
    return (
      <div className="min-h-screen bg-background pb-20 md:pb-0">
        <Navbar />
        <div className="grain-overlay" />
        <div className="container pt-24 pb-16 text-center py-32">
          <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="font-bebas text-2xl text-foreground tracking-wider">ACCESS RESTRICTED</h2>
          <p className="text-muted-foreground font-barlow mt-2">This area is for Admin members only.</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navbar />
      <div className="grain-overlay" />
      <div className="container pt-24 pb-16 space-y-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <p className="font-mono text-xs tracking-[0.3em] text-primary mb-2 uppercase">Street Team</p>
          <h1 className="font-bebas text-5xl md:text-7xl text-foreground tracking-wider">RECRUITMENT</h1>
          <p className="text-muted-foreground font-barlow mt-2">Review and manage street team applications.</p>
        </motion.div>

        <div className="max-w-6xl mx-auto space-y-6">
          {/* Tabs + Export */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex gap-2">
              {TABS.map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-4 py-2 rounded-full font-mono text-xs tracking-wider border transition-colors ${
                    tab === t
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card text-muted-foreground border-border hover:border-primary/50"
                  }`}
                >
                  {t.toUpperCase()}
                </button>
              ))}
            </div>
            <Button variant="outline" size="sm" onClick={handleExportCSV} className="font-mono text-xs gap-1">
              <Download className="w-3 h-3" /> EXPORT CSV
            </Button>
          </div>

          {/* Table */}
          {loading ? (
            <div className="bg-card border border-border rounded-lg p-8 text-center">
              <p className="text-muted-foreground font-barlow animate-pulse">Loading applications...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-card border border-border rounded-lg p-8 text-center">
              <Users className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground font-barlow">No applications found.</p>
            </div>
          ) : (
            <div className="bg-card border border-border rounded-lg overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-secondary/50">
                    <th className="text-left p-4 font-bebas text-base tracking-wider text-foreground">Date</th>
                    <th className="text-left p-4 font-bebas text-base tracking-wider text-foreground">Name</th>
                    <th className="text-left p-4 font-bebas text-base tracking-wider text-foreground">Email</th>
                    <th className="text-left p-4 font-bebas text-base tracking-wider text-foreground">Location</th>
                    <th className="text-left p-4 font-bebas text-base tracking-wider text-foreground">Skills</th>
                    <th className="text-center p-4 font-bebas text-base tracking-wider text-foreground">Status</th>
                    <th className="text-right p-4 font-bebas text-base tracking-wider text-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody className="font-barlow">
                  {filtered.map((a) => (
                    <tr key={a.id} className="border-b border-border last:border-0">
                      <td className="p-4 text-muted-foreground font-mono text-xs whitespace-nowrap">
                        {new Date(a.created_at).toLocaleDateString("en-GB")}
                      </td>
                      <td className="p-4 text-foreground">{a.full_name}</td>
                      <td className="p-4 text-muted-foreground">{a.email}</td>
                      <td className="p-4 text-muted-foreground">{a.location || "—"}</td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1">
                          {(a.skills || []).map((s) => (
                            <span key={s} className="text-[10px] font-mono bg-secondary px-2 py-0.5 rounded-full text-secondary-foreground">{s}</span>
                          ))}
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <Badge variant="outline" className={`text-[10px] font-mono ${statusBadge(a.status)}`}>
                          {a.status.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="p-4 text-right">
                        {a.status === "pending" && (
                          <div className="flex items-center justify-end gap-2">
                            <Button size="sm" onClick={() => handleApprove(a)} className="font-mono text-xs gap-1 h-8">
                              <CheckCircle className="w-3 h-3" /> Approve
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleReject(a)} className="font-mono text-xs gap-1 h-8 text-destructive">
                              <XCircle className="w-3 h-3" /> Reject
                            </Button>
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
      </div>
      <Footer />
    </div>
  );
};

export default Recruitment;
