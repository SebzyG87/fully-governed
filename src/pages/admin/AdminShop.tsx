import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ShoppingBag, Plus, Save, X, Music, Check, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

interface ShopItem {
  id: string;
  name: string;
  price: number;
  stock_count: number;
  category: string;
  is_active: boolean;
}

interface PendingTrack {
  id: string;
  title: string;
  genre: string;
  price: number;
  user_id: string;
  created_at: string;
  profiles: { full_name: string };
}

const AdminShop = () => {
  const [items, setItems] = useState<ShopItem[]>([]);
  const [pendingTracks, setPendingTracks] = useState<PendingTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("0");
  const [stock, setStock] = useState("0");
  const [category, setCategory] = useState("merchandise");
  const { toast } = useToast();

  const fetchItems = async () => {
    const { data } = await supabase.from("shop_items").select("*").order("created_at", { ascending: false });
    setItems((data as ShopItem[]) || []);
  };

  const fetchPendingTracks = async () => {
    const { data, error } = await supabase
      .from('music_tracks')
      .select('*, profiles(full_name)')
      .eq('status', 'pending_review')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setPendingTracks(data as any);
    }
  };

  const loadAll = async () => {
    setLoading(true);
    await Promise.all([fetchItems(), fetchPendingTracks()]);
    setLoading(false);
  };

  useEffect(() => { loadAll(); }, []);

  const handleAdd = async () => {
    if (!name.trim()) return;
    const { error } = await supabase.from("shop_items").insert({
      name,
      price: parseFloat(price) || 0,
      stock_count: parseInt(stock) || 0,
      category,
    });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Item added" });
      setName(""); setPrice("0"); setStock("0"); setShowAdd(false);
      fetchItems();
    }
  };

  const handleReviewTrack = async (id: string, newStatus: 'published' | 'rejected') => {
    const { error } = await supabase
      .from('music_tracks')
      .update({ status: newStatus })
      .eq('id', id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: `Track ${newStatus} successfully` });
      fetchPendingTracks();
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl text-foreground">SHOP MANAGER</h1>
          <p className="text-muted-foreground font-barlow text-sm">Manage inventory and approve digital releases.</p>
        </div>
        <Button size="sm" onClick={() => setShowAdd(!showAdd)} className="font-bebas tracking-wider" disabled={loading}>
          <Plus className="w-4 h-4 mr-1" /> ADD PRODUCT
        </Button>
      </motion.div>

      {showAdd && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="bg-card border border-border rounded-lg p-4 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <Label className="text-muted-foreground text-xs">Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 bg-background" />
            </div>
            <div>
              <Label className="text-muted-foreground text-xs">Category</Label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full mt-1 bg-background border border-border rounded-md px-3 py-2 text-foreground text-sm focus:border-interactive focus:outline-none">
                <option value="merchandise">Merchandise</option>
                <option value="digital">Digital Music</option>
                <option value="beats">Beats</option>
              </select>
            </div>
            <div>
              <Label className="text-muted-foreground text-xs">Price (£)</Label>
              <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} className="mt-1 bg-background" />
            </div>
            <div>
              <Label className="text-muted-foreground text-xs">Stock</Label>
              <Input type="number" value={stock} onChange={(e) => setStock(e.target.value)} className="mt-1 bg-background" />
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleAdd} className="font-bebas tracking-wider"><Save className="w-4 h-4 mr-1" /> SAVE</Button>
            <Button size="sm" variant="ghost" onClick={() => setShowAdd(false)}><X className="w-4 h-4" /></Button>
          </div>
        </motion.div>
      )}

      {loading ? (
        <div className="flex justify-center py-12"><ShoppingBag className="w-6 h-6 text-primary animate-pulse" /></div>
      ) : (
        <Tabs defaultValue="products" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="products">Physical & Digital Stock ({items.length})</TabsTrigger>
            <TabsTrigger value="review">Track Review Queue ({pendingTracks.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="mt-0">
            {items.length === 0 ? (
              <div className="bg-card border border-border rounded-lg p-12 text-center">
                <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No products yet — add your first item above</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map((item) => (
                  <div key={item.id} className="bg-card border border-border rounded-lg p-4 hover:border-interactive hover:shadow-[0_0_12px_hsl(var(--interactive))] transition-all">
                    <h3 className="text-lg text-foreground">{item.name.toUpperCase()}</h3>
                    <p className="text-xs text-muted-foreground font-mono capitalize">{item.category}</p>
                    <div className="flex justify-between mt-3">
                      <span className="font-mono text-primary">£{Number(item.price).toFixed(2)}</span>
                      <span className="text-xs text-muted-foreground font-mono">{item.stock_count} in stock</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="review" className="mt-0">
            {pendingTracks.length === 0 ? (
              <div className="bg-card border border-border rounded-lg p-12 text-center">
                <Music className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No pending tracks to review right now.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingTracks.map((track) => (
                  <div key={track.id} className="bg-card border border-border rounded-lg p-5 hover:border-interactive transition-all flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-xs text-primary font-mono lowercase">{track.genre}</p>
                            <span className="text-[10px] bg-secondary px-1.5 py-0.5 rounded text-muted-foreground font-mono uppercase">{(track as any).release_type || 'Single'}</span>
                          </div>
                          <h3 className="font-bebas text-xl text-foreground tracking-wider">{track.title}</h3>
                        </div>
                        <span className="px-2 py-1 bg-yellow-500/20 text-yellow-500 text-xs font-mono rounded">
                          PENDING
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground font-barlow mt-2">
                        Artist: {track.profiles?.full_name || "Unknown"}
                      </p>
                      <p className="font-mono text-lg text-foreground mt-2">£{Number(track.price).toFixed(2)}</p>
                    </div>

                    <div className="flex items-center gap-3 mt-6 pt-4 border-t border-border">
                      <Button size="sm" onClick={() => handleReviewTrack(track.id, 'published')} className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bebas tracking-wide">
                        <Check className="w-4 h-4 mr-2" /> APPROVE
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleReviewTrack(track.id, 'rejected')} className="flex-1 font-bebas tracking-wide">
                        <XCircle className="w-4 h-4 mr-2" /> REJECT
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default AdminShop;
