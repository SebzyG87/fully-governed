import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Disc3, Play } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface MixtapeCard {
  id: string;
  title: string;
  artist: string;
  releaseDate: string;
  coverUrl?: string;
}

const Current = () => {
  const [mixtapes, setMixtapes] = useState<MixtapeCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("music_tracks")
        .select("*")
        .eq("status", "published")
        .order("created_at", { ascending: false });

      if (data && data.length > 0) {
        setMixtapes(
          data.map((t) => ({
            id: t.id,
            title: t.title,
            artist: t.genre || "Unknown Artist",
            releaseDate: new Date(t.created_at).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            }),
            coverUrl: t.cover_url || undefined,
          }))
        );
      }
      setLoading(false);
    };
    load();
  }, []);

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navbar />
      <div className="grain-overlay" />
      <div className="container pt-24 pb-16 space-y-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <p className="font-mono text-xs tracking-[0.3em] text-primary mb-2 uppercase">Mixtapes</p>
          <h1 className="font-bebas text-5xl md:text-7xl text-foreground tracking-wider">CURRENT MIXTAPES</h1>
          <p className="text-muted-foreground font-barlow mt-2 max-w-xl mx-auto">Active releases available now.</p>
        </motion.div>

        <div className="max-w-5xl mx-auto">
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
          ) : mixtapes.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {mixtapes.map((m, i) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-card border border-border rounded-lg overflow-hidden"
                >
                  {m.coverUrl ? (
                    <img src={m.coverUrl} alt={m.title} className="aspect-square object-cover w-full" />
                  ) : (
                    <div className="aspect-square bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(280,60%,30%)] flex items-center justify-center">
                      <Disc3 className="w-16 h-16 text-foreground/30" />
                    </div>
                  )}
                  <div className="p-4 space-y-3">
                    <h3 className="font-bebas text-xl text-foreground tracking-wider">{m.title}</h3>
                    <p className="text-sm text-muted-foreground font-barlow">{m.artist}</p>
                    <p className="text-xs text-muted-foreground font-mono">{m.releaseDate}</p>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="font-mono text-xs flex-1" disabled>
                        <Play className="w-3 h-3 mr-1" /> Preview
                      </Button>
                      <Link to="/mixtapes/buy" className="flex-1">
                        <Button size="sm" className="font-mono text-xs w-full">Buy Now</Button>
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4 py-16 text-center border border-dashed border-border rounded-lg">
              <Disc3 className="w-12 h-12 text-muted-foreground" />
              <p className="text-muted-foreground font-barlow">No current mixtapes are published yet.</p>
              <Link to="/vinyl/artists">
                <Button variant="outline" className="font-bebas tracking-wider">RELEASE YOUR MUSIC</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Current;
