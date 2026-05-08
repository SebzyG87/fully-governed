import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Users, Plus, Search, Filter, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { formatDistanceToNow } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

interface CollaboPost {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  post_type: string;
  role?: string | null;
  genre: string | null;
  status: string;
  created_at: string;
  profile?: { full_name: string; in_building: boolean | null };
}

const POST_TYPES = ["Looking For", "Available", "Announcement"];
const ROLES = ["Vocalist", "Producer", "Engineer", "Rapper", "Songwriter", "DJ", "Videographer", "Graphic Designer", "Other"];
const GENRES = ["UK Drill", "Afrobeats", "Grime", "R&B / Soul", "Hip Hop / Rap", "House", "Electronic", "Reggae", "Gospel", "Pop", "Jazz", "Other"];

const typeColors: Record<string, string> = {
  "Looking For": "bg-primary/20 text-primary",
  "Available": "bg-emerald-500/20 text-emerald-400",
  "Announcement": "bg-room-content/20 text-room-content",
};

const roleColors: Record<string, string> = {
  "Vocalist": "bg-purple-500/20 text-purple-400",
  "Producer": "bg-cyan-500/20 text-cyan-400",
  "Engineer": "bg-amber-500/20 text-amber-400",
  "Rapper": "bg-rose-500/20 text-rose-400",
  "Songwriter": "bg-teal-500/20 text-teal-400",
  "DJ": "bg-blue-500/20 text-blue-400",
};

