import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { User, Music, Instagram, ExternalLink, UserPlus, UserMinus, MessageCircle, Share2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SynergyMatchWidget from "@/components/SynergyMatchWidget";
import { Skeleton } from "@/components/ui/skeleton";
import PointTipping from "@/components/PointTipping";
import ShareProfileDialog from "@/components/ShareProfileDialog";
import ArtistStorefront from "@/components/ArtistStorefront";

interface ArtistData {
  id: string;
  user_id: string;
  full_name: string;
  bio: string | null;
  genre: string | null;
  artist_role: string | null;
  avatar_url: string | null;
  instagram: string | null;
  spotify: string | null;
  soundcloud: string | null;
  youtube: string | null;
  tiktok: string | null;
  in_building: boolean | null;
}

const ArtistProfile = () => {
  const { username } = useParams<{ username: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const [artist, setArtist] = useState<ArtistData | null>(null);
  const [loading, setLoading] = useState(true);
  const [followerCount, setFollowerCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    const fetchArtist = async () => {
      // Search by full_name (URL-friendly)
      const { data } = await supabase.from("profiles").select("*").ilike("full_name", username?.replace(/-/g, " ") || "").limit(1);
      if (data && data.length > 0) {
        const a = data[0] as ArtistData;
        setArtist(a);

        // Follower count
        const { count } = await supabase.from("follows").select("id", { count: "exact", head: true }).eq("following_id", a.user_id);
        setFollowerCount(count || 0);

        // Check if current user follows
        if (user) {
          const { data: followData } = await supabase.from("follows").select("id").eq("follower_id", user.id).eq("following_id", a.user_id).limit(1);
          setIsFollowing((followData || []).length > 0);
        }
      }
      setLoading(false);
    };
    fetchArtist();
  }, [username, user]);

  const toggleFollow = async () => {
    if (!user || !artist) return;
    if (isFollowing) {
      await supabase.from("follows").delete().eq("follower_id", user.id).eq("following_id", artist.user_id);
      setIsFollowing(false);
      setFollowerCount(c => c - 1);
    } else {
      await supabase.from("follows").insert({ follower_id: user.id, following_id: artist.user_id } as any);
      setIsFollowing(true);
      setFollowerCount(c => c + 1);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container pt-24 pb-16 max-w-2xl mx-auto space-y-6">
          <Skeleton className="h-32 w-32 rounded-full mx-auto" />
          <Skeleton className="h-8 w-48 mx-auto" />
          <Skeleton className="h-4 w-64 mx-auto" />
        </div>
      </div>
    );
  }

  if (!artist) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container pt-24 pb-16 text-center">
          <User className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="font-bebas text-3xl text-foreground tracking-wider">ARTIST NOT FOUND</h1>
        </div>
        <Footer />
      </div>
    );
  }

  const socials = [
    { url: artist.instagram ? `https://instagram.com/${artist.instagram}` : null, label: "Instagram", icon: Instagram },
    { url: artist.spotify ? `https://open.spotify.com/artist/${artist.spotify}` : null, label: "Spotify", icon: Music },
    { url: artist.soundcloud ? `https://soundcloud.com/${artist.soundcloud}` : null, label: "SoundCloud", icon: ExternalLink },
    { url: artist.youtube ? `https://youtube.com/@${artist.youtube}` : null, label: "YouTube", icon: ExternalLink },
    { url: artist.tiktok ? `https://tiktok.com/@${artist.tiktok}` : null, label: "TikTok", icon: ExternalLink },
  ].filter(s => s.url);

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navbar />
      <div className="grain-overlay" />
      <div className="container pt-24 pb-16 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-4">
          <div className="relative inline-block">
            {artist.avatar_url ? (
              <img src={artist.avatar_url} alt={artist.full_name} className="w-32 h-32 rounded-full object-cover border-4 border-primary" />
            ) : (
              <div className="w-32 h-32 rounded-full bg-secondary flex items-center justify-center border-4 border-primary">
                <User className="w-16 h-16 text-muted-foreground" />
              </div>
            )}
            {artist.in_building && (
              <span className="absolute bottom-2 right-2 w-4 h-4 rounded-full bg-emerald-500 border-2 border-background" title="In the building now" />
            )}
          </div>

          <h1 className="font-bebas text-4xl md:text-5xl text-foreground tracking-wider">{artist.full_name.toUpperCase()}</h1>

          <div className="flex items-center justify-center gap-4 text-sm">
            {artist.artist_role && <span className="text-primary font-mono">{artist.artist_role}</span>}
            {artist.genre && <span className="text-muted-foreground font-mono">🎵 {artist.genre}</span>}
            <span className="text-muted-foreground font-mono">{followerCount} followers</span>
          </div>

          {artist.bio && <p className="text-muted-foreground font-barlow max-w-md mx-auto">{artist.bio}</p>}

          {user && user.id !== artist.user_id && (
            <div className="flex items-center justify-center gap-3">
              <Button onClick={toggleFollow} variant={isFollowing ? "outline" : "default"} className="font-bebas tracking-wider">
                {isFollowing ? <><UserMinus className="w-4 h-4 mr-1" />UNFOLLOW</> : <><UserPlus className="w-4 h-4 mr-1" />FOLLOW</>}
              </Button>
              <PointTipping targetUserId={artist.user_id} targetUserName={artist.full_name} />

              <ShareProfileDialog
                url={`/artist/${artist.full_name.replace(/\s+/g, '-').toLowerCase()}`}
                title={artist.full_name}
                triggerContext={
                  <Button variant="outline" size="icon" className="shrink-0"><Share2 className="w-5 h-5" /></Button>
                }
              />
            </div>
          )}

          {socials.length > 0 && (
            <div className="flex items-center justify-center gap-4 pt-4">
              {socials.map((s) => (
                <a key={s.label} href={s.url!} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-interactive transition-colors" aria-label={s.label}>
                  <s.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          )}

          <div className="pt-6 border-t border-border mt-10">
            <SynergyMatchWidget artistUserId={artist.user_id} />
          </div>

          <ArtistStorefront userId={artist.user_id} />
        </motion.div>
      </div>
      <Footer />
    </div>
  );
};

export default ArtistProfile;
