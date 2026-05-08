import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { LayoutDashboard, Star, ClipboardList, Gift, ArrowRight, Frown } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";

const tierConfig: Record<string, { label: string; color: string; min: number }> = {
  bronze: { label: "BRONZE", color: "bg-orange-900/30 text-orange-400 border-orange-700/50", min: 0 },
  silver: { label: "SILVER", color: "bg-gray-700/30 text-gray-300 border-gray-600/50", min: 200 },
  gold: { label: "GOLD", color: "bg-primary/20 text-primary border-primary/30", min: 500 },
  platinum: { label: "PLATINUM", color: "bg-purple-900/30 text-purple-400 border-purple-700/50", min: 1000 },
};

const getTier = (points: number) => {
  if (points >= 1000) return "platinum";
  if (points >= 500) return "gold";
  if (points >= 200) return "silver";
  return "bronze";
};

const StreetTeamDashboard = () => {
  const { user } = useAuth();
  const [member, setMember] = useState<{ points: number; tier: string; joined_at: string } | null>(null);
  const [applicationStatus, setApplicationStatus] = useState<string | null>(null);
  const [taskCount, setTaskCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      // Check membership
      const { data: memberData } = await supabase
        .from("street_team_members")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (memberData) {
        setMember(memberData as any);
        // Count active task completions
        const { count } = await supabase
          .from("street_team_task_completions")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id)
          .eq("status", "pending");
        setTaskCount(count || 0);
      } else {
        // Check application status
        const { data: app } = await supabase
          .from("street_team_applications")
          .select("status")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        setApplicationStatus(app?.status || null);
      }
      setLoading(false);
    };
    load();
  }, [user]);

  const tier = member ? getTier(member.points) : "bronze";
  const tc = tierConfig[tier];

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navbar />
      <div className="grain-overlay" />
      <div className="container pt-24 pb-16 space-y-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <p className="font-mono text-xs tracking-[0.3em] text-primary mb-2 uppercase">Street Team</p>
          <h1 className="font-bebas text-5xl md:text-7xl text-foreground tracking-wider">MY DASHBOARD</h1>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[0, 1, 2].map((i) => (
                <div key={i} className="bg-card border border-border rounded-lg p-6 animate-pulse h-28" />
              ))}
            </div>
          ) : !member ? (
            <div className="text-center py-16 space-y-4">
              {applicationStatus === "pending" ? (
                <>
                  <div className="text-5xl mb-4">👊</div>
                  <h2 className="font-bebas text-2xl text-foreground tracking-wider">YOUR APPLICATION IS UNDER REVIEW</h2>
                  <p className="text-muted-foreground font-barlow">We'll be in touch within 48 hours. Hang tight!</p>
                </>
              ) : applicationStatus === "rejected" ? (
                <>
                  <Frown className="w-12 h-12 text-muted-foreground mx-auto" />
                  <h2 className="font-bebas text-2xl text-foreground tracking-wider">APPLICATION NOT APPROVED</h2>
                  <p className="text-muted-foreground font-barlow">Feel free to reach out via the contact page if you think this is an error.</p>
                </>
              ) : (
                <>
                  <LayoutDashboard className="w-12 h-12 text-muted-foreground mx-auto" />
                  <h2 className="font-bebas text-2xl text-foreground tracking-wider">NOT A MEMBER YET</h2>
                  <p className="text-muted-foreground font-barlow mb-4">Apply to join the street team and start earning.</p>
                  <Link to="/street-team/join">
                    <Button className="font-bebas text-lg tracking-wider px-8 h-12">APPLY NOW</Button>
                  </Link>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-8">
              {/* Stats row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card border border-border rounded-lg p-6 text-center">
                  <Star className="w-6 h-6 text-primary mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground font-barlow mb-1">Points Balance</p>
                  <p className="font-bebas text-4xl text-primary">{member.points}</p>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-card border border-border rounded-lg p-6 text-center">
                  <p className="text-sm text-muted-foreground font-barlow mb-2">Tier</p>
                  <Badge variant="outline" className={`text-base font-bebas tracking-wider px-4 py-1 ${tc.color}`}>
                    {tc.label}
                  </Badge>
                  <p className="text-xs text-muted-foreground font-mono mt-2">
                    {tier !== "platinum" ? `${tierConfig[tier === "bronze" ? "silver" : tier === "silver" ? "gold" : "platinum"].min - member.points} pts to next tier` : "Max tier reached!"}
                  </p>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-card border border-border rounded-lg p-6 text-center">
                  <ClipboardList className="w-6 h-6 text-primary mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground font-barlow mb-1">Active Tasks</p>
                  <p className="font-bebas text-4xl text-foreground">{taskCount}</p>
                </motion.div>
              </div>

              {/* Quick actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link to="/street-team/tasks" className="flex items-center justify-between bg-card border border-border rounded-lg p-5 hover:border-primary/50 transition-colors group">
                  <div className="flex items-center gap-3">
                    <ClipboardList className="w-5 h-5 text-primary" />
                    <span className="font-bebas text-lg text-foreground tracking-wider group-hover:text-primary transition-colors">VIEW TASKS</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-primary group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link to="/street-team/rewards" className="flex items-center justify-between bg-card border border-border rounded-lg p-5 hover:border-primary/50 transition-colors group">
                  <div className="flex items-center gap-3">
                    <Gift className="w-5 h-5 text-primary" />
                    <span className="font-bebas text-lg text-foreground tracking-wider group-hover:text-primary transition-colors">VIEW REWARDS</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-primary group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              {/* Member since */}
              <p className="text-center text-xs text-muted-foreground font-mono">
                Member since {new Date(member.joined_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
              </p>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default StreetTeamDashboard;
