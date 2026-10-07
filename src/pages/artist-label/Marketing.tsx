import { motion } from "framer-motion";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import QuoteRequestModal from "@/components/QuoteRequestModal";

const Marketing = () => {
  const [quoteOpen, setQuoteOpen] = useState(false);
  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navbar />
      <div className="grain-overlay" />
      <div className="container pt-24 pb-16 space-y-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <p className="font-mono text-xs tracking-[0.3em] text-primary mb-2 uppercase">My Label</p>
          <h1 className="font-bebas text-5xl md:text-7xl text-foreground tracking-wider">MARKETING STRATEGY</h1>
        </motion.div>

        <div className="max-w-3xl mx-auto space-y-8">
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border bg-secondary/50"><th className="text-left p-4 font-bebas text-lg tracking-wider text-foreground">Service</th><th className="text-right p-4 font-bebas text-lg tracking-wider text-foreground">Rate</th></tr></thead>
              <tbody className="font-barlow">
                <tr className="border-b border-border"><td className="p-4 text-muted-foreground">Per Campaign</td><td className="p-4 text-right text-primary font-mono">Request a quote</td></tr>
                <tr><td className="p-4 text-muted-foreground">Annual Strategy Package</td><td className="p-4 text-right text-primary font-mono">Request a quote</td></tr>
              </tbody>
            </table>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="font-bebas text-2xl text-foreground tracking-wider mb-3">INCLUDES</h2>
            <ul className="space-y-2 text-sm text-muted-foreground font-barlow">
              <li>• Custom campaign plans</li>
              <li>• Audience targeting & channel selection</li>
              <li>• Budget planning</li>
              <li>• AI-powered recommendations plus human review</li>
            </ul>
          </div>

          <div className="text-center">
            <Button variant="outline" onClick={() => setQuoteOpen(true)} className="font-bebas text-lg tracking-wider px-8 h-12">REQUEST A QUOTE</Button>
          </div>
        </div>
      </div>
      <Footer />
      <QuoteRequestModal open={quoteOpen} onOpenChange={setQuoteOpen} prefilledService="Marketing Strategy" />
    </div>
  );
};

export default Marketing;
