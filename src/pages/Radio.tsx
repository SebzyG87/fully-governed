import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Headphones, Play, Radio as RadioIcon, Send, SquareArrowOutUpRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import QuoteRequestModal from "@/components/QuoteRequestModal";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAudioPlayer } from "@/contexts/AudioPlayerContext";

type RadioTrack = {
  id: string;
  title: string;
  genre: string | null;
  file_url: string;
  cover_url: string | null;
};

const Radio = () => {
  const [tracks, setTracks] = useState<RadioTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [applicationOpen, setApplicationOpen] = useState(false);
  const { currentTrack, isPlaying, playTrack } = useAudioPlayer();

  useEffect(() => {
    let active = true;
    supabase
      .from("music_tracks")
      .select("id, title, genre, file_url, cover_url")
      .eq("status", "published")
      .not("file_url", "is", null)
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (!active) return;
        if (error) setLoadFailed(true);
        setTracks((data ?? []).filter((track): track is RadioTrack => Boolean(track.file_url)));
        setLoading(false);
      }, () => {
        if (!active) return;
        setLoadFailed(true);
        setLoading(false);
      });
    return () => { active = false; };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="grain-overlay" />
      <Navbar />
      <main className="container space-y-12 pt-24 pb-16">
        <motion.header initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-3xl text-center">
          <RadioIcon className="mx-auto mb-4 h-9 w-9 text-primary" />
          <h1 className="font-bebas text-5xl text-foreground md:text-7xl">FULLY GOVERNED RADIO</h1>
          <p className="mt-3 font-barlow text-muted-foreground">Listen to approved artist releases and send in a show proposal.</p>
        </motion.header>

        <section className="mx-auto max-w-4xl" aria-labelledby="radio-status">
          <div className="flex flex-col gap-4 border-y border-border py-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary"><Headphones className="h-5 w-5" /></span>
              <div>
                <h2 id="radio-status" className="font-bebas text-2xl text-foreground">FEATURED TRACKS</h2>
                <p className="text-sm text-muted-foreground">{loading ? "Loading releases…" : loadFailed ? "Radio is temporarily unavailable." : tracks.length ? `${tracks.length} published ${tracks.length === 1 ? "track" : "tracks"}` : "No published tracks are available yet."}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button asChild variant="outline"><Link to="/dashboard/upload-music"><Send className="mr-2 h-4 w-4" />Submit music</Link></Button>
              <Button onClick={() => setApplicationOpen(true)}>Propose a show</Button>
            </div>
          </div>

          {loadFailed ? (
            <p role="alert" className="py-8 text-center text-sm text-muted-foreground">Radio is temporarily unavailable. Please try again shortly.</p>
          ) : !loading && tracks.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-sm text-muted-foreground">New music appears here after it has been reviewed and published.</p>
              <p className="mt-2 text-xs text-muted-foreground">A live broadcast stream is not configured at this time.</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {tracks.map((track) => {
                const active = currentTrack?.id === track.id;
                return (
                  <div key={track.id} className="flex items-center gap-4 py-4">
                    {track.cover_url ? <img src={track.cover_url} alt={`${track.title} cover`} className="h-14 w-14 rounded-sm object-cover" /> : <div className="flex h-14 w-14 items-center justify-center rounded-sm bg-secondary text-primary"><RadioIcon className="h-6 w-6" /></div>}
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-barlow font-semibold text-foreground">{track.title}</p>
                      <p className="text-sm text-muted-foreground">{track.genre || "Fully Governed release"}</p>
                    </div>
                    <Button
                      variant={active && isPlaying ? "secondary" : "outline"}
                      size="icon"
                      aria-label={active && isPlaying ? `Pause ${track.title}` : `Play ${track.title}`}
                      onClick={() => playTrack({ id: track.id, title: track.title, artist: "Fully Governed", coverUrl: track.cover_url || "", audioUrl: track.file_url })}
                    >
                      {active && isPlaying ? <span className="text-xs">II</span> : <Play className="h-4 w-4" />}
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section className="mx-auto flex max-w-4xl flex-col gap-4 border-t border-border pt-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-bebas text-2xl text-foreground">MAKE A SHOW OR PLAY MUSIC</h2>
            <p className="mt-1 max-w-xl text-sm text-muted-foreground">Record a show in the studio, submit a proposal for review, or send music for consideration.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline"><Link to="/recording-radio/radio">Studio & radio services <SquareArrowOutUpRight className="ml-2 h-4 w-4" /></Link></Button>
            <Button asChild><Link to="/book">Book a room</Link></Button>
          </div>
        </section>
      </main>
      <Footer />
      <QuoteRequestModal open={applicationOpen} onOpenChange={setApplicationOpen} prefilledService="Radio show proposal" />
    </div>
  );
};

export default Radio;
