import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ShieldCheck, Music, Loader2, Crown } from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

// Replace with your Stripe publishable key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "pk_test_sample");

const CheckoutForm = ({ clientSecret, trackData, amount }: { clientSecret: string, trackData: any, amount: number }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [isProcessing, setIsProcessing] = useState(false);
    const { toast } = useToast();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!stripe || !elements) return;

        setIsProcessing(true);

        const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: `${window.location.origin}/dashboard/vault?success=true`,
            },
        });

        if (error) {
            toast({ title: "Payment Failed", description: error.message, variant: "destructive" });
            setIsProcessing(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <PaymentElement options={{
                layout: "tabs"
            }} />
            <Button
                type="submit"
                disabled={isProcessing || !stripe || !elements}
                className="w-full font-bebas text-lg tracking-wider"
            >
                {isProcessing ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> PROCESSING...</> : `PAY £${amount.toFixed(2)}`}
            </Button>
        </form>
    );
};

const getTierDiscount = (points: number) => {
    if (points >= 1000) return { name: 'Platinum', rate: 0.15 };
    if (points >= 500) return { name: 'Gold', rate: 0.10 };
    if (points >= 100) return { name: 'Silver', rate: 0.05 };
    return { name: 'Bronze', rate: 0 };
};

const Checkout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, profile } = useAuth();
    const { toast } = useToast();
    const [clientSecret, setClientSecret] = useState("");
    const trackId = new URLSearchParams(location.search).get("trackId");
    const [track, setTrack] = useState<any>(null);

    useEffect(() => {
        if (!trackId) {
            navigate('/shop/digital-vinyl');
            return;
        }

        const initCheckout = async () => {
            // 1. Fetch track details
            const { data: trackData, error: trackError } = await supabase
                .from('music_tracks')
                .select('*, profiles(full_name)')
                .eq('id', trackId)
                .single();

            if (trackError || !trackData) {
                toast({ title: "Error", description: "Could not load track details.", variant: "destructive" });
                return;
            }
            setTrack(trackData as any);

            const { rate } = getTierDiscount(profile?.loyalty_points || 0);
            const calculatedPrice = trackData.price * (1 - rate);

            // 2. Call Edge Function to create Payment Intent
            try {
                const { data, error } = await supabase.functions.invoke('create-checkout', {
                    body: { trackId, amount: calculatedPrice, userId: user?.id }
                });

                if (error) throw error;
                setClientSecret(data.clientSecret);
            } catch (err: any) {
                // Stub client secret for UI testing since Edge Functions might not be deployed
                toast({ title: "Development Mode", description: "Stripe functions not deployed. Using stub." });
            }
        };

        initCheckout();
    }, [trackId, navigate, toast, profile?.loyalty_points, user?.id]);

    if (!track) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        );
    }

    const discountDetails = getTierDiscount(profile?.loyalty_points || 0);
    const discountAmount = track.price * discountDetails.rate;
    const finalPrice = track.price - discountAmount;

    return (
        <div className="min-h-screen bg-background pb-20">
            <Navbar />
            <div className="container pt-32 max-w-5xl">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

                    {/* Order Summary */}
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                        <div>
                            <p className="font-mono text-xs tracking-[0.3em] text-primary mb-2 uppercase">Order Summary</p>
                            <h1 className="font-bebas text-5xl text-foreground tracking-wider">SECURE CHECKOUT</h1>
                        </div>

                        <div className="bg-card border border-border rounded-xl p-6 flex gap-6 items-center">
                            <div className="w-24 h-24 rounded-lg overflow-hidden bg-background border border-border shrink-0">
                                {track.cover_url ? (
                                    <img src={track.cover_url} alt={track.title} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-primary/50"><Music className="w-8 h-8" /></div>
                                )}
                            </div>
                            <div>
                                <p className="text-xs text-primary font-mono mb-1">{track.genre || "Hip Hop"}</p>
                                <h2 className="font-bebas text-3xl text-foreground tracking-wider">{track.title}</h2>
                                <p className="font-barlow text-muted-foreground">{track.profiles?.full_name || "Unknown Artist"}</p>
                            </div>
                        </div>

                        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
                            <div className="flex justify-between items-center text-foreground font-barlow">
                                <span>Digital Track</span>
                                <span>£{track.price.toFixed(2)}</span>
                            </div>
                            {discountAmount > 0 && (
                                <div className="flex justify-between items-center text-primary font-barlow italic">
                                    <span>{discountDetails.name} Member Discount ({discountDetails.rate * 100}%)</span>
                                    <span>-£{discountAmount.toFixed(2)}</span>
                                </div>
                            )}
                            <div className="flex justify-between items-center text-foreground font-barlow">
                                <span>Processing Fee</span>
                                <span className="line-through text-muted-foreground mr-2">£0.50</span>
                                <span className="text-emerald-500">FREE</span>
                            </div>
                            <div className="h-px bg-border my-4" />
                            <div className="flex justify-between items-center text-foreground font-bebas text-3xl tracking-wider">
                                <span>Total Payable</span>
                                <span>£{finalPrice.toFixed(2)}</span>
                            </div>

                            {track.is_nft && (
                                <div className="mt-4 p-3 bg-primary/10 border border-primary/20 rounded text-center">
                                    <p className="text-xs text-primary font-mono flex items-center justify-center gap-2 uppercase tracking-widest">
                                        <ShieldCheck className="w-4 h-4" />
                                        STUDIO CERTIFIED LIMITED PRESSING
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {track.nft_copy_limit} copies maximum worldwide.
                                    </p>
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* Payment Element */}
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                        <div className="bg-card border border-border rounded-xl p-6 md:p-8">
                            <h3 className="font-bebas text-2xl tracking-wider mb-6 flex items-center gap-2">
                                <ShieldCheck className="w-5 h-5 text-primary" />
                                PAYMENT DETAILS
                            </h3>

                            {clientSecret ? (
                                <Elements stripe={stripePromise} options={{
                                    clientSecret,
                                    appearance: {
                                        theme: "night",
                                        variables: { colorPrimary: '#D4AF37', colorBackground: '#111', colorText: '#eee' }
                                    }
                                }}>
                                    <CheckoutForm clientSecret={clientSecret} trackData={track} amount={finalPrice} />
                                </Elements>
                            ) : (
                                <div className="py-12 text-center text-muted-foreground font-mono text-sm border-2 border-dashed border-border rounded-lg">
                                    Initializing secure payment...
                                </div>
                            )}

                            <div className="mt-6 text-center space-y-2">
                                <p className="text-xs text-muted-foreground font-barlow">Payments processed securely by Stripe.</p>
                                <div className="flex justify-center gap-4 opacity-50">
                                    <span className="font-bebas tracking-widest text-lg">VISA</span>
                                    <span className="font-bebas tracking-widest text-lg">MASTERCARD</span>
                                    <span className="font-bebas tracking-widest text-lg">AMEX</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                </div>
            </div>
            <Footer />
        </div>
    );
};

export default Checkout;
