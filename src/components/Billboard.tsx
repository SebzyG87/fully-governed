import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Crown, Trophy, Medal, Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

interface LeaderboardUser {
    id: string;
    full_name: string;
    avatar_url: string | null;
    loyalty_points: number;
}

const Billboard = () => {
    const [leaders, setLeaders] = useState<LeaderboardUser[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            const { data, error } = await supabase
                .from('profiles')
                .select('id, full_name, avatar_url, loyalty_points')
                // Only show users with at least some points to avoid clutter
                .gt('loyalty_points', 0)
                .order('loyalty_points', { ascending: false })
                .limit(10);

            if (!error && data) {
                setLeaders(data as LeaderboardUser[]);
            }
            setLoading(false);
        };

        fetchLeaderboard();
    }, []);

    const getRankIcon = (index: number) => {
        switch (index) {
            case 0: return <Crown className="w-5 h-5 text-yellow-400" />;
            case 1: return <Trophy className="w-5 h-5 text-zinc-300" />;
            case 2: return <Medal className="w-5 h-5 text-amber-600" />;
            default: return <Star className="w-4 h-4 text-primary/40" />;
        }
    };

    if (loading) {
        return (
            <div className="bg-card border border-border rounded-xl p-6 space-y-4">
                <h3 className="font-bebas text-2xl tracking-wider text-foreground mb-4">BILLBOARD STATUS</h3>
                {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="flex items-center gap-4">
                        <Skeleton className="w-6 h-6 rounded-full" />
                        <Skeleton className="w-10 h-10 rounded-full shrink-0" />
                        <div className="space-y-2 flex-1">
                            <Skeleton className="h-4 w-1/2" />
                            <Skeleton className="h-3 w-1/4" />
                        </div>
                        <Skeleton className="h-6 w-12" />
                    </div>
                ))}
            </div>
        );
    }

    if (leaders.length === 0) {
        return null; // Don't show if nobody has points
    }

    return (
        <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-bebas text-2xl tracking-wider text-foreground flex items-center gap-2">
                    <Crown className="w-6 h-6 text-primary" />
                    BILLBOARD STATUS
                </h3>
                <span className="text-xs font-mono text-muted-foreground bg-secondary/50 px-2 py-1 rounded">TOP EARNERS</span>
            </div>

            <div className="space-y-4">
                {leaders.map((user, index) => (
                    <motion.div
                        key={user.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`flex items-center gap-4 p-3 rounded-lg border transition-all ${index < 3 ? 'bg-background border-primary/20 hover:border-primary/50' : 'bg-background/50 border-border/50 hover:bg-background'
                            }`}
                    >
                        <div className={`w-8 flex justify-center font-bebas text-xl ${index < 3 ? 'text-primary' : 'text-muted-foreground'}`}>
                            {index + 1}
                        </div>

                        <div className="w-10 h-10 rounded-full overflow-hidden bg-muted shrink-0 border border-border">
                            {user.avatar_url ? (
                                <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-secondary font-bebas text-lg">
                                    {user.full_name?.charAt(0) || '?'}
                                </div>
                            )}
                        </div>

                        <div className="flex-1 min-w-0">
                            <p className="font-barlow font-medium text-foreground truncate">{user.full_name}</p>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                                {getRankIcon(index)}
                                <span>Top Fan</span>
                            </div>
                        </div>

                        <div className="text-right">
                            <p className="font-bebas text-xl tracking-wider text-primary">{user.loyalty_points.toLocaleString()}</p>
                            <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-widest font-mono mt-0.5">PTS</p>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default Billboard;
