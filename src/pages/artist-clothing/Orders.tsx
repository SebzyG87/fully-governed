import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Package } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface Order {
  id: string;
  buyer_first_name: string | null;
  product_id: string | null;
  size: string | null;
  colour: string | null;
  quantity: number;
  fulfillment_status: string;
  created_at: string;
}

const statusBadge = (s: string) => {
  switch (s) {
    case "pending": return <Badge variant="secondary" className="bg-muted text-muted-foreground">Pending</Badge>;
    case "processing": return <Badge className="bg-amber-600/20 text-amber-400 border-amber-600/30">Processing</Badge>;
    case "shipped": return <Badge className="bg-blue-600/20 text-blue-400 border-blue-600/30">Shipped</Badge>;
    case "delivered": return <Badge className="bg-emerald-600/20 text-emerald-400 border-emerald-600/30">Delivered</Badge>;
    default: return <Badge variant="secondary">{s}</Badge>;
  }
};

const Orders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      setLoading(true);
      const { data } = await supabase.from("clothing_orders")
        .select("id, buyer_first_name, product_id, size, colour, quantity, fulfillment_status, created_at")
        .or(`artist_id.eq.${user.id},seller_id.eq.${user.id}`)
        .order("created_at", { ascending: false });
      setOrders((data as Order[]) || []);
      setLoading(false);
    };
    load();
  }, [user]);

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navbar />
      <div className="grain-overlay" />
      <div className="container pt-24 pb-16 space-y-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <p className="font-mono text-xs tracking-[0.3em] text-primary mb-2 uppercase">My Clothing</p>
          <h1 className="font-bebas text-5xl md:text-7xl text-foreground tracking-wider">ORDERS</h1>
          <p className="text-muted-foreground font-barlow mt-2">All orders are fulfilled by Fully Governed.</p>
        </motion.div>

        {loading ? (
          <div className="space-y-3 max-w-4xl mx-auto">{[1,2,3].map(i => <div key={i} className="h-16 bg-card border border-border rounded-lg animate-pulse" />)}</div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-16 text-center">
            <Package className="w-12 h-12 text-muted-foreground" />
            <p className="text-muted-foreground font-barlow">No orders yet. Your orders will appear here once your products go live.</p>
          </div>
        ) : (
          <div className="max-w-5xl mx-auto overflow-x-auto">
            <table className="w-full text-sm font-barlow">
              <thead>
                <tr className="border-b border-border text-muted-foreground text-left">
                  <th className="py-3 px-2">Order ID</th>
                  <th className="py-3 px-2">Customer</th>
                  <th className="py-3 px-2">Size</th>
                  <th className="py-3 px-2">Colour</th>
                  <th className="py-3 px-2">Qty</th>
                  <th className="py-3 px-2">Date</th>
                  <th className="py-3 px-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} className="border-b border-border/50 text-foreground">
                    <td className="py-3 px-2 font-mono text-xs">{o.id.slice(0, 8)}</td>
                    <td className="py-3 px-2">{o.buyer_first_name || "—"}</td>
                    <td className="py-3 px-2">{o.size || "—"}</td>
                    <td className="py-3 px-2">{o.colour || "—"}</td>
                    <td className="py-3 px-2">{o.quantity}</td>
                    <td className="py-3 px-2">{format(new Date(o.created_at), "dd MMM yyyy")}</td>
                    <td className="py-3 px-2">{statusBadge(o.fulfillment_status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Orders;
