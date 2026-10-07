import { motion } from "framer-motion";
import { Mic, BookOpen, GraduationCap, Radio } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import QuoteRequestModal from "@/components/QuoteRequestModal";

const services = [
  {
    icon: Mic,
    title: "VOICEOVER RECORDING",
    description: "Professional voiceover for commercials, documentaries, animations and corporate videos.",
    items: [
      { service: "Hourly Recording", rate: "Request a quote" },
      { service: "Per Project", rate: "Request a quote" },
    ],
  },
  {
    icon: BookOpen,
    title: "AUDIOBOOK RECORDING & EDITING",
    description: "Full audiobook production from recording to final mastered files ready for distribution.",
    items: [
      { service: "Per Finished Hour", rate: "Request a quote" },
      { service: "Full Book Package", rate: "Request a quote" },
    ],
  },
  {
    icon: GraduationCap,
    title: "VOICE DIRECTION & COACHING",
    description: "Improve your delivery, tone and technique with professional voice coaching sessions.",
    items: [
      { service: "Coaching Session", rate: "Request a quote" },
    ],
  },
  {
    icon: Radio,
    title: "RADIO SHOW PRODUCTION",
    description: "End-to-end radio show production including recording, editing and mastering.",
    items: [
      { service: "Hourly Production", rate: "Request a quote" },
      { service: "Per Episode", rate: "See podcast production packages" },
    ],
  },
];

const addOns = [
  "AI voice cloning (licensed use only)",
  "Vocal synthesis",
  "3D spatial audio",
];

const Voiceover = () => {
  const [quoteOpen, setQuoteOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navbar />
      <div className="grain-overlay" />
      <div className="container pt-24 pb-16 space-y-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <p className="font-mono text-xs tracking-[0.3em] text-primary mb-2 uppercase">Editing Suite</p>
          <h1 className="font-bebas text-5xl md:text-7xl text-foreground tracking-wider">VOICEOVER & AUDIOBOOKS</h1>
          <p className="text-muted-foreground font-barlow mt-2 max-w-xl mx-auto">Professional voice recording, audiobook production, coaching and radio show production.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {services.map((svc, i) => (
            <motion.div key={svc.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="bg-card border border-border rounded-lg p-6">
              <svc.icon className="w-8 h-8 text-primary mb-4" />
              <h3 className="font-bebas text-xl text-foreground tracking-wider mb-2">{svc.title}</h3>
              <p className="text-sm text-muted-foreground font-barlow mb-4">{svc.description}</p>
              <div className="space-y-2 border-t border-border pt-4">
                {svc.items.map((item) => (
                  <div key={item.service} className="flex justify-between text-sm">
                    <span className="text-muted-foreground font-barlow">{item.service}</span>
                    <span className="text-primary font-mono">{item.rate}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="bg-card border border-border rounded-lg p-6 max-w-2xl mx-auto">
          <h3 className="font-bebas text-xl text-foreground tracking-wider mb-4">ADD-ONS</h3>
          <ul className="space-y-2">
            {addOns.map((addon) => (
              <li key={addon} className="flex items-center gap-2 text-sm text-muted-foreground font-barlow">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                {addon}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex gap-4 justify-center">
          <Link to="/book"><Button className="font-bebas text-lg tracking-wider px-8 h-12">BOOK NOW</Button></Link>
          <Button variant="outline" onClick={() => setQuoteOpen(true)} className="font-bebas text-lg tracking-wider px-8 h-12">REQUEST A QUOTE</Button>
        </div>
      </div>
      <Footer />
      <QuoteRequestModal open={quoteOpen} onOpenChange={setQuoteOpen} prefilledService="Voiceover Recording" />
    </div>
  );
};

export default Voiceover;
