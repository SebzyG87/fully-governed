import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ShoppingBag, Crown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface ShopItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock_count: number;
  category: string;
  image_url: string | null;
  artist_name: string | null;
}

const Shop = () => {
  const [items, setItems] = useState<ShopItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    supabase.from("shop_items").select("*").then(({ data }) => {
      setItems((data as ShopItem[]) || []);
      setLoading(false);
    });
  }, []);

  const handleBuy = async (item: ShopItem) => {
    if (!user) {
      toast({ title: "Sign in to purchase", variant: "destructive" });
      return;
    }
    const { error } = await supabase.from("orders").insert({
      user_id: user.id,
      item_id: item.id,
      quantity: 1,
      total_amount: item.price,
    });
    if (error) {
      toast({ title: "Order failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Order placed! 🛍" });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="grain-overlay" />
      <Navbar />
      <div className="container pt-24 pb-16 space-y-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <h1 className="text-5xl md:text-7xl text-foreground">SHOP</h1>
          <p className="text-muted-foreground font-barlow mt-2">Merch, beats & digital products</p>
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Crown className="w-8 h-8 text-primary animate-pulse-gold" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground font-barlow text-lg">Shop coming soon — watch this space</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item, i) => (
              <motion.div key={item.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-card border border-border rounded-lg overflow-hidden group hover:border-interactive hover:shadow-[0_0_12px_hsl(var(--interactive))] transition-all">
                {item.image_url && (
                  <img src={item.image_url} alt={item.name} className="w-full h-48 object-cover" />
                )}
                <div className="p-4 space-y-2">
                  <h3 className="text-xl text-foreground">{item.name.toUpperCase()}</h3>
                  {item.artist_name && <p className="text-xs text-muted-foreground font-mono">{item.artist_name}</p>}
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                  <div className="flex items-center justify-between pt-2">
                    <span className="font-mono text-primary text-lg">£{Number(item.price).toFixed(2)}</span>
                    <Button size="sm" onClick={() => handleBuy(item)} className="font-bebas tracking-wider">
                      BUY NOW
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Shop;
