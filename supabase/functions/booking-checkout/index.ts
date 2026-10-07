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
  const anonKey         = Deno.env.get("SUPABASE_ANON_KEY") ?? Deno.env.get("SUPABASE_PUBLISHABLE_KEY");

  if (!stripeSecretKey) {
    return new Response(
      JSON.stringify({ error: "Stripe not configured. STRIPE_SECRET_KEY is not set." }),
      { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const authorization = req.headers.get("Authorization");
  if (!authorization || !anonKey) {
    return new Response(
      JSON.stringify({ error: "A signed-in account is required to start checkout." }),
      { status: authorization ? 503 : 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const {
      booking_id,
      payment_type = "deposit", // "deposit" | "full" | "balance"
      amount_pence,              // amount in pence (e.g. 4000 = £40)
    } = await req.json();

    if (!booking_id || !amount_pence || !["deposit", "full", "balance"].includes(payment_type)) {
      return new Response(
        JSON.stringify({ error: "booking_id and amount_pence are required." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const stripe = new Stripe(stripeSecretKey, { apiVersion: "2023-10-16", httpClient: Stripe.createFetchHttpClient() });
    const supabase = createClient(supabaseUrl, serviceKey);
    const userClient = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authorization } } });
    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Your session has expired. Please sign in again." }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select("id, user_id, status, total_amount, deposit_amount, outstanding_balance, rooms(name)")
      .eq("id", booking_id)
      .maybeSingle();

    if (bookingError || !booking) {
      return new Response(JSON.stringify({ error: "Booking not found." }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (booking.user_id !== user.id) {
      return new Response(JSON.stringify({ error: "You can only pay for your own booking." }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (booking.status !== "pending_payment") {
      return new Response(JSON.stringify({ error: "This booking is no longer awaiting payment." }), {
        status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const dueAmount = payment_type === "full"
      ? Number(booking.total_amount)
      : payment_type === "balance"
        ? Number(booking.outstanding_balance)
        : Number(booking.deposit_amount);
    const dueAmountPence = Math.round(dueAmount * 100);
    if (!Number.isFinite(dueAmountPence) || dueAmountPence <= 0 || Math.round(Number(amount_pence)) !== dueAmountPence) {
      return new Response(JSON.stringify({ error: "The amount does not match the saved booking." }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const room = Array.isArray(booking.rooms) ? booking.rooms[0] : booking.rooms;
    const roomName = room?.name ?? "Studio booking";

    const session = await stripe.checkout.sessions.create({
      mode:              "payment",
      payment_method_types: ["card"],
      customer_email:    user.email ?? undefined,
      line_items: [
        {
          price_data: {
            currency:     "gbp",
          unit_amount:  dueAmountPence,
          product_data: { name: `${roomName} booking` },
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
    const { error: updateError } = await supabase
      .from("bookings")
      .update({
        payment_provider:     "stripe",
        payment_provider_ref: session.id,
      })
      .eq("id", booking_id);

    if (updateError) {
      await stripe.checkout.sessions.expire(session.id);
      throw updateError;
    }

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
