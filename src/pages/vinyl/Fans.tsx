import { motion } from "framer-motion";
import { Usb, QrCode, Smartphone, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const benefits = [
  "WAV quality playback",
  "Permanent Vault access",
  "Studio Certified badge on every purchase",
  "Multiple physical formats",
];

const formats = [
  { title: "USB CARD", description: "Branded USB preloaded with music — plug in and play.", icon: Usb },
  { title: "QR POSTCARD", description: "Physical card — scan to unlock instantly in your Vault.", icon: QrCode },
  { title: "NFC CARD", description: "Tap your phone — instant Vault access, no app needed.", icon: Smartphone },
];

const Fans = () => (
  <div className="min-h-screen bg-background pb-20 md:pb-0">
    <Navbar />
    <div className="grain-overlay" />
    <div className="container pt-24 pb-16 space-y-16 max-w-4xl">
      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <p className="font-mono text-xs tracking-[0.3em] text-primary mb-2 uppercase">Digital Vinyl Platform</p>
        <h1 className="font-bebas text-5xl md:text-7xl text-foreground tracking-wider">FOR FANS</h1>
        <p className="font-bebas text-2xl text-primary tracking-wider mt-2">Your music, your way.</p>
        <p className="text-muted-foreground font-barlow mt-2 max-w-xl mx-auto">Buy directly from the artists you love.</p>
      </motion.div>

      {/* Benefits */}
      <section className="space-y-4">
        <h2 className="font-bebas text-2xl text-foreground tracking-wider text-center">WHAT YOU GET</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
          {benefits.map((b) => (
            <div key={b} className="bg-card border border-border rounded-lg p-4 flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
              <p className="text-sm text-foreground font-barlow">{b}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Physical formats */}
      <section className="space-y-6">
        <h2 className="font-bebas text-2xl text-foreground tracking-wider text-center">PHYSICAL FORMATS</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {formats.map((f, i) => (
            <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
              <div className="bg-card border border-border rounded-lg p-6 text-center h-full hover:border-primary/50 transition-colors">
                <f.icon className="w-10 h-10 text-primary mx-auto mb-4" />
                <h3 className="font-bebas text-xl text-foreground tracking-wider mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground font-barlow">{f.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <div className="text-center">
        <Link to="/shop/digital-vinyl" className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-bebas text-xl tracking-wider px-10 py-3 rounded-sm hover:shadow-[0_0_12px_hsl(var(--interactive))] transition-all">
          BROWSE THE STORE <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
    </div>
    <Footer />
  </div>
);

export default Fans;
