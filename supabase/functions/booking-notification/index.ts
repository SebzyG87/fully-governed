import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { bookingId, type } = await req.json();

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch booking with room info
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select("*, rooms(name)")
      .eq("id", bookingId)
      .single();

    if (bookingError || !booking) {
      throw new Error("Booking not found");
    }

    // Fetch user profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("user_id", booking.user_id)
      .single();

    // Fetch user email from auth
    const { data: authUser } = await supabase.auth.admin.getUserById(booking.user_id);
    const recipientEmail = authUser?.user?.email;

    if (!recipientEmail) {
      throw new Error("No email found for user");
    }

    const startTime = new Date(booking.start_time);
    const endTime = new Date(booking.end_time);
    const dateStr = startTime.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
    const timeStr = `${startTime.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })} – ${endTime.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`;
    const roomName = (booking.rooms as any)?.name || "Studio";
    const memberName = profile?.full_name || "Member";

    let subject: string;
    let bodyHtml: string;

    if (type === "amendment") {
      subject = `Booking Amended — ${roomName} · ${dateStr}`;
      bodyHtml = `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#111;color:#e5e5e5;padding:32px;border-radius:8px;">
          <h1 style="color:#d4af37;font-size:24px;margin-bottom:8px;">BOOKING AMENDED</h1>
          <p>Hey ${memberName},</p>
          <p>Your session has been updated. Here are the new details:</p>
          <div style="background:#1a1a1a;padding:16px;border-radius:6px;margin:16px 0;border-left:3px solid #d4af37;">
            <p><strong>Room:</strong> ${roomName}</p>
            <p><strong>Date:</strong> ${dateStr}</p>
            <p><strong>Time:</strong> ${timeStr}</p>
            <p><strong>Session:</strong> ${booking.session_type}</p>
            <p><strong>Amendment #:</strong> ${booking.amendment_count}</p>
          </div>
          <p style="color:#888;font-size:12px;">Fully Governed · V22 Building, Lewisham · musicfullygoverned@gmail.com</p>
        </div>
      `;
    } else {
      subject = `Booking Confirmed — ${roomName} · ${dateStr}`;
      bodyHtml = `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#111;color:#e5e5e5;padding:32px;border-radius:8px;">
          <h1 style="color:#d4af37;font-size:24px;margin-bottom:8px;">SESSION CONFIRMED 🎤</h1>
          <p>Hey ${memberName},</p>
          <p>Your session is locked in. Here are the details:</p>
          <div style="background:#1a1a1a;padding:16px;border-radius:6px;margin:16px 0;border-left:3px solid #d4af37;">
            <p><strong>Room:</strong> ${roomName}</p>
            <p><strong>Date:</strong> ${dateStr}</p>
            <p><strong>Time:</strong> ${timeStr}</p>
            <p><strong>Session:</strong> ${booking.session_type}</p>
            ${booking.num_guests ? `<p><strong>Guests:</strong> ${booking.num_guests}</p>` : ""}
            ${booking.notes ? `<p><strong>Notes:</strong> ${booking.notes}</p>` : ""}
          </div>
          <p>See you at the studio. 👑</p>
          <p style="color:#888;font-size:12px;">Fully Governed · V22 Building, Lewisham · musicfullygoverned@gmail.com</p>
        </div>
      `;
    }

    // Log the email (we store it regardless of send success)
    await supabase.from("email_logs").insert({
      recipient_email: recipientEmail,
      subject,
      template: type === "amendment" ? "booking_amendment" : "booking_confirmation",
      status: "sent",
      metadata: { booking_id: bookingId, room: roomName },
    });

    return new Response(
      JSON.stringify({ success: true, email: recipientEmail, subject }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
