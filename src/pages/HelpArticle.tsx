import { useParams, Link, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ThumbsUp, ThumbsDown, Clock } from "lucide-react";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { helpArticles as hardcodedArticles } from "@/data/helpArticles";
import { supabase } from "@/integrations/supabase/client";

const HelpArticle = () => {
  const { slug } = useParams<{ slug: string }>();
  const [dbArticle, setDbArticle] = useState<any | null>(null);
  const [checked, setChecked] = useState(false);
  const [feedback, setFeedback] = useState<"up" | "down" | null>(() => {
    if (!slug) return null;
    return localStorage.getItem(`help-feedback-${slug}`) as "up" | "down" | null;
  });

  useEffect(() => {
    const fetchFromDB = async () => {
      if (!slug) { setChecked(true); return; }
      const { data } = await supabase
        .from("help_articles")
        .select("*")
        .eq("slug", slug)
        .eq("status", "published")
        .maybeSingle();
      if (data) {
        setDbArticle({
          slug: data.slug,
          title: data.title,
          summary: data.content.slice(0, 120) + "...",
          content: data.content,
          category: data.category,
          lastUpdated: data.updated_at ? new Date(data.updated_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "Date unknown",
          relatedSlugs: [],
        });
      }
      setChecked(true);
    };
    fetchFromDB();
  }, [slug]);

  if (!checked) return null;

  const article = dbArticle || hardcodedArticles.find((a) => a.slug === slug);
  if (!article) return <Navigate to="/help" replace />;

  const related = (article.relatedSlugs || [])
    .map((s: string) => hardcodedArticles.find((a) => a.slug === s))
    .filter(Boolean)
    .slice(0, 3);

  const handleFeedback = (type: "up" | "down") => {
    setFeedback(type);
    localStorage.setItem(`help-feedback-${slug}`, type);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="grain-overlay" />
      <div className="container pt-24 pb-16 max-w-3xl">
        <Link to="/help" className="inline-flex items-center gap-2 text-muted-foreground hover:text-interactive transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to Help Centre
        </Link>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <span className="text-xs font-mono text-primary">{article.category}</span>
          <h1 className="text-4xl md:text-5xl text-foreground mt-2">{article.title.toUpperCase()}</h1>
          <p className="text-muted-foreground font-barlow mt-2 text-lg">{article.summary}</p>
          <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground font-mono">
            <Clock className="w-3 h-3" /> Last updated {article.lastUpdated}
          </div>
        </motion.div>

        <div className="mt-8 bg-card border border-border rounded-lg p-6 md:p-8">
          <div className="prose prose-invert max-w-none">
            {article.content.split("\n").map((line: string, i: number) => {
              if (line.startsWith("**") && line.endsWith("**")) {
                return <h3 key={i} className="text-lg text-foreground mt-4 mb-2">{line.replace(/\*\*/g, "")}</h3>;
              }
              if (line.startsWith("- ")) {
                return (
                  <div key={i} className="flex items-start gap-2 py-1">
                    <span className="text-primary mt-1">•</span>
                    <p className="text-muted-foreground font-barlow">{line.slice(2)}</p>
                  </div>
                );
              }
              if (/^\d+\./.test(line)) {
                const num = line.match(/^(\d+)\./)?.[1];
                return (
                  <div key={i} className="flex items-start gap-3 py-1.5">
                    <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center flex-shrink-0 font-mono">{num}</span>
                    <p className="text-foreground font-barlow">{line.replace(/^\d+\.\s*/, "")}</p>
                  </div>
                );
              }
              if (line.trim() === "") return <div key={i} className="h-3" />;
              return <p key={i} className="text-muted-foreground font-barlow py-0.5">{line}</p>;
            })}
          </div>
        </div>

        <div className="mt-6 flex items-center gap-4">
          <p className="text-sm text-muted-foreground">Was this helpful?</p>
          <button
            onClick={() => handleFeedback("up")}
            className={`p-2 rounded-md transition-colors ${feedback === "up" ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-accent"}`}
          >
            <ThumbsUp className="w-5 h-5" />
          </button>
          <button
            onClick={() => handleFeedback("down")}
            className={`p-2 rounded-md transition-colors ${feedback === "down" ? "bg-destructive/20 text-destructive" : "text-muted-foreground hover:text-foreground hover:bg-accent"}`}
          >
            <ThumbsDown className="w-5 h-5" />
          </button>
        </div>

        {related.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl text-foreground mb-4">RELATED ARTICLES</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {related.map((r: any) => r && (
                <Link
                  key={r.slug}
                  to={`/help/${r.slug}`}
                  className="bg-card border border-border rounded-lg p-4 hover:border-interactive transition-all group"
                >
                  <p className="text-sm text-foreground group-hover:text-primary transition-colors">{r.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{r.summary}</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HelpArticle;
