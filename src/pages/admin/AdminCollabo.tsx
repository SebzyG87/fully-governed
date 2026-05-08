import { useEffect, useState } from "react";
import { Users, ChevronDown, ChevronUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

interface CollaboPost {
  id: string;
  title: string;
  description: string | null;
  post_type: string;
  genre: string | null;
  status: string;
  user_id: string;
  created_at: string;
  author_name?: string;
}

const filterOptions = ["all", "active", "removed"];

const AdminCollabo = () => {
  const { toast } = useToast();
  const [posts, setPosts] = useState<CollaboPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchPosts = async () => {
    const { data } = await supabase.from("collabo_posts").select("*").order("created_at", { ascending: false });
    const raw = (data || []) as CollaboPost[];
    if (raw.length > 0) {
      const userIds = [...new Set(raw.map(p => p.user_id))];
      const { data: profiles } = await supabase.from("profiles").select("user_id, full_name").in("user_id", userIds);
      const pMap = new Map((profiles || []).map((p: any) => [p.user_id, p.full_name]));
      setPosts(raw.map(p => ({ ...p, author_name: pMap.get(p.user_id) || "Unknown" })));
    } else {
      setPosts([]);
    }
    setLoading(false);
  };

  useEffect(() => { fetchPosts(); }, []);

  const setStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("collabo_posts").update({ status }).eq("id", id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: `Post ${status}` }); fetchPosts(); }
  };

  const filtered = posts.filter(p => filter === "all" || p.status === filter);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="font-bebas text-3xl text-foreground tracking-wider">COLLABO BOARD</h1>
        <p className="text-sm text-muted-foreground font-barlow">{posts.length} posts</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {filterOptions.map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1 rounded-full text-xs font-mono capitalize transition-colors ${filter === f ? "bg-interactive text-background" : "bg-card border border-border text-muted-foreground hover:text-foreground"}`}>
            {f === "all" ? `All (${posts.length})` : `${f} (${posts.filter(p => p.status === f).length})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-lg" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16"><Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" /><p className="text-muted-foreground">No posts found.</p></div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground font-mono text-xs">
                <th className="text-left py-3 px-2">Date</th>
                <th className="text-left py-3 px-2">Author</th>
                <th className="text-left py-3 px-2">Type</th>
                <th className="text-left py-3 px-2">Title</th>
                <th className="text-left py-3 px-2">Status</th>
                <th className="text-left py-3 px-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <>
                  <tr key={p.id} className="border-b border-border/50 hover:bg-accent/30 transition-colors cursor-pointer" onClick={() => setExpandedId(expandedId === p.id ? null : p.id)}>
                    <td className="py-3 px-2 font-mono text-muted-foreground">{formatDistanceToNow(new Date(p.created_at), { addSuffix: true })}</td>
                    <td className="py-3 px-2 text-foreground">{p.author_name}</td>
                    <td className="py-3 px-2 text-primary font-mono text-xs">{p.post_type}</td>
                    <td className="py-3 px-2 text-foreground">{p.title}</td>
                    <td className="py-3 px-2"><span className={`text-xs font-mono ${p.status === "active" ? "text-emerald-400" : p.status === "removed" ? "text-destructive" : "text-muted-foreground"}`}>{p.status}</span></td>
                    <td className="py-3 px-2" onClick={(e) => e.stopPropagation()}>
                      <div className="flex gap-2">
                        {p.status !== "removed" ? (
                          <Button variant="destructive" size="sm" onClick={() => setStatus(p.id, "removed")}>Remove</Button>
                        ) : (
                          <Button variant="outline" size="sm" onClick={() => setStatus(p.id, "active")}>Restore</Button>
                        )}
                      </div>
                    </td>
                  </tr>
                  {expandedId === p.id && p.description && (
                    <tr key={`${p.id}-desc`} className="border-b border-border/50">
                      <td colSpan={6} className="px-4 py-3 text-sm text-muted-foreground bg-accent/20">{p.description}</td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminCollabo;
