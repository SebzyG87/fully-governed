// Email Sender — Fully Governed (Resend provider)
// Processes pending items from fg_email_queue and sends via Resend.
// Deploy: supabase functions deploy send-email
// Trigger: call from a cron job or after booking lifecycle events.
//
// Required env vars in Supabase project settings:
//   RESEND_API_KEY      — from resend.com dashboard
//   EMAIL_FROM_ADDRESS  — e.g. bookings@fullygoverned.co.uk
//   EMAIL_FROM_NAME     — e.g. Fully Governed Studio

// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ── Email templates ─────────────────────────────────────────────────────────
// Each template receives the row's `payload` JSON object.
// Return { subject, html } for the rendered email.
function renderTemplate(templateKey: string, payload: Record<string, unknown>): { subject: string; html: string } | null {
  const studioName = "Fully Governed Studio";

  switch (templateKey) {
    case "booking_confirmation":
      return {
        subject: `Booking confirmed — ${studioName}`,
        html: `<p>Your booking is confirmed. Reference: <strong>${payload.booking_id ?? "—"}</strong></p>
               <p>Thank you for booking with ${studioName}.</p>`,
      };
    case "deposit_confirmation":
      return {
        subject: `Deposit received — ${studioName}`,
        html: `<p>We received your deposit of £${payload.amount ?? "—"}. Your session is held.</p>
               <p>Balance due will be confirmed closer to your session date.</p>`,
      };
    case "session_reminder":
      return {
        subject: `Session reminder — ${studioName}`,
        html: `<p>Just a reminder: your session is coming up soon.</p>
               <p>Please arrive on time. Session time starts at your booked slot regardless of arrival.</p>`,
      };
    case "session_started":
      return {
        subject: `Your session has started — ${studioName}`,
        html: `<p>Your session is now in progress. The clock is running from your booked start time.</p>`,
      };
    case "session_completed":
      return {
        subject: `Session complete — ${studioName}`,
        html: `<p>Your session is complete. Thank you for visiting ${studioName}.</p>
               <p>We hope to see you again soon.</p>`,
      };
    case "late_no_show_warning":
      return {
        subject: `Session time is running — ${studioName}`,
        html: `<p>Your booked session time has started. If you are not present, session time is still running and your deposit is in use.</p>
               <p>Please contact us immediately if you have been delayed.</p>`,
      };
    case "producer_assignment":
      return {
        subject: `You have been assigned a session — ${studioName}`,
        html: `<p>You have been assigned as session producer for booking ${payload.booking_id ?? "—"}.</p>
               <p>Please check your producer dashboard for details.</p>`,
      };
    case "cleaner_assignment":
      return {
        subject: `Cleaning task assigned — ${studioName}`,
        html: `<p>A room turnaround task has been assigned to you for booking ${payload.booking_id ?? "—"}.</p>
               <p>Please check your cleaner dashboard for the checklist and time window.</p>`,
      };
    case "verification_required":
      return {
        subject: `Verification required for your booking — ${studioName}`,
        html: `<p>Your upcoming session requires identity verification before you can be checked in.</p>
               <p>Please complete verification through your client dashboard.</p>`,
      };
    case "admin_alert":
      return {
        subject: `Admin alert — ${studioName}`,
        html: `<p>An admin alert was triggered: ${payload.message ?? "No message."}</p>`,
      };
    case "payment_reminder":
      return {
        subject: `Balance due — ${studioName}`,
        html: `<p>You have an outstanding balance of £${payload.balance ?? "—"} for your upcoming session.</p>
               <p>Please contact us to arrange payment.</p>`,
      };
    default:
      return null;
  }
}

// ── Main handler ─────────────────────────────────────────────────────────────
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const resendApiKey  = Deno.env.get("RESEND_API_KEY");
  const fromAddress   = Deno.env.get("EMAIL_FROM_ADDRESS") ?? "noreply@fullygoverned.co.uk";
  const fromName      = Deno.env.get("EMAIL_FROM_NAME")    ?? "Fully Governed Studio";
  const supabaseUrl   = Deno.env.get("SUPABASE_URL")!;
  const serviceKey    = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  const supabase = createClient(supabaseUrl, serviceKey);

  if (!resendApiKey) {
    console.warn("RESEND_API_KEY not set. Email sending is not configured.");
    return new Response(JSON.stringify({ ok: true, skipped: "not_configured" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Fetch pending emails due to be sent
  const { data: pending, error: fetchError } = await supabase
    .from("fg_email_queue")
    .select("*")
    .eq("status", "pending")
    .lte("send_after", new Date().toISOString())
    .order("created_at", { ascending: true })
    .limit(20);

  if (fetchError) {
    console.error("Failed to fetch email queue:", fetchError);
    return new Response(JSON.stringify({ error: fetchError.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const results: Array<{ id: string; status: string }> = [];

  for (const item of (pending ?? [])) {
    const template = renderTemplate(item.template_key, (item.payload as Record<string, unknown>) ?? {});

    if (!template) {
      await supabase
        .from("fg_email_queue")
        .update({ status: "skipped", error_message: "No template found for key: " + item.template_key })
        .eq("id", item.id);
      results.push({ id: item.id, status: "skipped" });
      continue;
    }

    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from:    `${fromName} <${fromAddress}>`,
          to:      [item.recipient_email],
          subject: template.subject,
          html:    template.html,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        await supabase
          .from("fg_email_queue")
          .update({
            status:             "sent",
            sent_at:            new Date().toISOString(),
            provider_message_id: result.id ?? null,
            attempts:           (item.attempts ?? 0) + 1,
          })
          .eq("id", item.id);
        results.push({ id: item.id, status: "sent" });
      } else {
        await supabase
          .from("fg_email_queue")
          .update({
            status:        "failed",
            error_message: result.message ?? JSON.stringify(result),
            attempts:      (item.attempts ?? 0) + 1,
          })
          .eq("id", item.id);
        results.push({ id: item.id, status: "failed" });
      }
    } catch (err) {
      await supabase
        .from("fg_email_queue")
        .update({
          status:        "failed",
          error_message: String(err),
          attempts:      (item.attempts ?? 0) + 1,
        })
        .eq("id", item.id);
      results.push({ id: item.id, status: "error" });
    }
  }

  return new Response(JSON.stringify({ processed: results.length, results }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
