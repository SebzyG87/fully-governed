import { motion } from "framer-motion";
import { Upload, Music, Disc3, Headphones, Zap, Package, Usb, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";

const steps = [
  "Artist Finishes Project",
  "Export Optimised Files",
  "Log into Integration Portal",
  "Upload + Add Metadata",
  "Admin Review",
  "Product Live on Platform",
];

const sellItems = [
  { title: "Single Tracks", icon: Music },
  { title: "EPs", icon: Disc3 },
  { title: "Limited Pressings", icon: Sparkles },
  { title: "Beat Leases", icon: Headphones },
  { title: "Exclusive Beat Sales", icon: Zap },
  { title: "Producer Stems", icon: Music },
  { title: "USB Content", icon: Usb },
  { title: "NFT-Ready Editions", icon: Package },
];

const Artists = () => (
  <div className="min-h-screen bg-background pb-20 md:pb-0">
    <Navbar />
    <div className="grain-overlay" />
    <div className="container pt-24 pb-16 space-y-16 max-w-5xl">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <p className="font-mono text-xs tracking-[0.3em] text-primary mb-2 uppercase">Digital Vinyl Platform</p>
        <h1 className="font-bebas text-5xl md:text-7xl text-foreground tracking-wider">FOR ARTISTS</h1>
        <p className="text-muted-foreground font-barlow mt-2 max-w-xl mx-auto">Sell directly to fans. Keep 85% of every sale.</p>
      </motion.div>

      {/* Section 1 — Upload Stepper */}
      <section className="space-y-6">
        <h2 className="font-bebas text-2xl text-foreground tracking-wider text-center">UPLOAD WORKFLOW</h2>
        <div className="flex flex-col md:flex-row items-start md:items-center gap-0 overflow-x-auto pb-4">
          {steps.map((step, i) => (
            <div key={step} className="flex items-center shrink-0">
              <div className="flex flex-col items-center text-center w-36">
                <div className="w-10 h-10 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center font-bebas text-primary text-lg">
                  {i + 1}
                </div>
                <p className="text-xs text-muted-foreground font-barlow mt-2 leading-tight">{step}</p>
              </div>
              {i < steps.length - 1 && (
                <div className="hidden md:block w-8 h-0.5 bg-primary/30 shrink-0" />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Section 2 — What artists can sell */}
      <section className="space-y-6">
        <h2 className="font-bebas text-2xl text-foreground tracking-wider text-center">WHAT YOU CAN SELL</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {sellItems.map((item) => (
            <div key={item.title} className="bg-card border border-border rounded-lg p-4 text-center hover:border-primary/50 transition-colors">
              <item.icon className="w-8 h-8 text-primary mx-auto mb-2" />
              <p className="font-barlow text-sm text-foreground">{item.title}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Section 3 — Payment split */}
      <section className="space-y-6">
        <h2 className="font-bebas text-2xl text-foreground tracking-wider text-center">PAYMENT SPLIT</h2>
        <div className="flex flex-col md:flex-row gap-4 max-w-2xl mx-auto">
          <div className="flex-[85] bg-primary/20 border border-primary rounded-lg p-6 text-center">
            <p className="font-bebas text-4xl text-primary">85%</p>
            <p className="font-barlow text-sm text-foreground mt-1">Artist</p>
          </div>
          <div className="flex-[10] bg-card border border-border rounded-lg p-6 text-center">
            <p className="font-bebas text-4xl text-foreground">10%</p>
            <p className="font-barlow text-sm text-muted-foreground mt-1">Studio</p>
          </div>
          <div className="flex-[5] bg-card border border-border rounded-lg p-6 text-center">
            <p className="font-bebas text-4xl text-muted-foreground">5%</p>
            <p className="font-barlow text-sm text-muted-foreground mt-1">Processing</p>
          </div>
        </div>
      </section>

      {/* Section 4 — Premium */}
      <section className="max-w-2xl mx-auto">
        <div className="bg-card border-2 border-primary rounded-lg p-8 text-center space-y-4">
          <p className="font-mono text-xs tracking-[0.3em] text-primary uppercase">Artist Premium</p>
          <p className="font-bebas text-4xl text-foreground tracking-wider">£15<span className="text-lg text-muted-foreground">/month</span></p>
          <ul className="text-sm text-muted-foreground font-barlow space-y-1">
            <li>• Analytics dashboard</li>
            <li>• Bulk uploads</li>
            <li>• Custom storefront</li>
            <li>• Priority admin review</li>
          </ul>
          <Button className="bg-primary text-primary-foreground font-bebas text-lg tracking-wider px-8">
            GET PREMIUM
          </Button>
        </div>
      </section>

      {/* Section 5 — Integration Fee */}
      <section className="max-w-2xl mx-auto">
        <div className="bg-card border border-border rounded-lg p-6 text-center">
          <h3 className="font-bebas text-xl text-foreground tracking-wider mb-2">PLATFORM INTEGRATION FEE</h3>
          <p className="font-bebas text-3xl text-primary">£50–£100</p>
          <p className="text-sm text-muted-foreground font-barlow mt-1">One-time setup fee for social and website linking</p>
        </div>
      </section>

      {/* CTA */}
      <div className="text-center">
        <Link to="/dashboard/upload-music" className="inline-block bg-primary text-primary-foreground font-bebas text-xl tracking-wider px-10 py-3 rounded-sm hover:shadow-[0_0_12px_hsl(var(--interactive))] transition-all">
          START SELLING
        </Link>
      </div>
    </div>
    <Footer />
  </div>
);

export default Artists;
