import { motion } from "framer-motion";
import { useState, useEffect, useMemo } from "react";
import { ShoppingBag, Disc3, ShoppingCart } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const FORMAT_TABS = ["All", "Digital Download", "USB", "NFT Edition"] as const;
type FormatTab = (typeof FORMAT_TABS)[number];

interface Product {
  id: string;
  title: string;
  artist: string;
  format: string;
  price: number;
  coverUrl?: string;
}

const formatBadgeClass = (f: string) => {
  if (f === "NFT Edition") return "bg-primary/20 text-primary border-primary/30";
  if (f === "USB") return "bg-accent/20 text-accent-foreground border-accent/30";
  return "bg-secondary text-secondary-foreground border-border";
};

const Buy = () => {
  const [tab, setTab] = useState<FormatTab>("All");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("music_tracks")
        .select("*")
        .eq("status", "published")
        .order("created_at", { ascending: false });

      if (data && data.length > 0) {
        const mapped: Product[] = [];
        data.forEach((t) => {
          mapped.push({
            id: t.id + "-digital",
            title: t.title,
            artist: t.genre || "Unknown Artist",
            format: "Digital Download",
            price: Number(t.price) || 4.99,
            coverUrl: t.cover_url || undefined,
          });
          if (t.is_nft) {
            mapped.push({
              id: t.id + "-nft",
              title: t.title,
              artist: t.genre || "Unknown Artist",
              format: "NFT Edition",
              price: Number(t.price) * 3 || 14.99,
              coverUrl: t.cover_url || undefined,
            });
          }
        });
        setProducts(mapped);
      }
      setLoading(false);
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    if (tab === "All") return products;
    return products.filter((p) => p.format === tab);
  }, [products, tab]);

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navbar />
      <div className="grain-overlay" />
      <div className="container pt-24 pb-16 space-y-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <p className="font-mono text-xs tracking-[0.3em] text-primary mb-2 uppercase">Mixtapes</p>
          <h1 className="font-bebas text-5xl md:text-7xl text-foreground tracking-wider">BUY MIXTAPES</h1>
          <p className="text-muted-foreground font-barlow mt-2 max-w-xl mx-auto">
            Available in digital download, USB and NFT edition formats.
          </p>
        </motion.div>

        <div className="max-w-5xl mx-auto space-y-8">
          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-2 justify-center">
            {FORMAT_TABS.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-2 rounded-full font-mono text-xs tracking-wider transition-colors border ${
                  tab === t
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card text-muted-foreground border-border hover:border-primary/50"
                }`}
              >
                {t.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Products */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[0, 1, 2].map((i) => (
                <div key={i} className="bg-card border border-border rounded-lg overflow-hidden animate-pulse">
                  <div className="aspect-square bg-secondary" />
                  <div className="p-4 space-y-3">
                    <div className="h-5 bg-secondary rounded w-3/4" />
                    <div className="h-4 bg-secondary rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-card border border-border rounded-lg overflow-hidden group"
                >
                  {p.coverUrl ? (
                    <img src={p.coverUrl} alt={p.title} className="aspect-square object-cover w-full" />
                  ) : (
                    <div className="aspect-square bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(280,60%,30%)] flex items-center justify-center">
                      <Disc3 className="w-16 h-16 text-foreground/30" />
                    </div>
                  )}
                  <div className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-bebas text-lg text-foreground tracking-wider">{p.title}</h3>
                        <p className="text-sm text-muted-foreground font-barlow">{p.artist}</p>
                      </div>
                      <Badge variant="outline" className={`text-[10px] font-mono shrink-0 ${formatBadgeClass(p.format)}`}>
                        {p.format}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-primary font-mono text-lg">£{p.price.toFixed(2)}</span>
                      <Button
                        size="sm"
                        className="font-mono text-xs"
                        onClick={() => toast.info("Cart feature coming soon")}
                      >
                        <ShoppingCart className="w-3 h-3 mr-1" /> Add to Cart
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4 py-16 text-center">
              <ShoppingBag className="w-12 h-12 text-muted-foreground" />
              <p className="text-muted-foreground font-barlow">No mixtapes available for purchase yet.</p>
            </div>
          )}

          {/* Stripe note */}
          <p className="text-center text-xs text-muted-foreground font-mono pt-4">
            🔒 Secure checkout via Stripe.
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Buy;
