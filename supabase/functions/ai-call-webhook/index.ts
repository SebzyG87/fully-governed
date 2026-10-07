// AI Call Webhook — Fully Governed
// Receives call events from the AI phone provider and logs them to fg_ai_call_logs.
// Deploy: supabase functions deploy ai-call-webhook
// Register as the webhook URL in your AI provider dashboard.
//
// Required env vars (set in Supabase Dashboard → Edge Functions):
//   AI_PHONE_PROVIDER      — e.g. "bland_ai" | "vapi" | "retell_ai"
//   AI_WEBHOOK_SECRET      — shared secret to verify provider requests
//   SUPABASE_SERVICE_ROLE_KEY — to write call logs

// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-webhook-secret",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const webhookSecret  = Deno.env.get("AI_WEBHOOK_SECRET");
  const providerName   = Deno.env.get("AI_PHONE_PROVIDER") ?? "unknown";
  const supabaseUrl    = Deno.env.get("SUPABASE_URL")!;
  const serviceKey     = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  // Verify shared secret if configured
  if (webhookSecret) {
    const receivedSecret = req.headers.get("x-webhook-secret") ?? req.headers.get("x-bland-api-key") ?? "";
    if (receivedSecret !== webhookSecret) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  }

  const supabase = createClient(supabaseUrl, serviceKey);
  const body     = await req.json();

  console.log("AI call event received from", providerName, JSON.stringify(body));

  // Normalise call data across providers
  // Each provider sends different shapes — adapt as needed per provider docs.
  const callLog = {
    ai_provider:   providerName,
    caller_number: body.from_number ?? body.caller ?? body.from ?? null,
    call_type:     body.call_type ?? (body.direction === "inbound" ? "inbound" : "outbound") ?? "inbound",
    call_summary:  body.summary ?? body.call_summary ?? null,
    transcript:    body.transcript ?? body.concatenated_transcript ?? null,
    duration_seconds: body.call_length ?? body.duration ?? null,
    started_at:    body.started_at ?? body.created_at ?? null,
    ended_at:      body.ended_at ?? body.completed_at ?? null,
    booking_enquiry_status: body.booking_status ?? "none",
  };

  const { error } = await supabase.from("fg_ai_call_logs").insert(callLog);

  if (error) {
    console.error("Failed to log call:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // If it was a missed call with a booking enquiry, queue a follow-up email
  if (callLog.call_type === "inbound_missed" || (body.answered === false)) {
    await supabase.from("fg_email_queue").insert({
      template_key:    "admin_alert",
      recipient_email: Deno.env.get("ADMIN_ALERT_EMAIL") ?? "admin@fullygoverned.co.uk",
      payload: {
        message: `Missed call from ${callLog.caller_number ?? "unknown"} at ${new Date().toISOString()}`,
        call_summary: callLog.call_summary,
      },
      status: "pending",
    });
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
