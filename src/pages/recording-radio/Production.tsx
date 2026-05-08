import { motion } from "framer-motion";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import QuoteRequestModal from "@/components/QuoteRequestModal";

const Production = () => {
  const [quoteOpen, setQuoteOpen] = useState(false);
  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navbar />
      <div className="grain-overlay" />
      <div className="container pt-24 pb-16 space-y-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <p className="font-mono text-xs tracking-[0.3em] text-primary mb-2 uppercase">Recording & Radio</p>
          <h1 className="font-bebas text-5xl md:text-7xl text-foreground tracking-wider">RADIO PRODUCTION</h1>
          <p className="text-muted-foreground font-barlow mt-2 max-w-xl mx-auto">Show formatting, jingle creation, sound design, distribution.</p>
        </motion.div>

        <div className="max-w-3xl mx-auto space-y-8">
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border bg-secondary/50"><th className="text-left p-4 font-bebas text-lg tracking-wider text-foreground">Rate</th><th className="text-right p-4 font-bebas text-lg tracking-wider text-foreground">Price</th></tr></thead>
              <tbody className="font-barlow">
                <tr className="border-b border-border"><td className="p-4 text-muted-foreground">Per Project</td><td className="p-4 text-right text-primary font-mono">£100–£300</td></tr>
                <tr><td className="p-4 text-muted-foreground">Per Episode</td><td className="p-4 text-right text-primary font-mono">£30–£50</td></tr>
              </tbody>
            </table>
          </div>

          <div className="text-center">
            <Button onClick={() => setQuoteOpen(true)} className="font-bebas text-lg tracking-wider px-8 h-12">REQUEST A QUOTE</Button>
          </div>
        </div>
      </div>
      <Footer />
      <QuoteRequestModal open={quoteOpen} onOpenChange={setQuoteOpen} prefilledService="Radio Production" />
    </div>
  );
};

export default Production;
