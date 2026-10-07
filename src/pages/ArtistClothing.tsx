import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Shirt, Palette, Package, DollarSign, ArrowRight, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const sections = [
  { title: "DESIGN TOOL", description: "Create custom clothing — t-shirts, hoodies, caps, tote bags with your artwork.", href: "/artist-clothing/designer", icon: Palette },
  { title: "MY PRODUCTS", description: "Manage your created products — drafts, under review, live, paused.", href: "/artist-clothing/products", icon: Shirt },
  { title: "ORDERS", description: "View all orders for your products and fulfilment status.", href: "/artist-clothing/orders", icon: Package },
  { title: "EARNINGS", description: "View gross delivered sales; artist shares are set by signed agreement.", href: "/artist-clothing/earnings", icon: DollarSign },
];

const ArtistClothing = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ total: 0, live: 0, earnings: 0, pending: 0 });

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data: products } = await supabase.from("clothing_products").select("status").eq("user_id", user.id);
      const total = products?.length || 0;
      const live = products?.filter(p => p.status === "live").length || 0;

      const { data: orders } = await supabase.from("clothing_orders").select("total_amount, fulfillment_status").or(`artist_id.eq.${user.id},seller_id.eq.${user.id}`);
      const delivered = orders?.filter(o => o.fulfillment_status === "delivered") || [];
      const earnings = delivered.reduce((s, o) => s + Number(o.total_amount), 0);
      const pending = orders?.filter(o => o.fulfillment_status === "pending").length || 0;

      setStats({ total, live, earnings, pending });
    };
    load();
  }, [user]);

  const statCards = [
    { label: "Total Products", value: stats.total },
    { label: "Live Products", value: stats.live },
    { label: "Gross Sales", value: `£${stats.earnings.toFixed(2)}` },
    { label: "Pending Orders", value: stats.pending },
  ];

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navbar />
      <div className="grain-overlay" />
      <div className="container pt-24 pb-16 space-y-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <p className="font-mono text-xs tracking-[0.3em] text-primary mb-2 uppercase">Print-on-Demand</p>
          <h1 className="font-bebas text-5xl md:text-7xl text-foreground tracking-wider">MY CLOTHING</h1>
          <p className="text-muted-foreground font-barlow mt-2 max-w-xl mx-auto">Design, sell and manage your own clothing brand through the platform.</p>
        </motion.div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {statCards.map((s) => (
            <div key={s.label} className="bg-card border border-border rounded-lg p-4 text-center">
              <p className="text-xs text-muted-foreground font-barlow mb-1">{s.label}</p>
              <p className="font-bebas text-2xl text-primary">{s.value}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link to="/artist-clothing/designer" className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-bebas text-lg tracking-wider px-6 py-3 rounded-sm hover:shadow-[0_0_12px_hsl(var(--interactive))] transition-all">
            <Plus className="w-5 h-5" /> CREATE NEW PRODUCT
          </Link>
        </div>

        {/* Section cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {sections.map((s, i) => (
            <motion.div key={s.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
              <Link to={s.href} className="block bg-card border border-border rounded-lg p-6 hover:border-primary/50 transition-colors group h-full">
                <s.icon className="w-8 h-8 text-primary mb-4" />
                <h3 className="font-bebas text-xl text-foreground tracking-wider mb-2 group-hover:text-primary transition-colors">{s.title}</h3>
                <p className="text-sm text-muted-foreground font-barlow mb-4">{s.description}</p>
                <div className="flex items-center gap-2 text-primary text-sm font-mono">Go <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ArtistClothing;
