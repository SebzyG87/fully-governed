import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Crown, CreditCard, Plus, Clock, History, AlertCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import BackLink from "@/components/BackLink";

const Credits = () => {
  const { profile, loading } = useAuth();
  const navigate = useNavigate();
  
  if (loading) return null;
  const balance = profile?.credits_balance || 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="grain-overlay" />
      <header className="border-b border-border bg-card/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="container flex items-center justify-between h-16">
          <BackLink to="/dashboard" label="Dashboard" className="px-0" />
          <span className="font-bebas text-2xl tracking-widest text-foreground">STUDIO CREDITS</span>
        </div>
      </header>

      <div className="container py-8 max-w-3xl space-y-8">
        {/* Balance Card */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-gradient-to-br from-card to-accent/20 border border-primary/20 rounded-2xl p-8 relative overflow-hidden shadow-2xl">
          <div className="absolute -top-4 -right-4 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-1">
              <p className="font-mono text-xs text-muted-foreground tracking-widest uppercase mb-2">Available Balance</p>
              <div className="flex items-baseline gap-2">
                <h2 className="text-7xl font-bebas text-primary tracking-tighter">{balance}</h2>
                <span className="text-2xl font-bebas text-muted-foreground">HOURS</span>
              </div>
              <p className="text-sm font-barlow text-muted-foreground pt-4">Package eligibility is confirmed with the studio before purchase.</p>
            </div>
            <Button className="w-full md:w-auto font-bebas text-xl tracking-widest h-16 px-10 gap-2 bg-primary hover:bg-interactive transition-all" onClick={() => navigate("/pricing")}>
              <Plus className="w-6 h-6" /> ADD CREDITS
            </Button>
          </div>
        </motion.div>

        {/* Quick Add Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "25 HOURS", price: "£250", hours: 25, tag: "CREATIVE TIME" },
            { label: "50 HOURS", price: "£500", hours: 50, tag: "CREATIVE TIME" },
            { label: "100 HOURS", price: "£750", hours: 100, tag: "CREATIVE TIME" },
          ].map((bundle) => (
            <button key={bundle.label} onClick={() => navigate("/pricing")} className="group bg-card border border-border rounded-xl p-5 text-left hover:border-primary transition-all flex flex-col justify-between h-full">
              <div>
                <span className="text-xs font-mono text-primary uppercase tracking-[0.2em]">{bundle.tag}</span>
                <p className="text-2xl font-bebas text-foreground mt-1 mb-2">{bundle.label}</p>
              </div>
              <p className="text-3xl font-bebas text-primary mt-auto">{bundle.price}</p>
            </button>
          ))}
        </div>

        {/* Credits History */}
        <section className="bg-card border border-border rounded-xl p-6 space-y-4">
          <h3 className="text-xl font-bebas tracking-wide flex items-center gap-2">
            <History className="w-5 h-5 text-muted-foreground" /> RECENT USAGE
          </h3>
          <div className="space-y-1">
            <div className="flex justify-between items-center p-4 bg-background/50 rounded-lg border border-border/50 text-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/10 rounded-md">
                  <CreditCard className="w-4 h-4 text-emerald-500" />
                </div>
                <div>
                  <p className="text-foreground">Initial Account Balance</p>
                  <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest">TRANSACTION · COMPLETE</p>
                </div>
              </div>
              <span className="text-emerald-500 font-mono font-bold">+0.0 HR</span>
            </div>
            
            <div className="flex flex-col items-center justify-center py-10 opacity-30">
              <Clock className="w-10 h-10 text-muted-foreground mb-2" />
              <p className="font-barlow text-sm">No recent transactions found.</p>
            </div>
          </div>
        </section>

        {/* Warning card */}
        <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 flex gap-3 text-amber-500/80">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-xs font-barlow leading-relaxed">Creative time packages are subject to availability and the agreed service. Engineer services are not included unless specified in writing.</p>
        </div>
      </div>
    </div>
  );
};

export default Credits;
