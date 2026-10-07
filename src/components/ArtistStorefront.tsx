import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Disc3, Play } from "lucide-react";
import { useAudioPlayer } from "@/contexts/AudioPlayerContext";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

interface ArtistStorefrontProps {
    userId: string;
}

const ArtistStorefront = ({ userId }: ArtistStorefrontProps) => {
    const { playTrack, currentTrack, isPlaying } = useAudioPlayer();

    const { data: tracks, isLoading } = useQuery({
        queryKey: ['artist_tracks', userId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('music_tracks')
                .select(`*, profiles(full_name)`)
                .eq('user_id', userId)
                .eq('status', 'published')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data;
        },
        enabled: !!userId,
    });

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-8">
                {[1, 2, 3].map(i => (
                    <Skeleton key={i} className="bg-card w-full aspect-square rounded-xl" />
                ))}
            </div>
        );
    }

    if (!tracks || tracks.length === 0) {
        return (
            <div className="text-center py-12 mt-8 bg-card border border-border rounded-xl">
                <Disc3 className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="font-bebas text-xl text-foreground">NO RELEASES YET</p>
                <p className="text-sm font-barlow text-muted-foreground mt-2">This artist hasn't published any tracks.</p>
            </div>
        );
    }

    return (
        <div className="mt-12 space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-4">
                <h3 className="font-bebas text-3xl tracking-wider text-foreground">STOREFRONT</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {tracks.map((track, i) => (
                    <motion.div
                        key={track.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="bg-card border border-border rounded-xl overflow-hidden hover:border-interactive group transition-colors flex flex-col"
                    >
                        <div className="aspect-square bg-muted relative">
                            {track.cover_url ? (
                                <img src={track.cover_url} alt={track.title} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-muted-foreground"><Disc3 className="w-12 h-12" /></div>
                            )}

                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Button
                                    variant="secondary"
                                    size="icon"
                                    className="w-14 h-14 rounded-full"
                                    onClick={() => playTrack({
                                        id: track.id,
                                        title: track.title,
                                        artist: (track.profiles as any)?.full_name || 'Unknown',
                                        coverUrl: track.cover_url || '',
                                        audioUrl: track.file_url || ''
                                    })}
                                >
                                    {currentTrack?.id === track.id && isPlaying ? (
                                        <span className="w-4 h-4 bg-foreground" style={{ clipPath: 'polygon(0 0, 35% 0, 35% 100%, 0 100%, 100% 0, 100% 100%, 65% 100%, 65% 0)' }} />
                                    ) : (
                                        <Play className="w-6 h-6 ml-1" />
                                    )}
                                </Button>
                            </div>
                        </div>

                        <div className="p-4 flex-1 flex flex-col justify-between">
                            <div>
                                <p className="text-[10px] text-primary font-mono uppercase truncate">{track.genre || "Multi-Genre"}</p>
                                <h4 className="font-bebas text-2xl tracking-wider truncate text-foreground" title={track.title}>{track.title}</h4>
                            </div>
                            <div className="flex items-center justify-between mt-4">
                                <span className="font-mono text-sm text-foreground">{Number(track.price) > 0 ? `£${Number(track.price).toFixed(2)}` : "Price to be confirmed"}</span>
                                {Number(track.price) > 0 && <Button size="sm" asChild className="font-bebas tracking-wider" variant="secondary">
                                    <Link to={`/shop/checkout?trackId=${track.id}`}>BUY</Link>
                                </Button>}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default ArtistStorefront;
