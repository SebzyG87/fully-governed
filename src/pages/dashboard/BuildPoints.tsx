import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Crown, Zap, Gift, Target, Trophy, ChevronRight, History, CheckCircle, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import BackLink from "@/components/BackLink";

const tiers = [
  { name: "MIC 1", min: 0, max: 100, color: "#808080", benefits: ["Free Coffee", "Access to community events"] },
  { name: "SILVER MIC", min: 100, max: 500, color: "#C0C0C0", benefits: ["5% Discount on Shop", "Dedicated Engineer pool"] },
  { name: "GOLD MIC", min: 500, max: 2000, color: "#D4AF37", benefits: ["10% Discount on Bookings", "Priority Scheduling"] },
  { name: "PLATINUM MIC", min: 2000, max: 99999, color: "#E5E4E2", benefits: ["Free Distribution", "Monthly Strategy Session"] },
];

const BuildPoints = () => {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [checkInDone, setCheckInDone] = useState(false);

  const { data: pointsHistory, isLoading: historyLoading } = useQuery({
    queryKey: ["fg_loyalty_points", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("fg_loyalty_points" as any)
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) {
        // Table may not exist yet — return empty
        if (error.code === "42P01") return [];
        throw error;
      }
      return data ?? [];
    },
  });

  // Live total computed from transaction history (falls back to profile total)
  const livePoints = pointsHistory
    ? (pointsHistory as any[]).reduce((sum: number, e: any) => sum + (e.points || 0), 0)
    : (profile?.loyalty_points || 0);

  // Check if user already checked in today
  useEffect(() => {
    if (!pointsHistory) return;
    const today = new Date().toDateString();
    const alreadyDone = pointsHistory.some(
      (e: any) => e.source === "checkin" && new Date(e.created_at).toDateString() === today
    );
    setCheckInDone(alreadyDone);
  }, [pointsHistory]);

  const checkInMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not logged in");
      // Add 1 point to history
      const { error: insertError } = await supabase
        .from("fg_loyalty_points" as any)
        .insert({ user_id: user.id, points: 1, reason: "Daily Check-in", source: "checkin" });
      if (insertError) throw insertError;
      // Update profile total
      const { data: cur } = await supabase.from("profiles").select("loyalty_points").eq("user_id", user.id).single();
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ loyalty_points: (cur?.loyalty_points || 0) + 1 })
        .eq("user_id", user.id);
      if (updateError) throw updateError;
    },
    onSuccess: () => {
      setCheckInDone(true);
      toast({ title: "+1 point earned!", description: "See you tomorrow for another check-in." });
      queryClient.invalidateQueries({ queryKey: ["fg_loyalty_points"] });
    },
    onError: (err: any) => {
      toast({ title: "Check-in failed", description: err.message, variant: "destructive" });
    },
  });

  if (loading) return null;

  const points = livePoints;
  const currentTier = tiers.find((t) => points >= t.min && points < t.max) || tiers[0];
  const nextTier = tiers[tiers.indexOf(currentTier) + 1];
  const progress = nextTier
    ? Math.min(100, ((points - currentTier.min) / (nextTier.min - currentTier.min)) * 100)
    : 100;

  return (
    <div className="min-h-screen bg-background">
      <div className="grain-overlay" />
      <header className="border-b border-border bg-card/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="container flex items-center justify-between h-16">
          <BackLink to="/dashboard" label="Dashboard" className="px-0" />
          <span className="font-bebas text-2xl tracking-widest text-foreground">BUILD POINTS</span>
        </div>
      </header>

      <div className="container py-8 max-w-3xl space-y-8">
        {/* Tier Progress */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-lg p-8 space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4">
            <Trophy className="w-12 h-12 text-primary/10" />
          </div>
          <div className="space-y-2">
            <p className="font-mono text-xs text-muted-foreground tracking-widest">CURRENT TIER</p>
            <h2 className="text-5xl font-bebas tracking-wider" style={{ color: currentTier.color }}>{currentTier.name}</h2>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-end text-sm">
              <span className="font-mono text-muted-foreground">{points} XP</span>
              {nextTier && <span className="font-mono text-muted-foreground">{nextTier.min} XP FOR {nextTier.name}</span>}
              {!nextTier && <span className="font-mono text-primary">MAX TIER</span>}
            </div>
            <div className="h-3 bg-secondary rounded-full overflow-hidden border border-border">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="h-full bg-primary shadow-[0_0_15px_rgba(212,175,55,0.4)]"
              />
            </div>
          </div>

          {/* Daily Check-in */}
          <Button
            onClick={() => checkInMutation.mutate()}
            disabled={checkInDone || checkInMutation.isPending}
            variant={checkInDone ? "outline" : "default"}
            className="w-full font-bebas tracking-wider"
          >
            {checkInMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : checkInDone ? (
              <CheckCircle className="w-4 h-4 mr-2 text-emerald-500" />
            ) : (
              <Zap className="w-4 h-4 mr-2" />
            )}
            {checkInDone ? "CHECKED IN TODAY (+1 XP)" : "DAILY CHECK-IN (+1 XP)"}
          </Button>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* How to earn */}
          <section className="bg-card border border-border rounded-lg p-6 space-y-4">
            <h3 className="text-xl font-bebas tracking-wide flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" /> HOW TO EARN
            </h3>
            <div className="space-y-3">
              {[
                { label: "Book a Session", value: "+10 pts / hour" },
                { label: "Shop Purchase", value: "+1 pt / £1" },
                { label: "Refer a Friend", value: "+50 pts" },
                { label: "Daily Check-in", value: "+1 pt" },
              ].map((item) => (
                <div key={item.label} className="flex justify-between items-center p-3 bg-background rounded-md border border-border/50">
                  <span className="text-sm font-barlow">{item.label}</span>
                  <span className="text-primary font-mono text-xs font-bold">{item.value}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Current Benefits */}
          <section className="bg-card border border-border rounded-lg p-6 space-y-4">
            <h3 className="text-xl font-bebas tracking-wide flex items-center gap-2">
              <Gift className="w-5 h-5 text-primary" /> YOUR BENEFITS
            </h3>
            <div className="space-y-3">
              {currentTier.benefits.map((benefit) => (
                <div key={benefit} className="flex items-center gap-2 p-3 bg-primary/5 rounded-md border border-primary/20">
                  <Target className="w-4 h-4 text-primary" />
                  <span className="text-sm font-barlow">{benefit}</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Tier Overview */}
        <section className="bg-card border border-border rounded-lg p-6 space-y-4">
          <h3 className="text-xl font-bebas tracking-wide">ALL TIERS</h3>
          <div className="space-y-2">
            {tiers.map((tier) => {
              const active = tier.name === currentTier.name;
              return (
                <div
                  key={tier.name}
                  className={`flex items-center justify-between p-3 rounded-md border ${active ? "border-primary/40 bg-primary/5" : "border-border"}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: tier.color }} />
                    <span className="font-bebas tracking-wider" style={{ color: active ? tier.color : undefined }}>{tier.name}</span>
                  </div>
                  <span className="font-mono text-xs text-muted-foreground">{tier.min}–{tier.max === 99999 ? "∞" : tier.max} XP</span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Point History */}
        <section className="bg-card border border-border rounded-lg p-6 space-y-4">
          <h3 className="text-xl font-bebas tracking-wide flex items-center gap-2">
            <History className="w-5 h-5 text-muted-foreground" /> POINT HISTORY
          </h3>
          {historyLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : pointsHistory && pointsHistory.length > 0 ? (
            <div className="space-y-1">
              {pointsHistory.map((entry: any) => (
                <div key={entry.id} className="flex justify-between items-center py-3 border-b border-border/50 last:border-0 text-sm">
                  <div className="space-y-0.5">
                    <p className="text-foreground font-barlow">{entry.reason}</p>
                    <p className="text-xs text-muted-foreground">{format(new Date(entry.created_at), "d MMM yyyy, HH:mm")}</p>
                  </div>
                  <span className={`font-mono font-bold ${entry.points > 0 ? "text-emerald-500" : "text-destructive"}`}>
                    {entry.points > 0 ? "+" : ""}{entry.points} XP
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground font-barlow">No point history yet.</p>
              <p className="text-xs text-muted-foreground mt-1">Book a session or complete your daily check-in to start earning.</p>
            </div>
          )}
        </section>

        <Button className="w-full font-bebas text-xl tracking-widest h-14" onClick={() => navigate("/shop")}>
          GO TO THE SHOP
          <ChevronRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default BuildPoints;
