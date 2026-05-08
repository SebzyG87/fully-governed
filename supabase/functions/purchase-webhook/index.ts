// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Stripe from 'https://esm.sh/stripe@14.14.0?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') as string, {
    apiVersion: '2023-10-16',
    httpClient: Stripe.createFetchHttpClient(),
})

const cryptoProvider = Stripe.createCryptoProvider()

serve(async (request) => {
    const signature = request.headers.get('Stripe-Signature')
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')

    try {
        if (!signature || !webhookSecret) {
            return new Response('Webhook secret not set', { status: 400 })
        }

        const body = await request.text()
        const event = await stripe.webhooks.constructEventAsync(
            body,
            signature,
            webhookSecret,
            undefined,
            cryptoProvider
        )

        if (event.type === 'payment_intent.succeeded') {
            const paymentIntent = event.data.object
            const { trackId, userId, type } = paymentIntent.metadata || {}
            const amountPence = paymentIntent.amount

            const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
            const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
            const supabase = createClient(supabaseUrl, supabaseServiceKey)

            if (type === 'booking' || !trackId) {
                // Booking payment — no purchase record needed, booking already saved
                return new Response(JSON.stringify({ received: true }), { status: 200 })
            }

            if (!userId) {
                return new Response(JSON.stringify({ received: true, note: 'No userId in metadata' }), { status: 200 })
            }

            // 1. Record purchase
            await supabase.from('purchases').insert({
                buyer_id: userId,
                item_id: trackId,
                item_type: 'digital_vinyl',
                amount_pence: amountPence,
                stripe_payment_intent_id: paymentIntent.id,
                status: 'completed',
            })

            // 2. Award loyalty points: 1pt per £1 spent (minimum 1pt)
            const pointsEarned = Math.max(1, Math.floor(amountPence / 100))
            await supabase.from('fg_loyalty_points').insert({
                user_id: userId,
                points: pointsEarned,
                reason: `Digital vinyl purchase`,
                source: 'purchase',
                reference_id: trackId,
            })

            // Update profile loyalty_points total
            const { data: cur } = await supabase
                .from('profiles')
                .select('loyalty_points')
                .eq('user_id', userId)
                .single()
            await supabase
                .from('profiles')
                .update({ loyalty_points: (cur?.loyalty_points || 0) + pointsEarned })
                .eq('user_id', userId)

            // 3. Decrement nft_copy_limit if track has a limited pressing
            const { data: track } = await supabase
                .from('music_tracks')
                .select('nft_copy_limit, is_nft')
                .eq('id', trackId)
                .single()

            if (track?.is_nft && track.nft_copy_limit && track.nft_copy_limit > 0) {
                await supabase
                    .from('music_tracks')
                    .update({ nft_copy_limit: track.nft_copy_limit - 1 })
                    .eq('id', trackId)
            }
        }

        return new Response(JSON.stringify({ received: true }), { status: 200 })
    } catch (err: any) {
        return new Response(
            JSON.stringify({ error: err.message }),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
        )
    }
})
