import { useEffect, useState } from "react";
import { BookOpen, Plus, Pencil, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

interface HelpArticle {
  id: string;
  slug: string;
  title: string;
  category: string;
  content: string;
  status: string;
  created_at: string;
  updated_at: string;
}

const categories = ["booking", "studio", "equipment", "community", "account", "general"];

const AdminHelpCentre = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [articles, setArticles] = useState<HelpArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<HelpArticle | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: "", slug: "", category: "general", content: "", status: "draft" });

  const fetchArticles = async () => {
    const { data } = await supabase.from("help_articles").select("*").order("created_at", { ascending: false });
    setArticles((data as HelpArticle[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchArticles(); }, []);

  const handleSave = async () => {
    if (!form.title || !form.content) return;
    const slug = form.slug || form.title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

    if (editing) {
      // Save changelog
      await supabase.from("help_article_changelog").insert({
        article_id: editing.id,
        changed_by: user?.id || null,
        change_summary: "Updated via admin",
        previous_content: editing.content,
      } as any);

      const { error } = await supabase.from("help_articles").update({ ...form, slug, updated_at: new Date().toISOString() } as any).eq("id", editing.id);
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Article updated" });
    } else {
      const { error } = await supabase.from("help_articles").insert({ ...form, slug } as any);
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Article created" });
    }
    setEditing(null); setShowAdd(false); setForm({ title: "", slug: "", category: "general", content: "", status: "draft" }); fetchArticles();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("help_articles").delete().eq("id", id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Article deleted" }); fetchArticles(); }
  };

  const startEdit = (a: HelpArticle) => {
    setEditing(a);
    setForm({ title: a.title, slug: a.slug, category: a.category, content: a.content, status: a.status });
    setShowAdd(true);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bebas text-3xl text-foreground tracking-wider">HELP CENTRE</h1>
          <p className="text-sm text-muted-foreground font-barlow">{articles.length} articles</p>
        </div>
        <Button size="sm" onClick={() => { setEditing(null); setForm({ title: "", slug: "", category: "general", content: "", status: "draft" }); setShowAdd(!showAdd); }}>
          <Plus className="w-4 h-4 mr-1" />{showAdd ? "Cancel" : "New Article"}
        </Button>
      </div>

      {showAdd && (
        <div className="bg-card border border-border rounded-lg p-4 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div><Label className="text-muted-foreground">Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="mt-1 bg-background" /></div>
            <div><Label className="text-muted-foreground">Slug</Label><Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="mt-1 bg-background" placeholder="auto-generated if empty" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-muted-foreground">Category</Label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full mt-1 bg-background border border-border rounded-md px-3 py-2 text-foreground text-sm">
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <Label className="text-muted-foreground">Status</Label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full mt-1 bg-background border border-border rounded-md px-3 py-2 text-foreground text-sm">
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
          </div>
          <div>
            <Label className="text-muted-foreground">Content</Label>
            <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={8} className="w-full mt-1 bg-background border border-border rounded-md px-3 py-2 text-foreground text-sm resize-none" />
          </div>
          <Button onClick={handleSave} disabled={!form.title || !form.content}>{editing ? "Update" : "Create"}</Button>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-lg" />)}</div>
      ) : articles.length === 0 ? (
        <div className="text-center py-16"><BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" /><p className="text-muted-foreground">No articles yet.</p></div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground font-mono text-xs">
                <th className="text-left py-3 px-2">Title</th>
                <th className="text-left py-3 px-2">Category</th>
                <th className="text-left py-3 px-2">Status</th>
                <th className="text-left py-3 px-2">Last Updated</th>
                <th className="text-left py-3 px-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {articles.map((a) => (
                <tr key={a.id} className="border-b border-border/50 hover:bg-accent/30 transition-colors">
                  <td className="py-3 px-2 text-foreground">{a.title}</td>
                  <td className="py-3 px-2 text-muted-foreground font-mono text-xs">{a.category}</td>
                  <td className="py-3 px-2"><span className={`text-xs font-mono ${a.status === "published" ? "text-emerald-400" : "text-amber-400"}`}>{a.status}</span></td>
                  <td className="py-3 px-2 font-mono text-muted-foreground text-xs">{format(new Date(a.updated_at), "d MMM yy")}</td>
                  <td className="py-3 px-2">
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => startEdit(a)}><Pencil className="w-3 h-3" /></Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(a.id)}><Trash2 className="w-3 h-3" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminHelpCentre;
