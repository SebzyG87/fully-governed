import { motion } from "framer-motion";
import { useState, useEffect, useMemo } from "react";
import { Archive, Disc3, Search, Play } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";

interface MixtapeCard {
  id: string;
  title: string;
  artist: string;
  genre: string;
  year: string;
  coverUrl?: string;
}

const ArchivePage = () => {
  const [tracks, setTracks] = useState<MixtapeCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [yearFilter, setYearFilter] = useState("all");
  const [genreFilter, setGenreFilter] = useState("all");

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("music_tracks")
        .select("*")
        .order("created_at", { ascending: false });

      if (data) {
        setTracks(
          data.map((t) => ({
            id: t.id,
            title: t.title,
            artist: t.genre || "Unknown Artist",
            genre: t.genre || "Other",
            year: new Date(t.created_at).getFullYear().toString(),
            coverUrl: t.cover_url || undefined,
          }))
        );
      }
      setLoading(false);
    };
    load();
  }, []);

  const years = useMemo(() => [...new Set(tracks.map((t) => t.year))].sort().reverse(), [tracks]);
  const genres = useMemo(() => [...new Set(tracks.map((t) => t.genre))].sort(), [tracks]);

  const filtered = useMemo(() => {
    return tracks.filter((t) => {
      const matchesSearch =
        !search ||
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        t.artist.toLowerCase().includes(search.toLowerCase());
      const matchesYear = yearFilter === "all" || t.year === yearFilter;
      const matchesGenre = genreFilter === "all" || t.genre === genreFilter;
      return matchesSearch && matchesYear && matchesGenre;
    });
  }, [tracks, search, yearFilter, genreFilter]);

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navbar />
      <div className="grain-overlay" />
      <div className="container pt-24 pb-16 space-y-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <p className="font-mono text-xs tracking-[0.3em] text-primary mb-2 uppercase">Mixtapes</p>
          <h1 className="font-bebas text-5xl md:text-7xl text-foreground tracking-wider">ARCHIVE</h1>
          <p className="text-muted-foreground font-barlow mt-2 max-w-xl mx-auto">Full searchable catalogue of past mixtapes.</p>
        </motion.div>

        <div className="max-w-5xl mx-auto space-y-8">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by title or artist..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 font-barlow"
              />
            </div>
            <Select value={yearFilter} onValueChange={setYearFilter}>
              <SelectTrigger className="w-full sm:w-40 font-barlow">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                {years.map((y) => (
                  <SelectItem key={y} value={y}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={genreFilter} onValueChange={setGenreFilter}>
              <SelectTrigger className="w-full sm:w-40 font-barlow">
                <SelectValue placeholder="Genre" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Genres</SelectItem>
                {genres.map((g) => (
                  <SelectItem key={g} value={g}>{g}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Results */}
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
              {filtered.map((m, i) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-card border border-border rounded-lg overflow-hidden"
                >
                  {m.coverUrl ? (
                    <img src={m.coverUrl} alt={m.title} className="aspect-square object-cover w-full" />
                  ) : (
                    <div className="aspect-square bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(280,60%,30%)] flex items-center justify-center">
                      <Disc3 className="w-16 h-16 text-foreground/30" />
                    </div>
                  )}
                  <div className="p-4 space-y-2">
                    <h3 className="font-bebas text-lg text-foreground tracking-wider">{m.title}</h3>
                    <p className="text-sm text-muted-foreground font-barlow">{m.artist}</p>
                    <p className="text-xs text-muted-foreground font-mono">{m.year} · {m.genre}</p>
                    <div className="flex gap-2 pt-1">
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
            <div className="flex flex-col items-center gap-4 py-16 text-center">
              <Archive className="w-12 h-12 text-muted-foreground" />
              <p className="text-muted-foreground font-barlow">
                {search || yearFilter !== "all" || genreFilter !== "all"
                  ? "No mixtapes match your filters."
                  : "Archive coming soon."}
              </p>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ArchivePage;
