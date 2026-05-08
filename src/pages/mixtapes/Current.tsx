import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Disc3, ChevronDown, ChevronUp, Play } from "lucide-react";
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
  tracklist?: string[];
}

const PlaceholderCard = ({ title, index }: { title: string; index: number }) => {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className="bg-card border border-border rounded-lg overflow-hidden"
    >
      <div className="aspect-square bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(280,60%,30%)] flex items-center justify-center">
        <Disc3 className="w-16 h-16 text-foreground/30" />
      </div>
      <div className="p-4 space-y-3">
        <h3 className="font-bebas text-xl text-foreground tracking-wider">{title}</h3>
        <p className="text-sm text-muted-foreground font-barlow">Various Artists</p>
        <p className="text-xs text-muted-foreground font-mono">Coming Soon</p>

        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-1 text-xs text-primary font-mono hover:text-[hsl(280,60%,50%)] transition-colors"
        >
          Tracklist {open ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
        {open && (
          <div className="text-xs text-muted-foreground font-barlow space-y-1 pl-2 border-l border-border">
            <p>1. Track TBA</p>
            <p>2. Track TBA</p>
            <p>3. Track TBA</p>
          </div>
        )}

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
  );
};

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
            releaseDate: new Date(t.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <PlaceholderCard title="VOL. 1 — COMING SOON" index={0} />
              <PlaceholderCard title="VOL. 2 — COMING SOON" index={1} />
              <PlaceholderCard title="VOL. 3 — COMING SOON" index={2} />
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Current;
