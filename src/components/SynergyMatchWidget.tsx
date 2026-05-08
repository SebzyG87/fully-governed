import { useState } from "react";
import { Sparkles, Loader2, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

interface Profile {
  user_id: string;
  full_name: string;
  genre: string | null;
  artist_role: string | null;
  bio: string | null;
  in_building: boolean | null;
  avatar_url: string | null;
}

interface Match {
  profile: Profile;
  score: number;
  reasons: string[];
}

const GENRE_COMPATIBILITY: Record<string, string[]> = {
  "Hip Hop / Rap": ["UK Drill", "Grime", "R&B / Soul", "Afrobeats"],
  "UK Drill": ["Hip Hop / Rap", "Grime", "R&B / Soul"],
  "Grime": ["UK Drill", "Hip Hop / Rap", "Electronic"],
  "Afrobeats": ["R&B / Soul", "Hip Hop / Rap", "Reggae"],
  "R&B / Soul": ["Hip Hop / Rap", "Afrobeats", "Pop", "Jazz"],
  "Electronic": ["House", "Grime", "Pop"],
  "House": ["Electronic", "Reggae"],
  "Reggae": ["Afrobeats", "R&B / Soul"],
  "Pop": ["R&B / Soul", "Electronic"],
  "Jazz": ["R&B / Soul"],
  "Gospel": ["R&B / Soul"],
};

const ROLE_SYNERGY: Record<string, string[]> = {
  Vocalist: ["Producer", "Engineer", "Songwriter", "Rapper"],
  Producer: ["Vocalist", "Rapper", "Songwriter"],
  Engineer: ["Vocalist", "Rapper", "Producer"],
  Rapper: ["Producer", "Vocalist", "Engineer", "Songwriter"],
  Songwriter: ["Vocalist", "Producer"],
  DJ: ["Vocalist", "Producer", "Rapper"],
  Videographer: ["Artist", "Rapper", "Vocalist", "Producer"],
  "Graphic Designer": ["Artist", "Rapper", "Vocalist", "Producer"],
};

const calcScore = (mine: Profile, other: Profile): { score: number; reasons: string[] } => {
  let score = 0;
  const reasons: string[] = [];

  if (other.in_building) {
    score += 25;
    reasons.push("Currently in the building");
  }
  if (mine.genre && other.genre) {
    if (mine.genre === other.genre) {
      score += 30;
      reasons.push(`Same genre: ${other.genre}`);
    } else if ((GENRE_COMPATIBILITY[mine.genre] || []).includes(other.genre)) {
      score += 18;
      reasons.push(`Complementary genre: ${other.genre}`);
    }
  }
  if (mine.artist_role && other.artist_role) {
    if ((ROLE_SYNERGY[mine.artist_role] || []).includes(other.artist_role)) {
      score += 28;
      reasons.push(`Complementary role: ${other.artist_role}`);
    } else if (mine.artist_role !== other.artist_role) {
      score += 5;
    }
  }
  if (other.bio && other.bio.length > 20) score += 5;

  return { score, reasons };
};

interface Props {
  artistUserId: string;
}

const SynergyMatchWidget = ({ artistUserId }: Props) => {
  const { profile } = useAuth();
  const [matches, setMatches] = useState<Match[] | null>(null);
  const [loading, setLoading] = useState(false);

  const handleMatch = async () => {
    setLoading(true);
    try {
      const { data: others } = await supabase
        .from("profiles")
        .select("user_id, full_name, genre, artist_role, bio, in_building, avatar_url")
        .neq("user_id", artistUserId)
        .limit(100);

      if (!others || others.length === 0) { setMatches([]); return; }

      const myProfile: Profile = {
        user_id: artistUserId,
        full_name: (profile as any)?.full_name || "",
        genre: (profile as any)?.genre || null,
        artist_role: (profile as any)?.artist_role || null,
        bio: (profile as any)?.bio || null,
        in_building: (profile as any)?.in_building || null,
        avatar_url: (profile as any)?.avatar_url || null,
      };

      const scored: Match[] = (others as Profile[])
        .map((p) => { const r = calcScore(myProfile, p); return { profile: p, ...r }; })
        .filter((m) => m.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 3);

      setMatches(scored);
    } catch {
      setMatches([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="font-bebas text-lg tracking-wider text-foreground">SYNERGY MATCH</span>
        </div>
        <Button size="sm" variant="outline" onClick={handleMatch} disabled={loading} className="text-xs font-barlow">
          {loading && <Loader2 className="w-3 h-3 animate-spin mr-1" />}
          {loading ? "Finding..." : "Find Matches"}
        </Button>
      </div>

      {matches === null ? (
        <p className="text-xs text-muted-foreground font-barlow">Find artists in the Fully Governed community who match your vibe.</p>
      ) : matches.length === 0 ? (
        <p className="text-xs text-muted-foreground font-barlow">No matches found yet — complete your profile with genre and role to get matched.</p>
      ) : (
        <div className="space-y-3">
          {matches.map((m) => (
            <div key={m.profile.user_id} className="flex items-start gap-3 p-3 bg-background/50 rounded-lg border border-border/50">
              {m.profile.avatar_url ? (
                <img src={m.profile.avatar_url} alt={m.profile.full_name} className="w-10 h-10 rounded-full object-cover shrink-0" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                  <Users className="w-4 h-4 text-primary" />
                </div>
              )}
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-bebas text-base text-foreground tracking-wider truncate">{m.profile.full_name}</p>
                  {m.profile.in_building && (
                    <span className="flex items-center gap-1 text-emerald-400 text-xs font-mono shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" /> IN BUILDING
                    </span>
                  )}
                </div>
                <p className="text-xs text-primary font-mono">{m.profile.artist_role || "Artist"} · {m.profile.genre || "Various"}</p>
                <div className="flex flex-wrap gap-1">
                  {m.reasons.map((r) => (
                    <span key={r} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-barlow">{r}</span>
                  ))}
                </div>
              </div>
              <span className="font-mono text-sm text-primary font-bold shrink-0">{m.score}%</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SynergyMatchWidget;
