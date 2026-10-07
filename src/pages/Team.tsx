import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { TEAM_MEMBERS, type TeamMember } from "@/data/team";
import { Crown, Sparkles, ArrowRight, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";

import Footer from "@/components/Footer";

export default function Team() {
  const [members, setMembers] = useState<TeamMember[]>(TEAM_MEMBERS);

  useEffect(() => {
    supabase
      .from("fg_producer_profiles" as any)
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .then(({ data }) => {
        if (!data?.length) return;
        setMembers((data as any[]).map((profile): TeamMember => ({
          slug: profile.slug,
          name: profile.display_name,
          role: profile.role_title,
          bio: profile.bio || "",
          avatar: profile.avatar_url || TEAM_MEMBERS.find((member) => member.slug === profile.slug)?.avatar || TEAM_MEMBERS[0].avatar,
          skills: profile.skills || [],
          ratePlaceholder: Array.isArray(profile.rate_cards) && profile.rate_cards[0]?.rate ? profile.rate_cards[0].rate : "Rates on request",
          availabilityPlaceholder: profile.availability?.label || "Availability on request",
          availabilityNotes: profile.availability?.notes || "Contact the studio to confirm availability.",
          portfolio: Array.isArray(profile.portfolio) ? profile.portfolio.map((item: any) => item.title || String(item)) : [],
          socialLinks: {},
          serviceCategories: Array.isArray(profile.services)
            ? profile.services.map((service: any) => ({ title: service.category || "Services", items: service.items || [] }))
            : [],
          tone: profile.bio || "",
        })));
      })
      .catch(() => setMembers(TEAM_MEMBERS));
  }, []);

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navbar />
      <div className="grain-overlay" />
      
      <main className="container pt-28 pb-16 space-y-12 max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-center gap-2"
          >
            <Sparkles className="w-5 h-5 text-primary" />
            <span className="font-mono text-xs uppercase tracking-[0.25em] text-primary">CREATIVE ENGINE</span>
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="font-bebas text-5xl md:text-7xl tracking-wider text-foreground"
          >
            MEET THE TEAM
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-sm md:text-base text-muted-foreground font-barlow leading-relaxed"
          >
            Connect with our world-class team of music producers, engineers, visual effects artists, and business systems designers to elevate your next project.
          </motion.p>
        </div>

        {/* Marketplace Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-2 max-w-4xl mx-auto">
          {members.map((member, idx) => (
            <motion.div
              key={member.slug}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.15 }}
              className="group relative flex flex-col justify-between rounded-3xl border border-border bg-card/40 backdrop-blur-md p-6 hover:border-primary/40 transition-all duration-300"
            >
              {/* Premium Top Line Accent */}
              <div className="absolute top-0 left-6 right-6 h-[1px] bg-gradient-to-r from-transparent via-primary/20 to-transparent group-hover:via-primary/50 transition-all" />

              <div className="space-y-6">
                {/* Profile Picture & General info */}
                <div className="flex gap-4 items-center">
                  <div className="relative w-20 h-20 rounded-2xl overflow-hidden border border-border group-hover:border-primary/40 transition-colors">
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 scale-105 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/30 to-transparent" />
                  </div>
                  <div>
                    <h2 className="font-bebas text-2xl md:text-3xl tracking-wide text-foreground flex items-center gap-2">
                      {member.name}
                      <Crown className="w-4 h-4 text-primary/70 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </h2>
                    <p className="text-xs font-mono text-primary uppercase tracking-wider">{member.role}</p>
                    <p className="text-[11px] text-muted-foreground font-mono mt-0.5">{member.availabilityPlaceholder}</p>
                  </div>
                </div>

                {/* Brief bio */}
                <p className="text-xs md:text-sm text-muted-foreground font-barlow leading-relaxed">
                  {member.bio}
                </p>

                {/* Core skills */}
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {member.skills.slice(0, 4).map((skill) => (
                    <span
                      key={skill}
                      className="rounded-full border border-border bg-card px-2.5 py-0.5 text-[10px] font-mono text-muted-foreground group-hover:border-primary/25 group-hover:text-foreground transition-colors"
                    >
                      {skill}
                    </span>
                  ))}
                  {member.skills.length > 4 && (
                    <span className="rounded-full border border-border bg-card/60 px-2 py-0.5 text-[10px] font-mono text-muted-foreground">
                      +{member.skills.length - 4} more
                    </span>
                  )}
                </div>
              </div>

              {/* CTAs */}
              <div className="flex items-center gap-3 pt-6 border-t border-border/40 mt-6">
                <Button asChild variant="outline" className="flex-1 font-barlow text-xs h-10 border-border group-hover:border-primary/30">
                  <Link to={`/team/${member.slug}`}>
                    View Profile
                  </Link>
                </Button>

                <Button asChild className="flex-1 font-bebas text-sm tracking-wider h-10 bg-primary text-primary-foreground hover:shadow-[0_0_12px_rgba(212,175,55,0.3)]">
                  <Link to={`/book?producer=${member.slug}`} className="flex items-center justify-center gap-1.5">
                    <UserCheck className="w-4 h-4" /> Book Session
                  </Link>
                </Button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Studio General Policy Note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="rounded-2xl border border-border bg-card/20 max-w-4xl mx-auto p-4 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground font-barlow"
        >
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Producers offer standard studio rates with full project backing guarantees.</span>
          </div>
          <div>
            <span>Read our studio booking policy for details on reschedule guarantees.</span>
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}
