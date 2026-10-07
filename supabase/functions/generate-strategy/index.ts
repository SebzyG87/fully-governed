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
    const { artistName, genre, currentFollowing, activePlatforms, biggestGoal, upcomingReleases, targetAudience, budget } = await req.json();

    const aiApiKey = Deno.env.get("AI_GATEWAY_API_KEY")!;
    const aiGatewayUrl = Deno.env.get("AI_GATEWAY_URL") ?? "https://openrouter.ai/api/v1/chat/completions";

    const prompt = `You are a music marketing strategist working for Fully Governed, a creative studio in Lewisham, London.

Generate a detailed, actionable 30-day marketing plan for this artist:

- Name: ${artistName}
- Genre: ${genre}
- Current Following: ${currentFollowing || "Not specified"}
- Active Platforms: ${activePlatforms || "Not specified"}
- Biggest Goal: ${biggestGoal || "Not specified"}
- Upcoming Releases: ${upcomingReleases || "None mentioned"}
- Target Audience: ${targetAudience || "Not specified"}
- Budget: ${budget || "Not specified"}

Structure the plan as:
## Week 1: Foundation
## Week 2: Content Push
## Week 3: Community Building
## Week 4: Momentum & Analysis

Each week should have 5-7 specific, actionable tasks. Include platform-specific tactics for their genre. Mention Fully Governed resources where relevant (studio sessions, street team, social hub, events). End with a summary of KPIs to track.`;

    const aiResponse = await fetch(aiGatewayUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${aiApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 2000,
      }),
    });

    const aiData = await aiResponse.json();
    const plan = aiData.choices?.[0]?.message?.content || "Unable to generate a plan at this time. Please try again.";

    return new Response(
      JSON.stringify({ plan }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
