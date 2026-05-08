import { motion } from "framer-motion";
import { Scale, TrendingUp, Megaphone, Truck, DollarSign, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";

const sections = [
  { title: "LEGAL & PAPERWORK", description: "Contract templates, release agreements, copyright registration, business formation.", href: "/artist-label/legal", icon: Scale },
  { title: "MARKETING STRATEGY", description: "Custom campaign plans, audience targeting, channel selection, budget planning.", href: "/artist-label/marketing", icon: TrendingUp },
  { title: "CAMPAIGNS", description: "Digital & physical campaign support, social media management, event planning.", href: "/artist-label/campaigns", icon: Megaphone },
  { title: "DISTRIBUTION", description: "DistroKid setup, release scheduling, metadata management, platform sync.", href: "/artist-label/distribution", icon: Truck },
  { title: "FINANCE", description: "Earnings dashboard, royalty tracking, payment history, tax summary export.", href: "/artist-label/finance", icon: DollarSign },
];

const ArtistLabel = () => {
  const { profile } = useAuth();
  const displayName = profile?.full_name || "Artist";

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navbar />
      <div className="grain-overlay" />
      <div className="container pt-24 pb-16 space-y-16">
        {/* Welcome card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="max-w-3xl mx-auto bg-card border border-border rounded-lg p-8 text-center">
            <p className="font-mono text-xs tracking-[0.3em] text-primary mb-2 uppercase">Welcome back</p>
            <h1 className="font-bebas text-4xl md:text-6xl text-foreground tracking-wider">{displayName}</h1>
            <p className="text-muted-foreground font-barlow mt-2">Manage your label, campaigns, distribution and finances — all in one place.</p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {sections.map((s, i) => (
            <motion.div key={s.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
              <Link to={s.href} className="block bg-card border border-border rounded-lg p-6 hover:border-primary/50 transition-colors group h-full">
                <s.icon className="w-8 h-8 text-primary mb-4" />
                <h3 className="font-bebas text-xl text-foreground tracking-wider mb-2 group-hover:text-primary transition-colors">{s.title}</h3>
                <p className="text-sm text-muted-foreground font-barlow mb-4">{s.description}</p>
                <div className="flex items-center gap-2 text-primary text-sm font-mono">Learn More <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ArtistLabel;
