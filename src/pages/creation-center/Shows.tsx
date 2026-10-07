import { motion } from "framer-motion";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import QuoteRequestModal from "@/components/QuoteRequestModal";

const Shows = () => {
  const [quoteOpen, setQuoteOpen] = useState(false);
  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navbar />
      <div className="grain-overlay" />
      <div className="container pt-24 pb-16 space-y-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <p className="font-mono text-xs tracking-[0.3em] text-primary mb-2 uppercase">Creation Center</p>
          <h1 className="font-bebas text-5xl md:text-7xl text-foreground tracking-wider">SHOW PRODUCTION</h1>
          <p className="text-muted-foreground font-barlow mt-2 max-w-xl mx-auto">Talk shows, reality shows, live events, stage setup, lighting, sound, camera crew.</p>
        </motion.div>

        <div className="max-w-3xl mx-auto space-y-8">
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border bg-secondary/50"><th className="text-left p-4 font-bebas text-lg tracking-wider text-foreground">Programme share</th><th className="text-right p-4 font-bebas text-lg tracking-wider text-foreground">Creator</th></tr></thead>
              <tbody className="font-barlow">
                <tr className="border-b border-border"><td className="p-4 text-muted-foreground">Start / New</td><td className="p-4 text-right text-primary font-mono">30%</td></tr>
                <tr className="border-b border-border"><td className="p-4 text-muted-foreground">Growing / Established</td><td className="p-4 text-right text-primary font-mono">50%</td></tr>
                <tr><td className="p-4 text-muted-foreground">Fully Monetised</td><td className="p-4 text-right text-primary font-mono">Agreed per show</td></tr>
              </tbody>
            </table>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="font-bebas text-2xl text-foreground tracking-wider mb-3">EQUIPMENT</h2>
            <p className="text-sm text-muted-foreground font-barlow">Full lighting system, multi-camera setup, audio system, dance space, seating/audience area.</p>
          </div>
          <p className="mx-auto max-w-3xl text-xs leading-relaxed text-muted-foreground">The programme is limited to 25 approved shows. Show rights and creator licences are governed by the signed show agreement; capacity, scheduling and approval apply. Audience or revenue is not guaranteed.</p>

          <div className="flex gap-4 justify-center">
            <Link to="/book"><Button className="font-bebas text-lg tracking-wider px-8 h-12">BOOK NOW</Button></Link>
            <Button variant="outline" onClick={() => setQuoteOpen(true)} className="font-bebas text-lg tracking-wider px-8 h-12">REQUEST A QUOTE</Button>
          </div>
        </div>
      </div>
      <Footer />
      <QuoteRequestModal open={quoteOpen} onOpenChange={setQuoteOpen} prefilledService="Show Production" />
    </div>
  );
};

export default Shows;
