import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, Rocket, Calendar, Music, PoundSterling, User, Star, Wrench, Megaphone, GraduationCap, Scissors, Users, Radio, ShoppingBag, Car, Accessibility, Mail, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import { Input } from "@/components/ui/input";
import { helpArticles as hardcodedArticles, helpCategories } from "@/data/helpArticles";
import { supabase } from "@/integrations/supabase/client";

const iconMap: Record<string, any> = {
  Rocket, Calendar, Music, PoundSterling, User, Star, Wrench, Megaphone, GraduationCap, Scissors, Users, Radio, ShoppingBag, Car, Accessibility, Mail,
};

const popularSlugs = [
  "how-to-book-a-session",
  "cancellation-policy",
  "what-rooms-are-available",
  "loyalty-points-explained",
  "parking-and-vehicle-registration",
  "editing-suite-services",
];

const Help = () => {
  const [search, setSearch] = useState("");
  const [dbArticles, setDbArticles] = useState<any[] | null>(null);

  // Try loading from DB, fall back to hardcoded
  useEffect(() => {
    const fetchFromDB = async () => {
      const { data } = await supabase
        .from("help_articles")
        .select("*")
        .eq("status", "published")
        .order("title");
      if (data && data.length > 0) {
        // Map DB articles to same shape as hardcoded
        setDbArticles(data.map((a: any) => ({
          slug: a.slug,
          title: a.title,
          summary: a.content.slice(0, 120) + "...",
          content: a.content,
          category: a.category,
          lastUpdated: new Date(a.updated_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
          relatedSlugs: [],
        })));
      }
    };
    fetchFromDB();
  }, []);

  const helpArticles = dbArticles || hardcodedArticles;

  const results = useMemo(() => {
    if (search.length < 2) return null;
    const q = search.toLowerCase();
    return helpArticles.filter(
      (a) => a.title.toLowerCase().includes(q) || a.summary.toLowerCase().includes(q) || a.content.toLowerCase().includes(q)
    );
  }, [search, helpArticles]);

  const popular = helpArticles.filter((a) => popularSlugs.includes(a.slug));

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="grain-overlay" />
      <div className="container pt-24 pb-16 space-y-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <p className="font-mono text-xs tracking-[0.3em] text-primary mb-2 uppercase">Support</p>
          <h1 className="font-bebas text-5xl md:text-7xl text-foreground tracking-wider">HELP CENTRE</h1>
        </motion.div>

        <div className="max-w-xl mx-auto relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="What do you need help with?"
            className="pl-12 h-14 text-lg bg-card border-border"
          />
        </div>

        {results !== null ? (
          <div className="max-w-2xl mx-auto space-y-2">
            <p className="text-sm text-muted-foreground font-mono">{results.length} result{results.length !== 1 ? "s" : ""}</p>
            {results.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No articles found. Try a different search term.</p>
              </div>
            ) : (
              results.map((article) => (
                <Link
                  key={article.slug}
                  to={`/help/${article.slug}`}
                  className="block bg-card border border-border rounded-lg p-4 hover:border-interactive transition-all group"
                >
                  <p className="text-foreground group-hover:text-primary transition-colors font-medium">{article.title}</p>
                  <p className="text-sm text-muted-foreground mt-1">{article.summary}</p>
                  <span className="text-xs font-mono text-primary mt-2 inline-block">{article.category}</span>
                </Link>
              ))
            )}
          </div>
        ) : (
          <>
            <div>
              <h2 className="text-2xl text-foreground mb-4">POPULAR ARTICLES</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {popular.map((article, i) => (
                  <motion.div key={article.slug} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                    <Link
                      to={`/help/${article.slug}`}
                      className="block bg-card border border-border rounded-lg p-5 hover:border-interactive hover:shadow-[0_0_12px_hsl(var(--interactive))] transition-all group h-full"
                    >
                      <p className="text-foreground group-hover:text-primary transition-colors font-medium">{article.title}</p>
                      <p className="text-sm text-muted-foreground mt-2">{article.summary}</p>
                      <ArrowRight className="w-4 h-4 text-primary mt-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-2xl text-foreground mb-4">BROWSE BY CATEGORY</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {helpCategories.map((cat) => {
                  const Icon = iconMap[cat.icon] || Star;
                  const count = helpArticles.filter((a) => a.category === cat.name).length;
                  return (
                    <Link
                      key={cat.name}
                      to={`/help?category=${encodeURIComponent(cat.name)}`}
                      onClick={(e) => {
                        e.preventDefault();
                        setSearch(cat.name);
                      }}
                      className="bg-card border border-border rounded-lg p-4 hover:border-interactive transition-all group flex items-center gap-3"
                    >
                      <Icon className="w-5 h-5 text-primary flex-shrink-0" />
                      <div>
                        <p className="text-sm text-foreground group-hover:text-primary transition-colors">{cat.name}</p>
                        <p className="text-[11px] text-muted-foreground font-mono">{count} article{count !== 1 ? "s" : ""}</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="text-center py-8">
              <p className="text-muted-foreground mb-3">Still need help?</p>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 font-bebas text-lg tracking-wider bg-primary text-primary-foreground px-8 py-3 rounded-sm hover:shadow-[0_0_12px_hsl(var(--interactive))] transition-all"
              >
                <Mail className="w-5 h-5" /> CONTACT US
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Help;
