import { motion } from "framer-motion";
import { Gamepad2, Camera, Tv, Film, Mic, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";

const sections = [
  { title: "GAMING & STREAMING", description: "Stream Room dry hire and production requests by quote.", href: "/creation-center/gaming", icon: Gamepad2 },
  { title: "MODELING & PORTFOLIO", description: "Photo shoots, video shoots, portfolio creation, casting calls, model agency integration.", href: "/creation-center/modeling", icon: Camera },
  { title: "SHOW PRODUCTION", description: "Talk shows, reality shows, live events, stage setup, lighting, sound, camera crew.", href: "/creation-center/shows", icon: Tv },
  { title: "CONTENT CREATION", description: "Self-operated Stream Room hire; confirm equipment and setup with the studio.", href: "/creation-center/content", icon: Film },
  { title: "PODCASTING", description: "Audio-only self-service hire, self-operated video hire and finished-episode production.", href: "/creation-center/podcasting", icon: Mic },
];

const CreationCenter = () => (
  <div className="min-h-screen bg-background pb-20 md:pb-0">
    <Navbar />
    <div className="grain-overlay" />
    <div className="container pt-24 pb-16 space-y-16">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <p className="font-mono text-xs tracking-[0.3em] text-primary mb-2 uppercase">For Non-Music Creators</p>
        <h1 className="font-bebas text-5xl md:text-7xl text-foreground tracking-wider mb-1">CREATION CENTER</h1>
        <p className="text-primary font-mono text-xs uppercase tracking-[0.3em] mb-4">Fully Governed Media</p>
        <p className="text-muted-foreground font-barlow mt-2 max-w-xl mx-auto">
          Professional facilities for content creators, streamers, models and producers of all kinds.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {sections.map((section, i) => (
          <motion.div key={section.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
            <Link to={section.href} className="block bg-card border border-border rounded-lg p-6 hover:border-primary/50 transition-colors group h-full">
              <section.icon className="w-8 h-8 text-primary mb-4" />
              <h3 className="font-bebas text-xl text-foreground tracking-wider mb-2 group-hover:text-primary transition-colors">{section.title}</h3>
              <p className="text-sm text-muted-foreground font-barlow mb-4">{section.description}</p>
              <div className="flex items-center gap-2 text-primary text-sm font-mono">View Details <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></div>
            </Link>
          </motion.div>
        ))}
      </div>

      <div className="text-center">
        <Link to="/book"><Button className="font-bebas text-lg tracking-wider px-8 h-12">BOOK A SESSION</Button></Link>
      </div>
    </div>
    <Footer />
  </div>
);

export default CreationCenter;
