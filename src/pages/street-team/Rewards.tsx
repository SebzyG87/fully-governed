import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Gift, Star, Tag } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

interface Reward {
  id: string;
  title: string;
  description: string | null;
  points_cost: number;
  category: string | null;
  available: boolean;
}

const DEFAULT_REWARDS = [
  { title: "Studio Time Discount", description: "10% off your next session", points_cost: 100, category: "Discount" },
  { title: "Free 1hr Room Upgrade", description: "Upgrade your next booking", points_cost: 300, category: "Upgrade" },
  { title: "Merch Pack", description: "Fully Governed merchandise bundle", points_cost: 500, category: "Merchandise" },
  { title: "Event Tickets", description: "Free entry to next studio event", points_cost: 200, category: "Events" },
  { title: "Cash Payout £20", description: "Admin-approved PayPal payout", points_cost: 1000, category: "Cash" },
];

const categoryBadgeClass = (cat: string | null) => {
  const map: Record<string, string> = {
    Discount: "bg-emerald-900/30 text-emerald-400 border-emerald-700/50",
    Upgrade: "bg-blue-900/30 text-blue-400 border-blue-700/50",
    Merchandise: "bg-purple-900/30 text-purple-400 border-purple-700/50",
    Events: "bg-primary/20 text-primary border-primary/30",
    Cash: "bg-orange-900/30 text-orange-400 border-orange-700/50",
  };
  return map[cat || ""] || "bg-secondary text-secondary-foreground border-border";
};

const Rewards = () => {
  const { user } = useAuth();
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [userPoints, setUserPoints] = useState(0);

  useEffect(() => {
    const load = async () => {
      // Load rewards
      let { data } = await supabase
        .from("street_team_rewards")
        .select("*")
        .eq("is_active", true)
        .order("points_cost", { ascending: true });

      // Seed defaults if empty
      if (!data || data.length === 0) {
        for (const r of DEFAULT_REWARDS) {
          await supabase.from("street_team_rewards").insert({
            title: r.title,
            description: r.description,
            points_cost: r.points_cost,
            category: r.category,
          } as any);
        }
        const { data: seeded } = await supabase.from("street_team_rewards").select("*").eq("is_active", true).order("points_cost", { ascending: true });
        data = seeded;
      }

      setRewards((data as Reward[]) || []);

      // Load user points
      if (user) {
        const { data: memberData } = await supabase
          .from("street_team_members")
          .select("points")
          .eq("user_id", user.id)
          .maybeSingle();
        setUserPoints((memberData as any)?.points || 0);
      }
      setLoading(false);
    };
    load();
  }, [user]);

  const handleRedeem = (reward: Reward) => {
    if (!user) { toast.error("Sign in to redeem rewards."); return; }
    if (userPoints < reward.points_cost) { toast.error("Not enough points."); return; }
    toast.success("Redemption requested! Admin will process within 48 hours.");
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navbar />
      <div className="grain-overlay" />
      <div className="container pt-24 pb-16 space-y-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <p className="font-mono text-xs tracking-[0.3em] text-primary mb-2 uppercase">Street Team</p>
          <h1 className="font-bebas text-5xl md:text-7xl text-foreground tracking-wider">REWARDS</h1>
          <p className="text-muted-foreground font-barlow mt-2 max-w-xl mx-auto">Redeem your earned points for studio time, merch, event tickets and more.</p>
        </motion.div>

        {/* Points balance */}
        {user && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-xs mx-auto bg-card border border-border rounded-lg p-6 text-center">
            <Star className="w-6 h-6 text-primary mx-auto mb-2" />
            <p className="text-sm text-muted-foreground font-barlow">Your Points</p>
            <p className="font-bebas text-4xl text-primary">{userPoints}</p>
          </motion.div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[0, 1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-44 rounded-lg" />)}
          </div>
        ) : rewards.length === 0 ? (
          <div className="text-center py-16">
            <Gift className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground font-barlow">No rewards available yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {rewards.map((r, i) => {
              const canRedeem = user && userPoints >= r.points_cost;
              return (
                <motion.div key={r.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
                  <div className="bg-card border border-border rounded-lg p-6 h-full flex flex-col">
                    <div className="flex items-start justify-between mb-3">
                      <Gift className="w-6 h-6 text-primary" />
                      {r.category && (
                        <Badge variant="outline" className={`text-[10px] font-mono ${categoryBadgeClass(r.category)}`}>
                          <Tag className="w-2.5 h-2.5 mr-1" />{r.category}
                        </Badge>
                      )}
                    </div>
                    <h3 className="font-bebas text-xl text-foreground tracking-wider mb-1">{r.title}</h3>
                    {r.description && <p className="text-sm text-muted-foreground font-barlow mb-4 flex-1">{r.description}</p>}
                    <div className="flex items-center justify-between mt-auto pt-3 border-t border-border">
                      <Badge variant="outline" className="bg-primary/20 text-primary border-primary/30 font-mono">
                        {r.points_cost} pts
                      </Badge>
                      <Button
                        size="sm"
                        onClick={() => handleRedeem(r)}
                        disabled={!canRedeem}
                        className={`font-bebas tracking-wider ${canRedeem ? "" : "opacity-50"}`}
                      >
                        REDEEM
                      </Button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Rewards;
