import { motion } from "framer-motion";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import QuoteRequestModal from "@/components/QuoteRequestModal";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const USBBundles = () => {
  const [showQuote, setShowQuote] = useState(false);

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navbar />
      <div className="grain-overlay" />
      <div className="container pt-24 pb-16 space-y-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <p className="font-mono text-xs tracking-[0.3em] text-primary mb-2 uppercase">Shop</p>
          <h1 className="font-bebas text-5xl md:text-7xl text-foreground tracking-wider">USB BUNDLES</h1>
          <p className="text-muted-foreground font-barlow mt-2 max-w-xl mx-auto">
            Physical USB drives loaded with exclusive beat packs, mixtapes, and producer kits. Ship direct.
          </p>
        </motion.div>

        <div className="max-w-3xl mx-auto">
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border bg-secondary/50"><th className="text-left p-4 font-bebas text-lg tracking-wider text-foreground">Bundle</th><th className="text-right p-4 font-bebas text-lg tracking-wider text-foreground">Price</th></tr></thead>
              <tbody className="font-barlow">
                <tr className="border-b border-border"><td className="p-4 text-muted-foreground">Beat Pack USB (10 beats)</td><td className="p-4 text-right text-primary font-mono">Request a quote</td></tr>
                <tr className="border-b border-border"><td className="p-4 text-muted-foreground">Mixtape Collection USB</td><td className="p-4 text-right text-primary font-mono">Request a quote</td></tr>
                <tr className="border-b border-border"><td className="p-4 text-muted-foreground">Producer Kit USB (samples + loops)</td><td className="p-4 text-right text-primary font-mono">Request a quote</td></tr>
                <tr><td className="p-4 text-muted-foreground">Custom Bundle (artist selection)</td><td className="p-4 text-right text-primary font-mono">Request a quote</td></tr>
              </tbody>
            </table>
          </div>

          <div className="text-center mt-8">
            <Button onClick={() => setShowQuote(true)} className="font-bebas text-lg tracking-wider px-8 h-12">ORDER A BUNDLE</Button>
          </div>
        </div>
      </div>
      <Footer />
      <QuoteRequestModal open={showQuote} onOpenChange={setShowQuote} prefilledService="USB Preloading" />
    </div>
  );
};

export default USBBundles;
