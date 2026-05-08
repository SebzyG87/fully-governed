import { motion } from "framer-motion";
import { useState } from "react";
import { Zap } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import QuoteRequestModal from "@/components/QuoteRequestModal";

const VideoEditing = () => {
  const [quoteOpen, setQuoteOpen] = useState(false);
  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navbar />
      <div className="grain-overlay" />
      <div className="container pt-24 pb-16 space-y-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <p className="font-mono text-xs tracking-[0.3em] text-primary mb-2 uppercase">Editing Suite</p>
          <h1 className="font-bebas text-5xl md:text-7xl text-foreground tracking-wider">VIDEO EDITING</h1>
          <p className="text-muted-foreground font-barlow mt-2 max-w-xl mx-auto">Room 1A — Our editing suite and multi-purpose space. Post-production, video editing, animation, podcast recording, interviews, workshops, listening parties, and private events. Configure it however you need.</p>
          <div className="inline-flex items-center gap-2 mt-6 bg-primary/10 text-primary border border-primary/30 px-4 py-2 rounded-full">
            <Zap className="w-4 h-4" />
            <span className="font-bebas tracking-wider mt-1">THE 1-HOUR FLIP</span>
            <span className="text-xs font-barlow ml-1 hidden md:inline">&mdash; Social clips delivered to your dashboard 60 minutes after your session</span>
          </div>
        </motion.div>
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border bg-secondary/30"><th className="text-left p-4 font-bebas text-base tracking-wider text-foreground">Service</th><th className="text-right p-4 font-bebas text-base tracking-wider text-foreground">Rate</th></tr></thead>
              <tbody className="font-barlow">
                <tr className="border-b border-border"><td className="p-4 text-muted-foreground">Session reels</td><td className="p-4 text-right text-primary font-mono whitespace-nowrap">£20–£50/reel</td></tr>
                <tr className="border-b border-border"><td className="p-4 text-muted-foreground">Blog & interview videos (5–10 min)</td><td className="p-4 text-right text-primary font-mono whitespace-nowrap">£150–£500/video · £45–£80/hr</td></tr>
                <tr><td className="p-4 text-muted-foreground">General video editing</td><td className="p-4 text-right text-primary font-mono whitespace-nowrap">£30–£60/hr · £180–£220/day (8hrs)</td></tr>
              </tbody>
            </table>
          </div>
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="font-bebas text-2xl text-foreground tracking-wider mb-3">ADD-ONS</h2>
            <ul className="space-y-2 text-sm text-muted-foreground font-barlow">
              <li>• AI short-form clip generation</li>
              <li>• Colour grading</li>
              <li>• Integrated sound design</li>
            </ul>
          </div>
          <div className="flex gap-4 justify-center">
            <Link to="/book"><Button className="font-bebas text-lg tracking-wider px-8 h-12">BOOK NOW</Button></Link>
            <Button variant="outline" onClick={() => setQuoteOpen(true)} className="font-bebas text-lg tracking-wider px-8 h-12">REQUEST A QUOTE</Button>
          </div>
        </div>
      </div>
      <Footer />
      <QuoteRequestModal open={quoteOpen} onOpenChange={setQuoteOpen} prefilledService="Video Editing" />
    </div>
  );
};

export default VideoEditing;
