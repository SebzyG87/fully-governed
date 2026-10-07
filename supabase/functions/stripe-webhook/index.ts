// Stripe Webhook Handler — Fully Governed
// Processes Stripe events and updates booking payment state in Supabase.
// Deploy: supabase functions deploy stripe-webhook
// Register in Stripe Dashboard: https://dashboard.stripe.com/webhooks
// Endpoint: https://<project>.supabase.co/functions/v1/stripe-webhook

// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.14.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const stripeSecretKey    = Deno.env.get("STRIPE_SECRET_KEY");
  const webhookSecret      = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  const supabaseUrl        = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  if (!stripeSecretKey || !webhookSecret) {
    console.warn("Stripe not configured. Skipping webhook.");
    return new Response(JSON.stringify({ ok: true, skipped: "not_configured" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const stripe   = new Stripe(stripeSecretKey, { apiVersion: "2023-10-16", httpClient: Stripe.createFetchHttpClient() });
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const body      = await req.text();
  const signature = req.headers.get("stripe-signature") ?? "";

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return new Response(JSON.stringify({ error: "Invalid signature" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  console.log("Stripe event received:", event.type, event.id);

  try {
    switch (event.type) {

      // ── Checkout session completed (deposit or full payment) ──────────────
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const bookingId = session.metadata?.booking_id;
        const paymentType = session.metadata?.payment_type ?? "full"; // "deposit" | "full"

        if (!bookingId) {
          console.warn("checkout.session.completed: no booking_id in metadata");
          break;
        }

        const amountPaid  = (session.amount_total ?? 0) / 100;
        const newStatus   = paymentType === "deposit" ? "deposit_paid" : "paid";

        await supabase
          .from("bookings")
          .update({
            payment_status:       newStatus,
            payment_provider:     "stripe",
            payment_provider_ref: session.id,
            deposit_amount:       paymentType === "deposit" ? amountPaid : undefined,
            total_amount:         paymentType === "full"    ? amountPaid : undefined,
            status:               paymentType === "deposit" ? "deposit_paid" : "confirmed",
          })
          .eq("id", bookingId);

        // Queue confirmation email
        await supabase.from("fg_email_queue").insert({
          template_key:       paymentType === "deposit" ? "deposit_confirmation" : "booking_confirmation",
          recipient_email:    session.customer_details?.email ?? "",
          booking_id:         bookingId,
          payload:            { booking_id: bookingId, amount: amountPaid, payment_type: paymentType },
          status:             "pending",
        });

        console.log(`Updated booking ${bookingId} → ${newStatus}`);
        break;
      }

      // ── Payment intent failed ─────────────────────────────────────────────
      case "payment_intent.payment_failed": {
        const intent    = event.data.object as Stripe.PaymentIntent;
        const bookingId = intent.metadata?.booking_id;

        if (bookingId) {
          await supabase
            .from("bookings")
            .update({ payment_status: "failed" })
            .eq("id", bookingId);
        }
        break;
      }

      // ── Charge refunded ───────────────────────────────────────────────────
      case "charge.refunded": {
        const charge    = event.data.object as Stripe.Charge;
        const bookingId = charge.metadata?.booking_id;

        if (bookingId) {
          const isPartial = (charge.amount_refunded ?? 0) < (charge.amount ?? 0);
          await supabase
            .from("bookings")
            .update({ refund_status: isPartial ? "partially_refunded" : "refunded" })
            .eq("id", bookingId);
        }
        break;
      }

      default:
        console.log("Unhandled event type:", event.type);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("Error processing webhook:", err);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
