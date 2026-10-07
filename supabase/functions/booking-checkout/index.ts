// Booking Checkout — Fully Governed
// Creates a Stripe Checkout session for a booking deposit or full payment.
// Deploy: supabase functions deploy booking-checkout
//
// Required env vars:
//   STRIPE_SECRET_KEY        — from Stripe dashboard (keep server-side only)
//   STRIPE_WEBHOOK_SECRET    — from Stripe webhook endpoint settings
//   SUPABASE_SERVICE_ROLE_KEY — to update booking records
//   APP_URL                  — e.g. https://fullygoverned.co.uk (for redirect URLs)

// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.14.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
  const appUrl          = Deno.env.get("APP_URL") ?? "http://localhost:5173";
  const supabaseUrl     = Deno.env.get("SUPABASE_URL")!;
  const serviceKey      = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  if (!stripeSecretKey) {
    return new Response(
      JSON.stringify({ error: "Stripe not configured. STRIPE_SECRET_KEY is not set." }),
      { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const {
      booking_id,
      payment_type = "deposit", // "deposit" | "full" | "balance"
      amount_pence,              // amount in pence (e.g. 4000 = £40)
      line_item_name,
      customer_email,
    } = await req.json();

    if (!booking_id || !amount_pence) {
      return new Response(
        JSON.stringify({ error: "booking_id and amount_pence are required." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const stripe   = new Stripe(stripeSecretKey, { apiVersion: "2023-10-16", httpClient: Stripe.createFetchHttpClient() });
    const supabase = createClient(supabaseUrl, serviceKey);

    const session = await stripe.checkout.sessions.create({
      mode:              "payment",
      payment_method_types: ["card"],
      customer_email:    customer_email ?? undefined,
      line_items: [
        {
          price_data: {
            currency:     "gbp",
            unit_amount:  Math.round(amount_pence),
            product_data: { name: line_item_name ?? "Studio booking" },
          },
          quantity: 1,
        },
      ],
      metadata: {
        booking_id,
        payment_type,
      },
      success_url: `${appUrl}/dashboard/client?payment=success&booking=${booking_id}`,
      cancel_url:  `${appUrl}/dashboard/client?payment=cancelled&booking=${booking_id}`,
    });

    // Mark booking as pending checkout
    await supabase
      .from("bookings")
      .update({
        payment_provider:     "stripe",
        payment_provider_ref: session.id,
      })
      .eq("id", booking_id);

    return new Response(
      JSON.stringify({ checkout_url: session.url, session_id: session.id }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err) {
    console.error("Booking checkout error:", err);
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
