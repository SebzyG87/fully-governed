// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from "../_shared/cors.ts"
// Using esm.sh to import stripe for Deno
import Stripe from 'https://esm.sh/stripe@14.14.0?target=deno'

// Fallback to warning if key is missing
const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY') ?? '';

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        if (!STRIPE_SECRET_KEY) {
            throw new Error("Stripe Secret Key not configured in Edge Function Env.");
        }

        const stripe = new Stripe(STRIPE_SECRET_KEY, {
            apiVersion: '2023-10-16',
            httpClient: Stripe.createFetchHttpClient(),
        });

        const { trackId, productId, productName, amount, type, roomName, bookingDate, userId } = await req.json();

        const metadata: Record<string, string> = {};
        if (trackId) metadata.trackId = trackId;
        if (productId) metadata.productId = productId;
        if (productName) metadata.productName = productName;
        if (type) metadata.type = type;
        if (roomName) metadata.roomName = roomName;
        if (bookingDate) metadata.bookingDate = bookingDate;
        if (userId) metadata.userId = userId;

        // In a real app we would apply a transfer_data split (85/10/5) destination
        // to the connected artist account here.
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // convert to pence
            currency: 'gbp',
            metadata
        });

        return new Response(
            JSON.stringify({ clientSecret: paymentIntent.client_secret }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    } catch (error: any) {
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
})
