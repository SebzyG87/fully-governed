import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { DollarSign, Download } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface OrderRow {
  total_amount: number;
  fulfillment_status: string;
  created_at: string;
  product_id: string | null;
  quantity: number;
}

const Earnings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      setLoading(true);
      const { data } = await supabase.from("clothing_orders")
        .select("total_amount, fulfillment_status, created_at, product_id, quantity")
        .or(`artist_id.eq.${user.id},seller_id.eq.${user.id}`)
        .order("created_at", { ascending: false });
      setOrders((data as OrderRow[]) || []);
      setLoading(false);
    };
    load();
  }, [user]);

  const delivered = orders.filter(o => o.fulfillment_status === "delivered");
  const totalRevenue = delivered.reduce((s, o) => s + Number(o.total_amount), 0);
  const now = new Date();
  const thisMonth = delivered.filter(o => {
    const d = new Date(o.created_at);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const monthRevenue = thisMonth.reduce((s, o) => s + Number(o.total_amount), 0);
  const pendingPayout = totalRevenue * 0.7;
  const unitsSold = delivered.reduce((s, o) => s + o.quantity, 0);

  const stats = [
    { label: "Total Revenue", value: `£${totalRevenue.toFixed(2)}` },
    { label: "Revenue This Month", value: `£${monthRevenue.toFixed(2)}` },
    { label: "Pending Payout", value: `£${pendingPayout.toFixed(2)}` },
    { label: "Units Sold", value: unitsSold },
  ];

  const handleRequestPayout = () => {
    toast({ title: "Payout request submitted! Processed within 3–5 working days." });
  };

  const handleDownload = () => {
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Earnings Report</title><style>body{font-family:sans-serif;padding:2rem}table{width:100%;border-collapse:collapse;margin-top:1rem}th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#f4f4f4}</style></head><body>`);
    w.document.write(`<h1>Clothing Earnings Report</h1><p>Total Revenue: £${totalRevenue.toFixed(2)} · Your Cut (70%): £${pendingPayout.toFixed(2)} · Units: ${unitsSold}</p>`);
    w.document.write(`<table><tr><th>Date</th><th>Amount</th><th>Your Cut</th></tr>`);
    delivered.forEach(o => {
      w.document.write(`<tr><td>${new Date(o.created_at).toLocaleDateString()}</td><td>£${Number(o.total_amount).toFixed(2)}</td><td>£${(Number(o.total_amount) * 0.7).toFixed(2)}</td></tr>`);
    });
    w.document.write(`</table></body></html>`);
    w.document.close();
    w.print();
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navbar />
      <div className="grain-overlay" />
      <div className="container pt-24 pb-16 space-y-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <p className="font-mono text-xs tracking-[0.3em] text-primary mb-2 uppercase">My Clothing</p>
          <h1 className="font-bebas text-5xl md:text-7xl text-foreground tracking-wider">EARNINGS</h1>
          <p className="text-muted-foreground font-barlow mt-2 max-w-xl mx-auto">You keep 70% of every sale after production costs and platform fee.</p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {stats.map(s => (
            <div key={s.label} className="bg-card border border-border rounded-lg p-5 text-center">
              <p className="text-xs text-muted-foreground font-barlow mb-1">{s.label}</p>
              <p className="font-bebas text-2xl text-primary">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Payout section */}
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row gap-4 items-center justify-between bg-card border border-border rounded-lg p-6">
          <div>
            <p className="font-barlow text-sm text-muted-foreground">Payments processed via Stripe Connect — payouts within 3–5 working days.</p>
          </div>
          <div className="flex gap-3">
            <Button onClick={handleRequestPayout} className="bg-primary text-primary-foreground">Request Payout</Button>
            <Button variant="outline" onClick={handleDownload} className="gap-1"><Download className="w-4 h-4" /> Report</Button>
          </div>
        </div>

        {/* Breakdown */}
        {delivered.length > 0 && (
          <div className="max-w-4xl mx-auto overflow-x-auto">
            <h2 className="font-bebas text-xl text-foreground tracking-wider mb-4">PER-ORDER BREAKDOWN</h2>
            <table className="w-full text-sm font-barlow">
              <thead>
                <tr className="border-b border-border text-muted-foreground text-left">
                  <th className="py-3 px-2">Date</th>
                  <th className="py-3 px-2">Qty</th>
                  <th className="py-3 px-2">Gross Revenue</th>
                  <th className="py-3 px-2">Your Cut (70%)</th>
                </tr>
              </thead>
              <tbody>
                {delivered.map((o, i) => (
                  <tr key={i} className="border-b border-border/50 text-foreground">
                    <td className="py-3 px-2">{new Date(o.created_at).toLocaleDateString()}</td>
                    <td className="py-3 px-2">{o.quantity}</td>
                    <td className="py-3 px-2">£{Number(o.total_amount).toFixed(2)}</td>
                    <td className="py-3 px-2 text-primary">£{(Number(o.total_amount) * 0.7).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && delivered.length === 0 && (
          <div className="flex flex-col items-center gap-4 py-8 text-center">
            <DollarSign className="w-12 h-12 text-muted-foreground" />
            <p className="text-muted-foreground font-barlow">No earnings yet. Revenue will appear here once orders are delivered.</p>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Earnings;
