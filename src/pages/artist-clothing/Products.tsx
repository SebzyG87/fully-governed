import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Shirt, Plus, Pencil, Pause, Play, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Product {
  id: string;
  name: string;
  base_price: number;
  status: string;
  product_type: string;
  base_colour: string;
  artwork_url: string | null;
  placement: string | null;
}

const statusBadge = (status: string) => {
  switch (status) {
    case "draft": return <Badge variant="secondary" className="bg-muted text-muted-foreground">Draft</Badge>;
    case "under_review": return <Badge className="bg-amber-600/20 text-amber-400 border-amber-600/30">Under Review</Badge>;
    case "live": return <Badge className="bg-emerald-600/20 text-emerald-400 border-emerald-600/30">Live</Badge>;
    case "paused": return <Badge variant="destructive">Paused</Badge>;
    default: return <Badge variant="secondary">{status}</Badge>;
  }
};

const Products = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase.from("clothing_products")
      .select("id, name, base_price, status, product_type, base_colour, artwork_url, placement")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setProducts((data as Product[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetch(); }, [user]);

  const togglePause = async (id: string, current: string) => {
    const newStatus = current === "live" ? "paused" : "live";
    await supabase.from("clothing_products").update({ status: newStatus }).eq("id", id);
    toast({ title: newStatus === "live" ? "Product resumed" : "Product paused" });
    fetch();
  };

  const deleteProduct = async (id: string) => {
    await supabase.from("clothing_products").delete().eq("id", id);
    toast({ title: "Product deleted" });
    fetch();
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navbar />
      <div className="grain-overlay" />
      <div className="container pt-24 pb-16 space-y-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <p className="font-mono text-xs tracking-[0.3em] text-primary mb-2 uppercase">My Clothing</p>
          <h1 className="font-bebas text-5xl md:text-7xl text-foreground tracking-wider">MY PRODUCTS</h1>
        </motion.div>

        <div className="text-center">
          <Link to="/artist-clothing/designer" className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-bebas text-base tracking-wider px-5 py-2 rounded-sm hover:shadow-[0_0_12px_hsl(var(--interactive))] transition-all">
            <Plus className="w-4 h-4" /> CREATE NEW PRODUCT
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[1, 2, 3].map(i => <div key={i} className="h-64 bg-card border border-border rounded-lg animate-pulse" />)}
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-16 text-center">
            <Shirt className="w-12 h-12 text-muted-foreground" />
            <p className="text-muted-foreground font-barlow">No products yet. Create your first design.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {products.map((p) => (
              <div key={p.id} className="bg-card border border-border rounded-lg overflow-hidden">
                <div className="h-40 flex items-center justify-center" style={{ backgroundColor: p.base_colour === "White" ? "#F5F5F5" : "#222" }}>
                  {p.artwork_url ? (
                    <img src={p.artwork_url} alt={p.name} className="max-h-32 object-contain" />
                  ) : (
                    <Shirt className="w-16 h-16 text-muted-foreground/30" />
                  )}
                </div>
                <div className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bebas text-lg text-foreground tracking-wider">{p.name}</h3>
                      <p className="text-xs text-muted-foreground font-barlow capitalize">{p.product_type} · £{Number(p.base_price).toFixed(2)}</p>
                    </div>
                    {statusBadge(p.status)}
                  </div>
                  <div className="flex gap-2">
                    <Link to="/artist-clothing/designer" className="flex-1">
                      <Button variant="outline" size="sm" className="w-full gap-1"><Pencil className="w-3 h-3" /> Edit</Button>
                    </Link>
                    {(p.status === "live" || p.status === "paused") && (
                      <Button variant="outline" size="sm" onClick={() => togglePause(p.id, p.status)} className="gap-1">
                        {p.status === "live" ? <><Pause className="w-3 h-3" /> Pause</> : <><Play className="w-3 h-3" /> Resume</>}
                      </Button>
                    )}
                    {p.status === "draft" && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm" className="gap-1"><Trash2 className="w-3 h-3" /> Delete</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete this product?</AlertDialogTitle>
                            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteProduct(p.id)}>Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Products;
