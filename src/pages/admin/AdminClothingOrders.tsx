import { useEffect, useState } from "react";
import { Shirt } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

interface ClothingOrder {
  id: string;
  buyer_id: string;
  artist_id: string;
  quantity: number;
  total_amount: number;
  size: string | null;
  colour: string | null;
  fulfillment_status: string | null;
  status: string;
  created_at: string;
  product_name: string;
  buyer_name: string;
  artist_name: string;
}

const fulfillmentOptions = ["pending", "processing", "shipped", "delivered"];
const filterOptions = ["all", "pending", "processing", "shipped", "delivered"];

const AdminClothingOrders = () => {
  const { toast } = useToast();
  const [orders, setOrders] = useState<ClothingOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const fetchOrders = async () => {
    const { data } = await supabase.from("clothing_orders").select("*, clothing_products(name)").order("created_at", { ascending: false });
    const raw = (data || []) as any[];

    if (raw.length > 0) {
      const userIds = [...new Set(raw.flatMap(o => [o.buyer_id, o.artist_id]))];
      const { data: profiles } = await supabase.from("profiles").select("user_id, full_name").in("user_id", userIds);
      const pMap = new Map((profiles || []).map((p: any) => [p.user_id, p.full_name]));
      setOrders(raw.map(o => ({
        ...o,
        product_name: o.clothing_products?.name || "—",
        buyer_name: pMap.get(o.buyer_id) || "Unknown",
        artist_name: pMap.get(o.artist_id) || "Unknown",
      })));
    } else {
      setOrders([]);
    }
    setLoading(false);
  };

  useEffect(() => { fetchOrders(); }, []);

  const updateFulfilment = async (id: string, fulfillment_status: string) => {
    const { error } = await supabase.from("clothing_orders").update({ fulfillment_status } as any).eq("id", id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: `Fulfilment updated to ${fulfillment_status}` }); fetchOrders(); }
  };

  const filtered = orders.filter(o => filter === "all" || (o.fulfillment_status || "pending") === filter);
  const statusColor = (s: string) => s === "delivered" ? "text-emerald-400" : s === "shipped" ? "text-blue-400" : s === "processing" ? "text-primary" : "text-amber-400";

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="font-bebas text-3xl text-foreground tracking-wider">CLOTHING ORDERS</h1>
        <p className="text-sm text-muted-foreground font-barlow">{orders.length} orders</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {filterOptions.map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1 rounded-full text-xs font-mono capitalize transition-colors ${filter === f ? "bg-interactive text-background" : "bg-card border border-border text-muted-foreground hover:text-foreground"}`}>
            {f === "all" ? `All (${orders.length})` : `${f} (${orders.filter(o => (o.fulfillment_status || "pending") === f).length})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-lg" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16"><Shirt className="w-12 h-12 text-muted-foreground mx-auto mb-4" /><p className="text-muted-foreground">No orders found.</p></div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground font-mono text-xs">
                <th className="text-left py-3 px-2">Order ID</th>
                <th className="text-left py-3 px-2">Artist</th>
                <th className="text-left py-3 px-2">Product</th>
                <th className="text-left py-3 px-2">Customer</th>
                <th className="text-left py-3 px-2">Size</th>
                <th className="text-left py-3 px-2">Colour</th>
                <th className="text-left py-3 px-2">Qty</th>
                <th className="text-left py-3 px-2">Amount</th>
                <th className="text-left py-3 px-2">Date</th>
                <th className="text-left py-3 px-2">Fulfilment</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => (
                <tr key={o.id} className="border-b border-border/50 hover:bg-accent/30 transition-colors">
                  <td className="py-3 px-2 font-mono text-foreground">{o.id.slice(0, 8)}</td>
                  <td className="py-3 px-2 text-foreground">{o.artist_name}</td>
                  <td className="py-3 px-2 text-muted-foreground">{o.product_name}</td>
                  <td className="py-3 px-2 text-muted-foreground">{o.buyer_name}</td>
                  <td className="py-3 px-2 text-muted-foreground">{o.size || "—"}</td>
                  <td className="py-3 px-2 text-muted-foreground">{o.colour || "—"}</td>
                  <td className="py-3 px-2 font-mono text-muted-foreground">{o.quantity}</td>
                  <td className="py-3 px-2 font-mono text-primary">£{o.total_amount}</td>
                  <td className="py-3 px-2 font-mono text-muted-foreground">{format(new Date(o.created_at), "d MMM yy")}</td>
                  <td className="py-3 px-2">
                    <select
                      value={o.fulfillment_status || "pending"}
                      onChange={(e) => updateFulfilment(o.id, e.target.value)}
                      className="bg-background border border-border rounded px-2 py-1 text-xs font-mono text-foreground"
                    >
                      {fulfillmentOptions.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminClothingOrders;
