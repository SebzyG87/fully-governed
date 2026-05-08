import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { RoomViewButtons } from "@/components/RoomGalleryModal";

const Studio = () => (
  <div className="min-h-screen bg-background pb-20 md:pb-0">
    <Navbar />
    <div className="grain-overlay" />
    <div className="container pt-24 pb-16 space-y-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <p className="font-mono text-xs tracking-[0.3em] text-primary mb-2 uppercase">Recording & Radio</p>
        <h1 className="font-bebas text-5xl md:text-7xl text-foreground tracking-wider">RECORDING STUDIO</h1>
        <p className="text-muted-foreground font-barlow mt-2 max-w-xl mx-auto">Room 1B — Our flagship recording space. Black and gold aesthetic with cloud ceiling, full acoustic treatment, MLV soundproofing, and red royal seating. Equipped with Neumann TLM 103, Apollo Twin, and KRK studio monitors. Professional and premium from the moment you walk in.</p>
      </motion.div>

      <div className="max-w-3xl mx-auto space-y-8">
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border bg-secondary/50"><th className="text-left p-4 font-bebas text-lg tracking-wider text-foreground">Session Type</th><th className="text-right p-4 font-bebas text-lg tracking-wider text-foreground">Rate</th></tr></thead>
            <tbody className="font-barlow">
              <tr className="border-b border-border"><td className="p-4 text-muted-foreground">Artist + Engineer</td><td className="p-4 text-right text-primary font-mono">£30/hr</td></tr>
                <tr className="border-b border-border"><td className="p-4 text-muted-foreground">Dry Hire</td><td className="p-4 text-right text-primary font-mono">£15/hr</td></tr>
                <tr className="border-b border-border"><td className="p-4 text-muted-foreground">Label Artist + Engineer</td><td className="p-4 text-right text-primary font-mono">£20/hr</td></tr>
                <tr className="border-b border-border"><td className="p-4 text-muted-foreground">Block 4-hour</td><td className="p-4 text-right text-primary font-mono">£100</td></tr>
                <tr><td className="p-4 text-muted-foreground">Full Day</td><td className="p-4 text-right text-primary font-mono">£250</td></tr>
            </tbody>
          </table>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="font-bebas text-2xl text-foreground tracking-wider mb-3">EQUIPMENT</h2>
          <p className="text-sm text-muted-foreground font-barlow">Neumann TLM 103, Universal Audio Apollo Twin X, KRK studio monitors, professional condenser and dynamic microphones, studio headphones, MIDI keyboards, beat maker machine, streaming rig, video recording camera, dry hire drop box.</p>
        </div>

        <RoomViewButtons roomName="Recording Studio" />

        <div className="text-center">
          <Link to="/book"><Button className="font-bebas text-lg tracking-wider px-8 h-12">BOOK A SESSION</Button></Link>
        </div>
      </div>
    </div>
    <Footer />
  </div>
);

export default Studio;
