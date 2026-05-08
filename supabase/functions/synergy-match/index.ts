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
    const { artistUserId } = await req.json();

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get the target artist profile
    const { data: artist } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", artistUserId)
      .single();

    if (!artist) throw new Error("Artist not found");

    // Get other active profiles for matching
    const { data: others } = await supabase
      .from("profiles")
      .select("full_name, genre, artist_role, bio, in_building")
      .neq("user_id", artistUserId)
      .limit(50);

    const othersList = (others || [])
      .map((p) => `- ${p.full_name} (${p.artist_role || "artist"}, genre: ${p.genre || "unknown"})${p.in_building ? " [IN BUILDING]" : ""}${p.bio ? `: ${p.bio.slice(0, 80)}` : ""}`)
      .join("\n");

    const prompt = `You are SynergyMatch, an AI matchmaker for a music studio community called Fully Governed in Lewisham, London.

Given this artist profile:
- Name: ${artist.full_name}
- Role: ${artist.artist_role || "artist"}
- Genre: ${artist.genre || "not specified"}
- Bio: ${artist.bio || "no bio"}

And these community members:
${othersList || "No other members found."}

Suggest up to 3 potential collaborators with a brief reason why they'd work well together. Focus on genre compatibility, complementary skills (e.g. producer + vocalist), and if they're currently in the building. Keep each suggestion to 1-2 sentences. Format as a numbered list.

If no good matches exist, say so honestly.`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 500,
      }),
    });

    const aiData = await aiResponse.json();
    const suggestions = aiData.choices?.[0]?.message?.content || "No suggestions available at this time.";

    return new Response(
      JSON.stringify({ suggestions, artistName: artist.full_name }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