const Community = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [posts, setPosts] = useState<CollaboPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [postType, setPostType] = useState(POST_TYPES[0]);
  const [roleInput, setRoleInput] = useState("");
  const [genreInput, setGenreInput] = useState("");

  // Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [filterGenre, setFilterGenre] = useState("");

  const fetchPosts = async () => {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 3600000).toISOString();
    const { data } = await supabase
      .from("collabo_posts")
      .select("*")
      .eq("status", "active")
      .gte("created_at", thirtyDaysAgo)
      .order("created_at", { ascending: false });

    const postsData = (data as CollaboPost[]) || [];

    if (postsData.length > 0) {
      const userIds = [...new Set(postsData.map((p) => p.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name, in_building")
        .in("user_id", userIds);
      const profileMap = new Map((profiles || []).map((p: any) => [p.user_id, p]));
      postsData.forEach((p) => { p.profile = profileMap.get(p.user_id) || undefined; });
    }

    setPosts(postsData);
    setLoading(false);
  };

  useEffect(() => { fetchPosts(); }, []);

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      if (filterRole && (post as any).role !== filterRole) return false;
      if (filterGenre && post.genre !== filterGenre) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchTitle = post.title.toLowerCase().includes(q);
        const matchDesc = post.description?.toLowerCase().includes(q);
        const matchName = post.profile?.full_name?.toLowerCase().includes(q);
        if (!matchTitle && !matchDesc && !matchName) return false;
      }
      return true;
    });
  }, [posts, filterRole, filterGenre, searchQuery]);

  const handleCreate = async () => {
    if (!user || !title.trim()) return;
    const { error } = await supabase.from("collabo_posts").insert({
      user_id: user.id,
      title,
      description,
      post_type: postType,
      role: roleInput || null,
      genre: genreInput || null,
    } as any);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Post created! 🤝" });
      setShowCreate(false);
      setTitle("");
      setDescription("");
      setRoleInput("");
      setGenreInput("");
      fetchPosts();
    }
  };

  const clearFilters = () => {
    setFilterRole("");
    setFilterGenre("");
    setSearchQuery("");
  };

  const hasFilters = filterRole || filterGenre || searchQuery;

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navbar />
      <div className="grain-overlay" />
      <div className="container pt-24 pb-16 space-y-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <p className="font-mono text-xs tracking-[0.3em] text-primary mb-2 uppercase">Connect & Create</p>
          <h1 className="font-bebas text-5xl md:text-7xl text-foreground tracking-wider">COLLABO BOARD</h1>
          <p className="text-muted-foreground font-barlow mt-2 max-w-xl mx-auto">
            Find collaborators, session partners, and creative connections. Posts expire after 30 days.
          </p>
        </motion.div>

        {/* Search + Filters */}
        <div className="max-w-5xl mx-auto space-y-3">
          <div className="flex gap-3 flex-col sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search posts..."
                className="pl-9 bg-card"
              />
            </div>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="bg-card border border-border rounded-md px-3 py-2 text-foreground text-sm focus:border-interactive focus:outline-none transition-colors"
            >
              <option value="">All Roles</option>
              {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
            <select
              value={filterGenre}
              onChange={(e) => setFilterGenre(e.target.value)}
              className="bg-card border border-border rounded-md px-3 py-2 text-foreground text-sm focus:border-interactive focus:outline-none transition-colors"
            >
              <option value="">All Genres</option>
              {GENRES.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
            {hasFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground">
                <X className="w-4 h-4 mr-1" /> Clear
              </Button>
            )}
          </div>

          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground font-mono">
              {filteredPosts.length} {filteredPosts.length === 1 ? "post" : "posts"}
              {hasFilters ? " matching filters" : ""}
            </p>
            {user && (
              <Button onClick={() => setShowCreate(true)} className="font-bebas text-base tracking-wider">
                <Plus className="w-4 h-4 mr-1" /> POST A COLLAB
              </Button>
            )}
          </div>
        </div>

        {!user && (
          <div className="max-w-5xl mx-auto text-center">
            <Button onClick={() => setShowCreate(true)} className="font-bebas text-lg tracking-wider" disabled>
              <Plus className="w-5 h-5 mr-1" /> SIGN IN TO POST
            </Button>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-40 rounded-lg" />)}
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-16 max-w-5xl mx-auto">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground font-barlow text-lg">
              {hasFilters ? "No posts match your filters." : "No collabs posted yet — be the first!"}
            </p>
            {hasFilters && (
              <Button variant="outline" onClick={clearFilters} className="mt-4 font-bebas tracking-wider">
                CLEAR FILTERS
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {filteredPosts.map((post, i) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="bg-card border border-border rounded-lg p-5 space-y-3 hover:border-primary/30 transition-colors"
              >
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-xs font-mono px-2 py-0.5 rounded ${typeColors[post.post_type] || "bg-secondary text-secondary-foreground"}`}>
                    {post.post_type}
                  </span>
                  {(post as any).role && (
                    <span className={`text-xs font-mono px-2 py-0.5 rounded ${roleColors[(post as any).role] || "bg-secondary text-secondary-foreground"}`}>
                      {(post as any).role}
                    </span>
                  )}
                  <span className="text-xs text-muted-foreground font-mono ml-auto">
                    {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                  </span>
                </div>
                <h3 className="text-lg text-foreground font-bebas tracking-wider leading-tight">{post.title}</h3>
                {post.description && <p className="text-sm text-muted-foreground font-barlow line-clamp-2">{post.description}</p>}
                <div className="flex items-center justify-between pt-1">
                  {post.genre && <p className="text-xs text-primary font-mono">🎵 {post.genre}</p>}
                  {post.profile && (
                    <div className="flex items-center gap-1.5 ml-auto">
                      {post.profile.in_building && (
                        <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" title="In the building now" />
                      )}
                      <span className="text-xs text-muted-foreground font-barlow">{post.profile.full_name}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
      <Footer />

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="font-bebas text-2xl text-foreground tracking-wider">POST A COLLAB</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-muted-foreground">Post Type</Label>
              <select value={postType} onChange={(e) => setPostType(e.target.value)} className="w-full mt-1 bg-background border border-border rounded-md px-3 py-2 text-foreground text-sm focus:border-interactive focus:ring-1 focus:ring-interactive focus:outline-none transition-colors">
                {POST_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <Label className="text-muted-foreground">Role Needed / Your Role</Label>
              <select value={roleInput} onChange={(e) => setRoleInput(e.target.value)} className="w-full mt-1 bg-background border border-border rounded-md px-3 py-2 text-foreground text-sm focus:border-interactive focus:ring-1 focus:ring-interactive focus:outline-none transition-colors">
                <option value="">Select a role...</option>
                {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <Label className="text-muted-foreground">Title</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 bg-background" placeholder="e.g. Need a vocalist for Afrobeats track" />
            </div>
            <div>
              <Label className="text-muted-foreground">Description</Label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full mt-1 bg-background border border-border rounded-md px-3 py-2 text-foreground text-sm resize-none focus:border-interactive focus:ring-1 focus:ring-interactive focus:outline-none transition-colors" placeholder="Tell people what you're looking for..." />
            </div>
            <div>
              <Label className="text-muted-foreground">Genre</Label>
              <select value={genreInput} onChange={(e) => setGenreInput(e.target.value)} className="w-full mt-1 bg-background border border-border rounded-md px-3 py-2 text-foreground text-sm focus:border-interactive focus:ring-1 focus:ring-interactive focus:outline-none transition-colors">
                <option value="">Select genre...</option>
                {GENRES.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <Button onClick={handleCreate} disabled={!title.trim()} className="w-full font-bebas text-lg tracking-wider h-12">
              POST
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Community;
