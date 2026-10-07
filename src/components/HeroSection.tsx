import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import heroStudio from "@/assets/hero-studio.jpg";

const HeroSection = () => {
  const [hasPlayed, setHasPlayed] = useState(false);

  useEffect(() => {
    const played = sessionStorage.getItem("fg_hero_played");
    if (played) {
      setHasPlayed(true);
    } else {
      sessionStorage.setItem("fg_hero_played", "true");
    }
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
            src={heroStudio}
          alt="Fully Governed recording studio mixing console"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/50 to-background" />
      </div>

      {/* Content */}
      <div className="relative z-10 container text-center px-4">
        <motion.div
          initial={hasPlayed ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: hasPlayed ? 0 : 0.2 }}
        >
          <p className="font-mono text-xs tracking-[0.3em] text-primary mb-4 uppercase">
            Studio & Content Creation Centre
          </p>
          <h1 className="font-bebas text-6xl sm:text-8xl md:text-9xl leading-none tracking-wider text-foreground mb-6">
            FULLY
            <br />
            <span className="text-primary">GOVERNED</span>
          </h1>
          <p className="font-barlow text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-4">
            Three premium rooms. Recording, content creation & multi-use.
            <br className="hidden sm:block" />
            Lewisham, South East London.
          </p>
          <p className="font-mono text-xs text-muted-foreground tracking-widest mb-10">
            V22 BUILDING · 174–186 HITHER GREEN LANE · SE13 6QB
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <button
            onClick={() => document.getElementById("rooms")?.scrollIntoView({ behavior: "smooth" })}
            className="font-bebas text-xl tracking-wider bg-primary text-primary-foreground px-10 py-3 rounded-sm hover:shadow-[0_0_12px_hsl(var(--interactive))] hover:border hover:border-interactive transition-all"
          >
            EXPLORE ROOMS
          </button>
          <button
            onClick={() => document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" })}
            className="font-bebas text-xl tracking-wider border border-primary text-primary px-10 py-3 rounded-sm hover:border-interactive hover:text-interactive hover:shadow-[0_0_12px_hsl(var(--interactive))] transition-all"
          >
            VIEW RATES
          </button>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        <ChevronDown className="w-6 h-6 text-primary" />
      </motion.div>
    </section>
  );
};

export default HeroSection;
