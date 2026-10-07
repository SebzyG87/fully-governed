import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2, Music, ShieldCheck } from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "pk_test_sample");

const formatPrice = (amount: number) => `GBP ${amount.toFixed(2)}`;

const CheckoutForm = ({ amount, returnPath }: { amount: number; returnPath: string }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}${returnPath}`,
      },
    });

    if (error) {
      toast({ title: "Payment failed", description: error.message, variant: "destructive" });
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement options={{ layout: "tabs" }} />
      <Button
        type="submit"
        disabled={isProcessing || !stripe || !elements}
        className="w-full font-bebas text-lg tracking-wider"
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" /> PROCESSING...
          </>
        ) : (
          `PAY ${formatPrice(amount)}`
        )}
      </Button>
    </form>
  );
};

const getTierDiscount = (points: number) => {
  if (points >= 1000) return { name: "Platinum", rate: 0.15 };
  if (points >= 500) return { name: "Gold", rate: 0.1 };
  if (points >= 100) return { name: "Silver", rate: 0.05 };
  return { name: "Bronze", rate: 0 };
};

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const params = new URLSearchParams(location.search);
  const trackId = params.get("trackId");
  const productId = params.get("productId");
  const itemType = params.get("type") || "digital_vinyl";
  const amountParam = Number(params.get("amount"));
  const nameParam = params.get("name");

  const [clientSecret, setClientSecret] = useState("");
  const [paymentError, setPaymentError] = useState("");
  const [checkoutItem, setCheckoutItem] = useState<any>(null);

  useEffect(() => {
    if (!trackId && !productId) {
      navigate("/shop/digital-vinyl");
      return;
    }

    const initCheckout = async () => {
      setPaymentError("");
      let item: any = null;
      let calculatedPrice = 0;

      if (trackId) {
        const { data: trackData, error: trackError } = await supabase
          .from("music_tracks")
          .select("*, profiles(full_name)")
          .eq("id", trackId)
          .single();

        if (trackError || !trackData) {
          setPaymentError("Could not load this music checkout item.");
          toast({ title: "Checkout item not found", description: "Could not load track details.", variant: "destructive" });
          return;
        }

        const { rate } = getTierDiscount(profile?.loyalty_points || 0);
        calculatedPrice = Number(trackData.price) * (1 - rate);
        item = {
          ...trackData,
          checkoutType: "track",
          displayName: trackData.title,
          artistName: trackData.profiles?.full_name || "Unknown Artist",
        };
      } else if (productId) {
        const { data: productData } = await supabase
          .from("clothing_products")
          .select("*, profiles(full_name)")
          .eq("id", productId)
          .maybeSingle();

        calculatedPrice = Number(productData?.base_price) || 0;
        item = {
          ...(productData || {}),
          id: productId,
          checkoutType: itemType,
          displayName: productData?.name || nameParam || "Clothing order",
          artistName: productData?.profiles?.full_name || "Fully Governed",
          price: calculatedPrice,
          cover_url: productData?.image_url || null,
        };
      }

      if (!item || !calculatedPrice) {
        setPaymentError("Could not prepare this checkout item.");
        return;
      }

      setCheckoutItem(item);

      try {
        const { data, error } = await supabase.functions.invoke("create-checkout", {
          body: {
            trackId,
            productId,
            type: item.checkoutType,
          },
        });

        if (error) throw error;
        if (!Number.isFinite(Number(data?.amount)) || Number(data.amount) <= 0) {
          throw new Error("The server returned an invalid checkout amount.");
        }
        setCheckoutItem({ ...item, checkoutAmount: Number(data.amount) });
        setClientSecret(data.clientSecret);
      } catch (err: any) {
        setPaymentError(err?.message || "Stripe checkout is not available right now.");
        toast({ title: "Checkout unavailable", description: "Stripe setup is not ready yet.", variant: "destructive" });
      }
    };

    initCheckout();
  }, [trackId, productId, itemType, amountParam, nameParam, navigate, toast, profile?.loyalty_points, user?.id]);

  if (!checkoutItem && !paymentError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  const discountDetails = getTierDiscount(profile?.loyalty_points || 0);
  const isTrackCheckout = checkoutItem?.checkoutType === "track";
  const basePrice = Number(checkoutItem?.price) || 0;
  const discountAmount = isTrackCheckout ? basePrice * discountDetails.rate : 0;
  const finalPrice = Number.isFinite(Number(checkoutItem?.checkoutAmount))
    ? Number(checkoutItem.checkoutAmount)
    : basePrice - discountAmount;
  const returnPath = isTrackCheckout ? "/dashboard/my-vault?success=true" : "/artist-clothing/orders?success=true";

  return (
    <div className="min-h-screen bg-background pb-20">
      <Navbar />
      <div className="container pt-32 max-w-5xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
            <div>
              <p className="font-mono text-xs tracking-[0.3em] text-primary mb-2 uppercase">Order Summary</p>
              <h1 className="font-bebas text-5xl text-foreground tracking-wider">SECURE CHECKOUT</h1>
            </div>

            <div className="bg-card border border-border rounded-xl p-6 flex gap-6 items-center">
              <div className="w-24 h-24 rounded-lg overflow-hidden bg-background border border-border shrink-0">
                {checkoutItem?.cover_url ? (
                  <img src={checkoutItem.cover_url} alt={checkoutItem.displayName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-primary/50">
                    <Music className="w-8 h-8" />
                  </div>
                )}
              </div>
              <div>
                <p className="text-xs text-primary font-mono mb-1">
                  {isTrackCheckout ? checkoutItem?.genre || "Digital Vinyl" : "Artist Clothing"}
                </p>
                <h2 className="font-bebas text-3xl text-foreground tracking-wider">{checkoutItem?.displayName || "Checkout"}</h2>
                <p className="font-barlow text-muted-foreground">{checkoutItem?.artistName || "Fully Governed"}</p>
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-6 space-y-4">
              <div className="flex justify-between items-center text-foreground font-barlow">
                <span>{isTrackCheckout ? "Digital Track" : "Clothing Product"}</span>
                <span>{formatPrice(basePrice)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between items-center text-primary font-barlow italic">
                  <span>{discountDetails.name} Member Discount ({discountDetails.rate * 100}%)</span>
                  <span>-{formatPrice(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between items-center text-foreground font-barlow">
                <span>Processing Fee</span>
                <span className="line-through text-muted-foreground mr-2">GBP 0.50</span>
                <span className="text-emerald-500">FREE</span>
              </div>
              <div className="h-px bg-border my-4" />
              <div className="flex justify-between items-center text-foreground font-bebas text-3xl tracking-wider">
                <span>Total Payable</span>
                <span>{formatPrice(finalPrice)}</span>
              </div>

            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="bg-card border border-border rounded-xl p-6 md:p-8">
              <h3 className="font-bebas text-2xl tracking-wider mb-6 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-primary" />
                PAYMENT DETAILS
              </h3>

              {paymentError ? (
                <div className="py-12 text-center border-2 border-dashed border-border rounded-lg space-y-3 px-4">
                  <p className="text-sm text-foreground font-barlow">Checkout is not ready for this item yet.</p>
                  <p className="text-xs text-muted-foreground font-mono break-words">{paymentError}</p>
                  <Button variant="outline" onClick={() => navigate(-1)} className="font-bebas tracking-wider">
                    GO BACK
                  </Button>
                </div>
              ) : clientSecret ? (
                <Elements
                  stripe={stripePromise}
                  options={{
                    clientSecret,
                    appearance: {
                      theme: "night",
                      variables: { colorPrimary: "#D4AF37", colorBackground: "#111", colorText: "#eee" },
                    },
                  }}
                >
                  <CheckoutForm amount={finalPrice} returnPath={returnPath} />
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
