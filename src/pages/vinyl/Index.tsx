import { motion } from "framer-motion";
import { Disc3, Users, Headphones, ShoppingBag, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const sections = [
  { title: "FOR ARTISTS", description: "Submit releases and agree sales terms in writing.", href: "/vinyl/artists", icon: Disc3 },
  { title: "FOR FANS", description: "Buy music you actually own. WAV quality, permanent Vault access, physical formats.", href: "/vinyl/fans", icon: Users },
  { title: "STREAM MONETIZATION", description: "How the platform generates revenue for artists through multiple streams.", href: "/vinyl/streaming", icon: Headphones },
  { title: "OWNABLE PRODUCTS", description: "Digital downloads, limited pressings, USB cards, NFC cards and more.", href: "/vinyl/products", icon: ShoppingBag },
];

const stats = [
  { value: "Per agreement", label: "artist revenue share" },
  { value: "Reviewed", label: "before publication" },
  { value: "NFC", label: "artist keyring plan" },
];

const VinylHub = () => (
  <div className="min-h-screen bg-background pb-20 md:pb-0">
    <Navbar />
    <div className="grain-overlay" />
    <div className="container pt-24 pb-16 space-y-16">
      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-3xl mx-auto">
        <p className="font-mono text-xs tracking-[0.3em] text-primary mb-2 uppercase">Music · Collect · Support</p>
        <h1 className="font-bebas text-5xl md:text-7xl text-foreground tracking-wider leading-tight">
          THE DIGITAL VINYL PLATFORM
        </h1>
        <p className="font-bebas text-2xl md:text-3xl text-primary tracking-wider mt-2">
          Own Your Music, Own Your Culture.
        </p>
      </motion.div>

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
        {stats.map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-lg p-6 text-center">
            <p className="font-bebas text-3xl text-primary tracking-wider">{s.value}</p>
            <p className="text-sm text-muted-foreground font-barlow">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Section cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {sections.map((s, i) => (
          <motion.div key={s.href} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
            <Link to={s.href} className="group block bg-card border border-border rounded-lg p-8 hover:border-primary/50 transition-all h-full">
              <s.icon className="w-10 h-10 text-primary mb-4" />
              <h2 className="font-bebas text-2xl text-foreground tracking-wider mb-2 group-hover:text-primary transition-colors">{s.title}</h2>
              <p className="text-sm text-muted-foreground font-barlow mb-4">{s.description}</p>
              <div className="flex items-center gap-2 text-primary text-sm font-mono">
                Learn More <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
    <Footer />
  </div>
);

export default VinylHub;
