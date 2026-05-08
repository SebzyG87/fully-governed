import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Exclusive = () => {
  const { user, profile } = useAuth();
  const pts = profile?.loyalty_points ?? 0;
  const isGoldPlus = pts >= 500;

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navbar />
      <div className="grain-overlay" />
      <div className="container pt-24 pb-16 space-y-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <p className="font-mono text-xs tracking-[0.3em] text-primary mb-2 uppercase">Shop</p>
          <h1 className="font-bebas text-5xl md:text-7xl text-foreground tracking-wider">EXCLUSIVE CONTENT</h1>
          <p className="text-muted-foreground font-barlow mt-2 max-w-xl mx-auto">
            Premium content available to Gold and Platinum tier members. Keep building those points.
          </p>
        </motion.div>

        <div className="max-w-2xl mx-auto text-center">
          {!user ? (
            <div className="bg-card border border-border rounded-lg p-12">
              <Lock className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground font-barlow text-lg mb-4">Sign in to access exclusive content.</p>
              <Link to="/auth"><Button className="font-bebas text-lg tracking-wider px-8 h-12">SIGN IN</Button></Link>
            </div>
          ) : !isGoldPlus ? (
            <div className="bg-card border border-border rounded-lg p-12">
              <Lock className="w-16 h-16 text-primary mx-auto mb-4" />
              <p className="text-foreground font-barlow text-lg mb-2">You have <span className="text-primary font-mono">{pts}</span> Build Points.</p>
              <p className="text-muted-foreground font-barlow mb-4">Reach Gold tier (500 pts) to unlock exclusive drops, early access beats, and member-only merch.</p>
              <Link to="/book"><Button className="font-bebas text-lg tracking-wider px-8 h-12">BOOK & EARN POINTS</Button></Link>
            </div>
          ) : (
            <div className="bg-card border border-primary/30 rounded-lg p-12">
              <p className="text-primary font-mono text-sm mb-4">🔓 UNLOCKED — GOLD+ MEMBER</p>
              <p className="text-muted-foreground font-barlow text-lg">Exclusive drops will appear here. Check back soon for member-only content.</p>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Exclusive;
