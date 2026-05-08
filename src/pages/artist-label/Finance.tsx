import { motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { DollarSign, Download, TrendingUp } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface PayoutRow {
  date: string;
  amount: number;
  status: string;
}

const Finance = () => {
  const { user } = useAuth();
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [monthEarnings, setMonthEarnings] = useState(0);
  const [payouts, setPayouts] = useState<PayoutRow[]>([]);
  const [loading, setLoading] = useState(true);
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      // Try to load purchases where the user is the seller (item_type tracks)
      const { data: purchases } = await supabase
        .from("purchases")
        .select("amount, created_at")
        .order("created_at", { ascending: false });

      if (purchases && purchases.length > 0) {
        const total = purchases.reduce((sum, p) => sum + Number(p.amount), 0);
        setTotalEarnings(total);

        const now = new Date();
        const thisMonth = purchases.filter((p) => {
          const d = new Date(p.created_at);
          return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        });
        setMonthEarnings(thisMonth.reduce((sum, p) => sum + Number(p.amount), 0));

        setPayouts(
          purchases.map((p) => ({
            date: new Date(p.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
            amount: Number(p.amount),
            status: "Paid",
          }))
        );
      }
      setLoading(false);
    };
    load();
  }, [user]);

  const handleDownloadReport = () => {
    if (!reportRef.current) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <html><head><title>Earnings Report — Fully Governed</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 40px; color: #222; }
        h1 { font-size: 24px; margin-bottom: 8px; }
        p { font-size: 14px; color: #666; margin-bottom: 24px; }
        table { width: 100%; border-collapse: collapse; margin-top: 16px; }
        th, td { text-align: left; padding: 10px 12px; border-bottom: 1px solid #ddd; font-size: 14px; }
        th { background: #f5f5f5; font-weight: 600; }
        .summary { display: flex; gap: 24px; margin-bottom: 32px; }
        .card { border: 1px solid #ddd; border-radius: 8px; padding: 16px 24px; }
        .card h3 { font-size: 12px; color: #888; margin: 0 0 4px; }
        .card p { font-size: 24px; color: #222; margin: 0; }
      </style></head><body>
      <h1>Fully Governed — Earnings Report</h1>
      <p>Generated ${new Date().toLocaleDateString("en-GB")}</p>
      <div class="summary">
        <div class="card"><h3>Total Earnings</h3><p>£${totalEarnings.toFixed(2)}</p></div>
        <div class="card"><h3>This Month</h3><p>£${monthEarnings.toFixed(2)}</p></div>
      </div>
      <table>
        <thead><tr><th>Date</th><th>Amount</th><th>Status</th></tr></thead>
        <tbody>${payouts.map((p) => `<tr><td>${p.date}</td><td>£${p.amount.toFixed(2)}</td><td>${p.status}</td></tr>`).join("")}</tbody>
      </table>
      </body></html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navbar />
      <div className="grain-overlay" />
      <div className="container pt-24 pb-16 space-y-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <p className="font-mono text-xs tracking-[0.3em] text-primary mb-2 uppercase">My Label</p>
          <h1 className="font-bebas text-5xl md:text-7xl text-foreground tracking-wider">FINANCE DASHBOARD</h1>
          <p className="text-muted-foreground font-barlow mt-2 max-w-xl mx-auto">Track your earnings, view payout history and download reports.</p>
        </motion.div>

        <div ref={reportRef} className="max-w-4xl mx-auto space-y-8">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center gap-3 mb-2">
                <DollarSign className="w-5 h-5 text-primary" />
                <p className="text-sm text-muted-foreground font-barlow">Total Earnings</p>
              </div>
              <p className="font-bebas text-4xl text-primary">
                {loading ? "—" : `£${totalEarnings.toFixed(2)}`}
              </p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                <p className="text-sm text-muted-foreground font-barlow">Revenue This Month</p>
              </div>
              <p className="font-bebas text-4xl text-foreground">
                {loading ? "—" : `£${monthEarnings.toFixed(2)}`}
              </p>
            </motion.div>
          </div>

          {/* Payout History Table */}
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="p-4 border-b border-border">
              <h2 className="font-bebas text-xl text-foreground tracking-wider">PAYOUT HISTORY</h2>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  <th className="text-left p-4 font-bebas text-base tracking-wider text-foreground">Date</th>
                  <th className="text-right p-4 font-bebas text-base tracking-wider text-foreground">Amount</th>
                  <th className="text-right p-4 font-bebas text-base tracking-wider text-foreground">Status</th>
                </tr>
              </thead>
              <tbody className="font-barlow">
                {loading ? (
                  <tr><td colSpan={3} className="p-6 text-center text-muted-foreground">Loading...</td></tr>
                ) : payouts.length > 0 ? (
                  payouts.map((p, i) => (
                    <tr key={i} className="border-b border-border last:border-0">
                      <td className="p-4 text-muted-foreground">{p.date}</td>
                      <td className="p-4 text-right text-primary font-mono">£{p.amount.toFixed(2)}</td>
                      <td className="p-4 text-right">
                        <span className="text-xs font-mono px-2 py-1 rounded-full bg-primary/10 text-primary">{p.status}</span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={3} className="p-6 text-center text-muted-foreground font-barlow">No payouts recorded yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Stripe note */}
          <p className="text-center text-xs text-muted-foreground font-mono">
            Payments processed via Stripe Connect — payouts within 2–3 business days.
          </p>

          {/* Download button */}
          <div className="text-center">
            <Button variant="outline" onClick={handleDownloadReport} className="font-bebas text-lg tracking-wider gap-2 px-8 h-12">
              <Download className="w-4 h-4" /> DOWNLOAD EARNINGS REPORT
            </Button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Finance;
