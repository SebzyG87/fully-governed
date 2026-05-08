import { motion } from "framer-motion";
import { Disc3, Music } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { useAudioPlayer } from "@/contexts/AudioPlayerContext";
import { useSEO } from "@/hooks/useSEO";

const DigitalVinyl = () => {
  const { playTrack, currentTrack, isPlaying } = useAudioPlayer();

  useSEO({
    title: "Digital Vinyl Shop",
    description: "Browse and collect exclusive, limited-edition digital vinyl from local Lewisham artists.",
  });

  const { data: tracks, isLoading } = useQuery({
    queryKey: ['music_tracks', 'published'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('music_tracks')
        .select(`
          *,
          profiles (
            full_name,
            avatar_url
          )
        `)
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navbar />
      <div className="grain-overlay" />
      <div className="container pt-24 pb-16 space-y-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <p className="font-mono text-xs tracking-[0.3em] text-primary mb-2 uppercase">Shop</p>
          <h1 className="font-bebas text-5xl md:text-7xl text-foreground tracking-wider">DIGITAL VINYL</h1>
          <p className="text-muted-foreground font-barlow mt-2 max-w-xl mx-auto">
            Browse exclusive digital vinyl releases from Fully Governed artists. Stream, collect, and support local talent.
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-card border border-border rounded-lg p-6 space-y-4">
                  <Skeleton className="w-full aspect-square rounded-md" />
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-6 w-2/3" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </div>
          ) : tracks && tracks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tracks.map((track: any, i) => (
                <motion.div
                  key={track.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-card border border-border rounded-lg p-4 flex flex-col hover:border-interactive hover:shadow-[0_0_12px_hsl(var(--interactive))] transition-all group"
                >
                  <div className="aspect-square bg-muted rounded-md mb-4 flex items-center justify-center overflow-hidden relative">
                    {track.cover_url ? (
                      <img src={track.cover_url} alt={track.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <Disc3 className="w-16 h-16 text-muted-foreground/50" />
                    )}
                    {track.is_nft && (
                      <span className="absolute top-2 right-2 bg-primary/90 text-primary-foreground text-xs font-bold px-2 py-1 rounded">
                        STUDIO CERTIFIED
                      </span>
                    )}
                  </div>

                  <div className="space-y-1 mb-4 flex-grow">
                    <p className="text-xs text-primary font-mono">{track.genre || "Multi-Genre"}</p>
                    <h3 className="font-bebas text-2xl text-foreground tracking-wider line-clamp-1" title={track.title}>{track.title}</h3>
                    <p className="text-sm text-muted-foreground font-barlow flex items-center gap-2">
                      By {track.profiles?.full_name || "Unknown Artist"}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 mt-auto">
                    <span className="font-mono text-lg text-foreground mr-auto">£{track.price}</span>
                    <Button
                      variant="outline"
                      className={`font-bebas tracking-wider border-border hover:border-interactive hover:text-interactive transition-all ${currentTrack?.id === track.id ? 'border-interactive text-interactive' : ''
                        }`}
                      onClick={() => playTrack({
                        id: track.id,
                        title: track.title,
                        artist: track.profiles?.full_name || 'Unknown',
                        coverUrl: track.cover_url || '',
                        audioUrl: track.file_url || ''
                      })}
                    >
                      {currentTrack?.id === track.id && isPlaying ? "PAUSE" : "PREVIEW"}
                    </Button>
                    <Button asChild className="font-bebas tracking-wider">
                      <Link to={`/shop/checkout?trackId=${track.id}`}>BUY NOW</Link>
                    </Button>
                  </div>
                  {track.is_nft && track.nft_copy_limit && (
                    <p className="text-xs text-muted-foreground text-center mt-3 font-barlow">
                      Limited Pressing: {track.nft_copy_limit} copies
                    </p>
                  )}
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20 bg-card border border-border rounded-lg"
            >
              <Music className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="font-bebas text-2xl tracking-wider text-foreground mb-2">NO RELEASES YET</h3>
              <p className="text-muted-foreground font-barlow max-w-sm mx-auto">
                Our artists are recording in the studio right now. Check back soon for exclusive drops.
              </p>
            </motion.div>
          )}

          <div className="text-center mt-12 pt-8 border-t border-border">
            <p className="text-muted-foreground font-barlow mb-4">Want to release your music as digital vinyl?</p>
            <Link to="/vinyl/artists"><Button variant="outline" className="font-bebas text-lg tracking-wider px-8 h-12">ARTIST INFO</Button></Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default DigitalVinyl;
