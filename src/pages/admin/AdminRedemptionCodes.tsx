import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Ticket, Download, Loader2, Plus } from 'lucide-react';

const AdminRedemptionCodes = () => {
    const { toast } = useToast();
    const [isGenerating, setIsGenerating] = useState(false);
    const [selectedTrack, setSelectedTrack] = useState<string>('');
    const [quantity, setQuantity] = useState<number>(50);
    const [prefix, setPrefix] = useState<string>('EW');

    const { data: tracks, isLoading: tracksLoading } = useQuery({
        queryKey: ['admin_published_tracks'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('music_tracks')
                .select(`id, title, profiles(full_name)`)
                .eq('status', 'published');
            if (error) throw error;
            return data;
        }
    });

    const { data: stats, refetch: refetchStats } = useQuery({
        queryKey: ['admin_code_stats'],
        queryFn: async () => {
            const { count: totalCount } = await supabase.from('redemption_codes' as any).select('*', { count: 'exact', head: true });
            const { count: redeemedCount } = await supabase.from('redemption_codes' as any).select('*', { count: 'exact', head: true }).not('redeemed_at', 'is', null);

            return {
                total: totalCount || 0,
                redeemed: redeemedCount || 0,
                unredeemed: (totalCount || 0) - (redeemedCount || 0)
            };
        }
    });

    const generateRandomCode = (length = 8) => {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Excluded confusing chars like I, 1, O, 0
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    };

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedTrack) {
            toast({ title: "Select a track", description: "You must select a track to attach these codes to.", variant: "destructive" });
            return;
        }

        setIsGenerating(true);
        try {
            const codesToInsert = Array.from({ length: quantity }).map(() => ({
                track_id: selectedTrack,
                code: `${prefix.toUpperCase()}-${generateRandomCode(4)}-${generateRandomCode(4)}`
            }));

            const { error } = await supabase.from('redemption_codes' as any).insert(codesToInsert);

            if (error) throw error;

            toast({ title: "Codes Generated", description: `Successfully created ${quantity} new redemption codes.` });
            refetchStats();

            // Optionally download the generated batch as CSV right immediately
            downloadCSV(codesToInsert);

            // Reset form
            setQuantity(50);
            setPrefix('EW');
            setSelectedTrack('');

        } catch (err: any) {
            toast({ title: "Generation failed", description: err.message, variant: "destructive" });
        } finally {
            setIsGenerating(false);
        }
    };

    const downloadCSV = (codes: { code: string }[]) => {
        const csvContent = "data:text/csv;charset=utf-8,"
            + "Code\n"
            + codes.map(c => c.code).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `ewisham-codes-${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-8">
            <div>
                <h2 className="font-bebas text-4xl tracking-wider text-foreground">Redemption Codes</h2>
                <p className="text-muted-foreground font-barlow mt-2">
                    Generate physical-to-digital codes for scratch-off cards, vinyl inserts, or merch.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-card border border-border rounded-xl p-6">
                    <p className="text-muted-foreground text-sm font-mono uppercase mb-2">Total Codes Generated</p>
                    <p className="font-bebas text-4xl text-foreground">{stats?.total || 0}</p>
                </div>
                <div className="bg-card border border-border rounded-xl p-6">
                    <p className="text-emerald-500 text-sm font-mono uppercase mb-2">Successfully Redeemed</p>
                    <p className="font-bebas text-4xl text-foreground">{stats?.redeemed || 0}</p>
                </div>
                <div className="bg-card border border-border rounded-xl p-6">
                    <p className="text-primary text-sm font-mono uppercase mb-2">Unredeemed in Circulation</p>
                    <p className="font-bebas text-4xl text-foreground">{stats?.unredeemed || 0}</p>
                </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="font-bebas text-2xl tracking-widest mb-6 flex items-center gap-2">
                    <Ticket className="w-6 h-6 text-primary" /> MINT NEW CODES
                </h3>

                <form onSubmit={handleGenerate} className="space-y-6 max-w-2xl">
                    <div className="space-y-3">
                        <Label>Target Track</Label>
                        {tracksLoading ? (
                            <div className="h-10 bg-muted animate-pulse rounded-md w-full"></div>
                        ) : (
                            <select
                                value={selectedTrack}
                                onChange={(e) => setSelectedTrack(e.target.value)}
                                className="w-full h-10 px-3 bg-background border border-border rounded-md text-sm font-barlow focus:border-primary focus:outline-none"
                                required
                            >
                                <option value="">-- Select a track --</option>
                                {tracks?.map(track => (
                                    <option key={track.id} value={track.id}>
                                        {(track.profiles as any)?.full_name || 'Unknown Artist'} - {track.title}
                                    </option>
                                ))}
                            </select>
                        )}
                        <p className="text-xs text-muted-foreground">The track that will be added to the user's vault when they redeem the code.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-3">
                            <Label>Quantity</Label>
                            <Input
                                type="number"
                                min="1"
                                max="1000"
                                value={quantity}
                                onChange={(e) => setQuantity(parseInt(e.target.value))}
                                className="bg-background"
                                required
                            />
                        </div>
                        <div className="space-y-3">
                            <Label>Code Prefix (Optional)</Label>
                            <Input
                                type="text"
                                value={prefix}
                                onChange={(e) => setPrefix(e.target.value.toUpperCase())}
                                placeholder="e.g. VIP"
                                className="bg-background uppercase"
                                maxLength={4}
                            />
                        </div>
                    </div>

                    <div className="bg-muted p-4 rounded-lg border border-border">
                        <p className="text-sm font-barlow text-muted-foreground mb-2">Preview Layout:</p>
                        <p className="font-mono text-lg tracking-widest">{prefix.toUpperCase()}-X5T9-2KPL</p>
                    </div>

                    <Button type="submit" disabled={isGenerating} className="w-full font-bebas text-xl tracking-wider h-14">
                        {isGenerating ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> MINTING...</> : <><Plus className="w-5 h-5 mr-2" /> GENERATE & DOWNLOAD CSV</>}
                    </Button>
                </form>
            </div>

        </div>
    );
};

export default AdminRedemptionCodes;
