import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MessageSquare, ThumbsUp, Share2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { formatDistanceToNow } from "date-fns";

interface FeedPost {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  post_type: string;
  genre: string | null;
  created_at: string;
  profile?: { full_name: string; in_building: boolean | null; artist_role: string | null };
}

const FILTERS = ["All", "Music", "Events", "Collab Requests"];

const typeMap: Record<string, string> = {
  "Looking For": "Collab Requests",
  "Available": "Music",
  "Announcement": "Events",
};

const SocialFeed = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    const fetchPosts = async () => {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 3600000).toISOString();
      const { data } = await supabase
        .from("collabo_posts")
        .select("*")
        .eq("status", "active")
        .gte("created_at", thirtyDaysAgo)
        .order("created_at", { ascending: false });

      const postsData = (data as FeedPost[]) || [];

      if (postsData.length > 0) {
        const userIds = [...new Set(postsData.map((p) => p.user_id))];
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, full_name, in_building, artist_role")
          .in("user_id", userIds);
        const profileMap = new Map((profiles || []).map((p: any) => [p.user_id, p]));
        postsData.forEach((p) => {
          p.profile = profileMap.get(p.user_id) || undefined;
        });
      }

      setPosts(postsData);
      setLoading(false);
    };
    fetchPosts();
  }, []);

  const filtered = filter === "All" ? posts : posts.filter((p) => typeMap[p.post_type] === filter);

  const handleShare = (post: FeedPost) => {
    const text = `${post.title} — via Fully Governed`;
    if (navigator.share) {
      navigator.share({ title: post.title, text });
    } else {
      navigator.clipboard.writeText(text);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navbar />
      <div className="grain-overlay" />
      <div className="container pt-24 pb-16 space-y-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <p className="font-mono text-xs tracking-[0.3em] text-primary mb-2 uppercase">Community</p>
          <h1 className="font-bebas text-5xl md:text-7xl text-foreground tracking-wider">SOCIAL FEED</h1>
          <p className="text-muted-foreground font-barlow mt-2 max-w-xl mx-auto">
            All member posts — session announcements, new releases, event promotion, collab requests.
          </p>
        </motion.div>

        {/* Filters */}
        <div className="flex gap-2 justify-center flex-wrap">
          {FILTERS.map((f) => (
            <Button
              key={f}
              size="sm"
              variant={filter === f ? "default" : "outline"}
              onClick={() => setFilter(f)}
              className="font-mono text-xs"
            >
              {f}
            </Button>
          ))}
        </div>

        {/* Posts */}
        <div className="max-w-2xl mx-auto space-y-4">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-28 w-full rounded-lg" />
            ))
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground font-barlow">No posts yet. Be the first to share something.</p>
            </div>
          ) : (
            filtered.map((post) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card border border-border rounded-lg p-5 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {post.profile?.in_building && (
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" title="In the Building Now" />
                    )}
                    <span className="font-bebas text-lg tracking-wider text-foreground">
                      {post.profile?.full_name || "Member"}
                    </span>
                    {post.profile?.artist_role && (
                      <span className="text-xs font-mono text-muted-foreground bg-accent rounded px-1.5 py-0.5">
                        {post.profile.artist_role}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground font-mono">
                    {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                  </span>
                </div>

                <div>
                  <span className="text-xs font-mono text-primary mr-2">{post.post_type}</span>
                  {post.genre && <span className="text-xs font-mono text-muted-foreground">#{post.genre}</span>}
                </div>

                <h3 className="font-bebas text-xl text-foreground tracking-wider">{post.title}</h3>
                {post.description && (
                  <p className="text-sm text-muted-foreground font-barlow">{post.description}</p>
                )}

                <div className="flex items-center gap-4 pt-1">
                  <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors">
                    <ThumbsUp className="w-3.5 h-3.5" /> React
                  </button>
                  <button
                    onClick={() => handleShare(post)}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Share2 className="w-3.5 h-3.5" /> Share
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default SocialFeed;
