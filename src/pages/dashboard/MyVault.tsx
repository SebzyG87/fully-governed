import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Download, Search, HardDrive, Lock, Crown, Disc3 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useAudioPlayer, Track } from '@/contexts/AudioPlayerContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import VinylPlayer3D from '@/components/AudioPlayer/VinylPlayer3D';
import VirtualLinerNotes from '@/components/AudioPlayer/VirtualLinerNotes';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const TIER_ORDER = ['free', 'member', 'gold', 'platinum'];
const tierLabel: Record<string, string> = {
  free: 'Free',
  member: 'Member',
  gold: 'Gold Mic',
  platinum: 'Platinum Mic',
};

const canAccessTier = (userTier: string | null, required: string): boolean => {
  const userIdx = TIER_ORDER.indexOf(userTier || 'free');
  const reqIdx = TIER_ORDER.indexOf(required);
  return userIdx >= reqIdx;
};

const MyVault = () => {
    const { user, profile } = useAuth();
    const { playTrack, currentTrack, isPlaying } = useAudioPlayer();
    const [vaultTracks, setVaultTracks] = useState<Track[]>([]);
    const [exclusiveTracks, setExclusiveTracks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [activeTab, setActiveTab] = useState<'crate' | 'vault'>('crate');

    const userTier = (profile as any)?.membership_tier || 'free';

    useEffect(() => {
        const fetchVault = async () => {
            if (!user) return;

            // 1. Fetch purchased tracks
            const { data: purchases } = await supabase
                .from('purchases')
                .select('item_id')
                .eq('buyer_id', user.id)
                .eq('item_type', 'digital_vinyl')
                .eq('status', 'completed');

            // 2. Fetch redeemed tracks
            const { data: redemptions } = await supabase
                .from('redemption_codes')
                .select('track_id')
                .eq('redeemed_by', user.id);

            const purchasedIds = (purchases || []).map((p: any) => p.item_id);
            const redeemedIds = (redemptions || []).map((r: any) => r.track_id);
            const allOwnedIds = [...new Set([...purchasedIds, ...redeemedIds])];

            if (allOwnedIds.length > 0) {
                const { data, error } = await supabase
                    .from('music_tracks')
                    .select(`id, title, cover_url, file_url, profiles ( full_name )`)
                    .in('id', allOwnedIds);

                if (!error && data) {
                    setVaultTracks(data.map((t: any) => ({
                        id: t.id,
                        title: t.title,
                        artist: (t.profiles as any)?.full_name || 'Unknown Artist',
                        coverUrl: t.cover_url || '',
                        audioUrl: t.file_url || ''
                    })));
                }
            }

            // 3. Fetch exclusive vault tracks
            const { data: exclusive } = await supabase
                .from('music_tracks')
                .select(`id, title, cover_url, file_url, genre, profiles ( full_name )`)
                .eq('status', 'published')
                .eq('is_exclusive' as any, true)
                .order('created_at', { ascending: false });

            setExclusiveTracks((exclusive as any[]) || []);
            setLoading(false);
        };

        fetchVault();
    }, [user]);

    const filteredTracks = vaultTracks.filter(t =>
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        t.artist.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-background pb-32">
            <Navbar />
            <div className="container pt-32 max-w-6xl">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                    <p className="font-mono text-xs tracking-[0.3em] text-primary mb-2 uppercase">Your Personal Crate</p>
                    <h1 className="font-bebas text-5xl md:text-7xl text-foreground tracking-wider">MY VAULT</h1>
                    <p className="text-muted-foreground font-barlow mt-2">All your purchased digital vinyl and exclusive member-only streams.</p>
                </motion.div>

                {/* Tabs */}
                <div className="flex gap-2 mb-8">
                    <button
                        onClick={() => setActiveTab('crate')}
                        className={`font-bebas tracking-wider px-6 py-2 rounded-md text-lg transition-colors ${activeTab === 'crate' ? 'bg-primary text-primary-foreground' : 'bg-card border border-border text-foreground hover:border-primary/50'}`}
                    >
                        MY CRATE ({vaultTracks.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('vault')}
                        className={`font-bebas tracking-wider px-6 py-2 rounded-md text-lg transition-colors flex items-center gap-2 ${activeTab === 'vault' ? 'bg-primary text-primary-foreground' : 'bg-card border border-border text-foreground hover:border-primary/50'}`}
                    >
                        <Crown className="w-4 h-4" /> EXCLUSIVE VAULT ({exclusiveTracks.length})
                    </button>
                </div>

                {activeTab === 'vault' ? (
                <div className="space-y-4">
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-lg" />)}
                        </div>
                    ) : exclusiveTracks.length === 0 ? (
                        <div className="text-center py-20 bg-card/50 border border-dashed border-border rounded-xl">
                            <Crown className="w-12 h-12 text-primary/40 mx-auto mb-4" />
                            <p className="text-foreground font-bebas text-2xl tracking-wide">NO EXCLUSIVE DROPS YET</p>
                            <p className="text-muted-foreground font-barlow text-sm mt-2">Check back soon — artists are recording right now.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {exclusiveTracks.map((track: any, i: number) => {
                                const required = (track.tier_required as string) || 'member';
                                const hasAccess = canAccessTier(userTier, required);
                                const isActive = currentTrack?.id === track.id;
                                return (
                                    <motion.div
                                        key={track.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        className={`relative bg-card border rounded-xl overflow-hidden transition-colors ${hasAccess ? (isActive ? 'border-primary' : 'border-border hover:border-primary/50') : 'border-border/50 opacity-70'}`}
                                    >
                                        <div className="aspect-square bg-muted relative">
                                            {track.cover_url ? (
                                                <img src={track.cover_url} alt={track.title} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <Disc3 className="w-12 h-12 text-muted-foreground/40" />
                                                </div>
                                            )}
                                            {!hasAccess && (
                                                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-2">
                                                    <Lock className="w-8 h-8 text-primary" />
                                                    <span className="font-bebas text-sm tracking-wider text-primary">{tierLabel[required]} ONLY</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-3 space-y-2">
                                            <div>
                                                <p className="font-bebas text-lg text-foreground tracking-wider line-clamp-1">{track.title}</p>
                                                <p className="text-xs text-muted-foreground font-barlow">{(track.profiles as any)?.full_name || 'Unknown Artist'}</p>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-mono text-primary">{track.genre || 'Exclusive'}</span>
                                                {hasAccess ? (
                                                    <Button size="sm" variant="outline" className="font-bebas tracking-wider h-7 text-xs px-3" onClick={() => playTrack({ id: track.id, title: track.title, artist: (track.profiles as any)?.full_name || 'Unknown', coverUrl: track.cover_url || '', audioUrl: track.file_url || '' })}>
                                                        {isActive && isPlaying ? 'PAUSE' : 'PLAY'}
                                                    </Button>
                                                ) : (
                                                    <Link to="/dashboard/build-points">
                                                        <Button size="sm" variant="outline" className="font-bebas tracking-wider h-7 text-xs px-3 text-primary border-primary/50">
                                                            UPGRADE
                                                        </Button>
                                                    </Link>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                    <p className="text-xs text-center text-muted-foreground font-mono pt-2">
                        Your tier: <span className="text-primary">{tierLabel[userTier] || userTier}</span> — earn XP on the Build Points page to level up
                    </p>
                </div>
                ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Active Player Visuals */}
                    <div className="lg:col-span-5 order-2 lg:order-1 flex items-center justify-center bg-card/30 border border-border rounded-2xl p-8 relative">
                        <div className="grain-overlay opacity-30 mix-blend-overlay rounded-2xl" />
                        <VinylPlayer3D />
                        <VirtualLinerNotes />
                    </div>

                    {/* Crate List */}
                    <div className="lg:col-span-7 order-1 lg:order-2 space-y-6">
                        <div className="relative">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search your crate..."
                                className="pl-10 bg-card border-border h-12"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>

                        {loading ? (
                            <div className="space-y-4">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="flex items-center gap-4 p-4 rounded-xl border bg-card border-border">
                                        <Skeleton className="w-12 h-12 rounded-full" />
                                        <div className="flex-1 space-y-2">
                                            <Skeleton className="h-5 w-1/2" />
                                            <Skeleton className="h-4 w-1/3" />
                                        </div>
                                        <Skeleton className="w-8 h-8 rounded-md" />
                                    </div>
                                ))}
                            </div>
                        ) : filteredTracks.length === 0 ? (
                            <div className="text-center py-20 bg-card/50 border border-dashed border-border rounded-xl">
                                <HardDrive className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                                <p className="text-foreground font-bebas text-2xl tracking-wide">CAVERN IS EMPTY</p>
                                <p className="text-muted-foreground font-barlow text-sm">You haven't added any tracks to your vault yet.</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {filteredTracks.map((track) => {
                                    const isActive = currentTrack?.id === track.id;
                                    return (
                                        <motion.div
                                            key={track.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${isActive ? 'bg-primary/10 border-primary' : 'bg-card border-border hover:border-primary/50'
                                                }`}
                                        >
                                            <button
                                                onClick={() => playTrack(track)}
                                                className={`w-12 h-12 shrink-0 rounded-full flex items-center justify-center transition-all ${isActive && isPlaying ? 'bg-primary text-primary-foreground shadow-[0_0_15px_hsl(var(--primary))] scale-105' : 'bg-background hover:bg-primary/20 hover:text-primary text-foreground'
                                                    }`}
                                            >
                                                <Play className="w-5 h-5 ml-1 fill-current" />
                                            </button>

                                            <div className="flex-1 min-w-0">
                                                <p className={`font-bebas text-xl tracking-wider truncate ${isActive ? 'text-primary' : 'text-foreground'}`}>
                                                    {track.title}
                                                </p>
                                                <p className="text-sm font-barlow text-muted-foreground truncate">{track.artist}</p>
                                            </div>

                                            <a
                                                href={track.audioUrl}
                                                download
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-3 text-muted-foreground hover:text-primary transition-colors"
                                                aria-label="Download track"
                                            >
                                                <Download className="w-5 h-5" />
                                            </a>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
                )}
            </div>
            <Footer />
        </div>
    );
};

export default MyVault;
