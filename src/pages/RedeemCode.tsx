import { useState } from 'react';
import { motion } from 'framer-motion';
import { Ticket, CheckCircle, Loader2, Disc3 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Link, useNavigate } from 'react-router-dom';

const RedeemCode = () => {
    const { user } = useAuth();
    const { toast } = useToast();
    const navigate = useNavigate();
    const [code, setCode] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState<{ title: string, artist: string, cover: string } | null>(null);

    const handleRedeem = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user) {
            toast({ title: "Sign In Required", description: "You must be signed in to redeem a code.", variant: "destructive" });
            navigate('/auth?returnTo=/redeem');
            return;
        }

        if (!code.trim()) {
            toast({ title: "Invalid Code", description: "Please enter a redemption code.", variant: "destructive" });
            return;
        }

        setIsSubmitting(true);

        try {
            // 1. Check if code exists and is unused
            const cleanCode = code.trim().toUpperCase();
            const { data: codeData, error: verifyError } = await supabase
                .from('redemption_codes' as any)
                .select(`
          id, 
          track_id, 
          redeemed_at,
          music_tracks (
            title,
            cover_url,
            profiles (full_name)
          )
        `)
                .eq('code', cleanCode)
                .single();

            if (verifyError || !codeData) {
                throw new Error("Invalid code. Please check for typos.");
            }

            if (codeData.redeemed_at) {
                throw new Error("This code has already been redeemed.");
            }

            // 2. Mark as redeemed
            const { error: redeemError } = await supabase
                .from('redemption_codes' as any)
                .update({
                    redeemed_by: user.id,
                    redeemed_at: new Date().toISOString()
                })
                .eq('id', codeData.id);

            if (redeemError) throw redeemError;

            // In a real app, we'd also insert into a `purchases` or `user_libraries` table here.
            // Since MyVault currently shows all tracks for the demo, we just show success.

            const trackInfo = codeData.music_tracks as any;
            setSuccess({
                title: trackInfo?.title || 'Unknown Track',
                artist: trackInfo?.profiles?.full_name || 'Unknown Artist',
                cover: trackInfo?.cover_url || ''
            });

            toast({ title: "Successfully Redeemed!", description: "Track added to your digital vault." });

        } catch (err: any) {
            toast({ title: "Redemption Failed", description: err.message, variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Navbar />

            <div className="flex-1 flex flex-col items-center justify-center p-4 pt-32 pb-24">
                {success ? (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-card border border-border rounded-xl p-8 max-w-md w-full text-center space-y-6">
                        <CheckCircle className="w-20 h-20 text-emerald-500 mx-auto" />

                        <div>
                            <p className="font-bebas text-4xl text-foreground tracking-wider uppercase">Unlocked!</p>
                            <p className="font-barlow text-muted-foreground mt-2">Added to your vault.</p>
                        </div>

                        <div className="bg-muted rounded-lg p-4 flex items-center gap-4 text-left border border-border">
                            {success.cover ? (
                                <img src={success.cover} alt="Cover" className="w-16 h-16 rounded object-cover" />
                            ) : (
                                <div className="w-16 h-16 rounded bg-background flex items-center justify-center border border-border">
                                    <Disc3 className="w-8 h-8 text-muted-foreground" />
                                </div>
                            )}
                            <div>
                                <p className="font-bebas text-xl text-foreground tracking-wide line-clamp-1">{success.title}</p>
                                <p className="text-sm font-barlow text-muted-foreground line-clamp-1">{success.artist}</p>
                            </div>
                        </div>

                        <Button asChild className="w-full font-bebas text-lg tracking-wider mt-4">
                            <Link to="/dashboard/vault">GO TO MY VAULT</Link>
                        </Button>
                        <Button variant="outline" onClick={() => { setSuccess(null); setCode(''); }} className="w-full font-bebas tracking-wider">
                            REDEEM ANOTHER CODE
                        </Button>
                    </motion.div>
                ) : (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-xl p-8 max-w-md w-full text-center space-y-8">
                        <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Ticket className="w-12 h-12 text-primary" />
                        </div>

                        <div>
                            <h1 className="font-bebas text-5xl md:text-6xl text-foreground tracking-wider uppercase">REDEEM</h1>
                            <p className="text-muted-foreground font-barlow mt-2">
                                Got a scratch-off card or a download code from a live show? Enter it below to unlock your digital vinyl.
                            </p>
                        </div>

                        <form onSubmit={handleRedeem} className="space-y-4 text-left">
                            <div>
                                <Input
                                    value={code}
                                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                                    placeholder="e.g. EW-XXXX-YYYY"
                                    className="bg-background border-2 border-border h-14 text-center text-xl font-mono tracking-widest uppercase focus-visible:ring-primary focus-visible:border-primary"
                                    required
                                />
                            </div>

                            <Button type="submit" disabled={isSubmitting} className="w-full h-14 font-bebas text-2xl tracking-widest">
                                {isSubmitting ? <><Loader2 className="w-6 h-6 mr-2 animate-spin" /> VERIFYING...</> : 'UNLOCK MUSIC'}
                            </Button>
                        </form>
                    </motion.div>
                )}
            </div>

            <Footer />
        </div>
    );
};

export default RedeemCode;
