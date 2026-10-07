import { motion } from "framer-motion";
import { Mic2, Radio, Music, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const sections = [
  { title: "RECORDING STUDIO", description: "Room 1B music studio dry hire, with an engineer available as an add-on.", href: "/recording-radio/studio", icon: Mic2 },
  { title: "INTERNET RADIO", description: "FGS Radio is being prepared for approved releases and studio-produced shows. Live broadcasting is not available yet.", href: "/recording-radio/radio", icon: Radio },
  { title: "RADIO PRODUCTION", description: "Show formatting, jingle creation, sound design, distribution.", href: "/recording-radio/production", icon: Music },
];

const RecordingRadio = () => (
  <div className="min-h-screen bg-background pb-20 md:pb-0">
    <Navbar />
    <div className="grain-overlay" />
    <div className="container pt-24 pb-16 space-y-16">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <p className="font-mono text-xs tracking-[0.3em] text-primary mb-2 uppercase">Studio & Broadcasting</p>
        <h1 className="font-bebas text-5xl md:text-7xl text-foreground tracking-wider">RECORDING STUDIO & RADIO</h1>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        {sections.map((s, i) => (
          <motion.div key={s.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
            <Link to={s.href} className="block bg-card border border-border rounded-lg p-6 hover:border-primary/50 transition-colors group h-full">
              <s.icon className="w-8 h-8 text-primary mb-4" />
              <h3 className="font-bebas text-xl text-foreground tracking-wider mb-2 group-hover:text-primary transition-colors">{s.title}</h3>
              <p className="text-sm text-muted-foreground font-barlow mb-4">{s.description}</p>
              <div className="flex items-center gap-2 text-primary text-sm font-mono">View Details <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
    <Footer />
  </div>
);

export default RecordingRadio;
