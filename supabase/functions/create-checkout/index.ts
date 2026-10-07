// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from "../_shared/cors.ts"
import Stripe from 'https://esm.sh/stripe@14.14.0?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY') ?? '';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') ?? Deno.env.get('SUPABASE_PUBLISHABLE_KEY') ?? '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        if (!STRIPE_SECRET_KEY || !SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_ROLE_KEY) {
            return json({ error: "Checkout is not configured." }, 503);
        }

        const authorization = req.headers.get('Authorization');
        if (!authorization) return json({ error: "Sign in to continue." }, 401);

        const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
            global: { headers: { Authorization: authorization } },
        });
        const { data: { user }, error: authError } = await userClient.auth.getUser();
        if (authError || !user) return json({ error: "Your session has expired. Sign in again." }, 401);

        const database = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

        const stripe = new Stripe(STRIPE_SECRET_KEY, {
            apiVersion: '2023-10-16',
            httpClient: Stripe.createFetchHttpClient(),
        });

        const { trackId, productId, type } = await req.json();

        if (Boolean(trackId) === Boolean(productId)) {
            return json({ error: "Choose one valid checkout item." }, 400);
        }

        let amount = 0;
        let productName = "";
        let metadataType = "";

        if (trackId) {
            const { data: track, error } = await database
                .from('music_tracks')
                .select('id, title, price, status, user_id')
                .eq('id', trackId)
                .eq('status', 'published')
                .maybeSingle();
            if (error || !track) return json({ error: "This release is not available for purchase." }, 404);
            amount = Number(track.price);
            productName = track.title;
            metadataType = 'digital_vinyl';
        } else {
            if (type && type !== 'clothing') return json({ error: "Unsupported product type." }, 400);
            const { data: product, error } = await database
                .from('clothing_products')
                .select('id, name, base_price, status, user_id')
                .eq('id', productId)
                .eq('status', 'published')
                .maybeSingle();
            if (error || !product) return json({ error: "This product is not available for purchase." }, 404);
            amount = Number(product.base_price);
            productName = product.name;
            metadataType = 'clothing';
        }

        if (!Number.isFinite(amount) || amount <= 0) {
            return json({ error: "This item does not have an approved price." }, 400);
        }

        const { data: profile } = await database
            .from('profiles')
            .select('loyalty_points')
            .eq('user_id', user.id)
            .maybeSingle();
        const points = Number(profile?.loyalty_points ?? 0);
        const discount = points >= 1000 ? 0.15 : points >= 500 ? 0.10 : points >= 100 ? 0.05 : 0;
        const finalAmount = Math.round(amount * (1 - discount) * 100);
        if (!Number.isSafeInteger(finalAmount) || finalAmount <= 0) {
            return json({ error: "This item has an invalid price." }, 400);
        }

        const metadata: Record<string, string> = {
            userId: user.id,
            productName,
            type: metadataType,
        };
        if (trackId) metadata.trackId = trackId;
        if (productId) metadata.productId = productId;

        const paymentIntent = await stripe.paymentIntents.create({
            amount: finalAmount,
            currency: 'gbp',
            metadata
        });

        return json({ clientSecret: paymentIntent.client_secret, amount: finalAmount / 100 });
    } catch (error: any) {
        console.error('Create checkout error:', error);
        return json({ error: "Checkout could not be started." }, 500);
    }
})

function json(body: unknown, status = 200) {
    return new Response(JSON.stringify(body), {
        status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
}
