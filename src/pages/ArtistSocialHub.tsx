import { motion } from "framer-motion";
import { Share2 } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

const ArtistSocialHub = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navbar />
      <div className="grain-overlay" />
      <div className="container pt-24 pb-16 space-y-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <p className="font-mono text-xs tracking-[0.3em] text-primary mb-2 uppercase">Your Presence</p>
          <h1 className="font-bebas text-5xl md:text-7xl text-foreground tracking-wider">ARTIST SOCIAL HUB</h1>
          <p className="text-muted-foreground font-barlow mt-2 max-w-xl mx-auto">
            Connect your accounts, view stats, and manage your social presence from one dashboard.
          </p>
        </motion.div>

        {!user ? (
          <div className="text-center py-16">
            <Share2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground font-barlow mb-4">Sign in to access your social hub.</p>
            <Link to="/auth">
              <Button className="font-bebas text-lg tracking-wider px-8 h-12">SIGN IN</Button>
            </Link>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-8">
            {["Instagram", "TikTok", "YouTube", "SoundCloud", "Spotify", "Twitter/X"].map((platform) => (
              <div key={platform} className="bg-card border border-border rounded-lg p-6 flex items-center justify-between">
                <div>
                  <h3 className="font-bebas text-xl text-foreground tracking-wider">{platform.toUpperCase()}</h3>
                  <p className="text-sm text-muted-foreground font-barlow">Not connected</p>
                </div>
                <Button variant="outline" size="sm" className="font-mono text-xs">Connect</Button>
              </div>
            ))}
            <div className="bg-card border border-border rounded-lg p-6 text-center">
              <p className="text-muted-foreground font-barlow">
                Use your connected accounts above to keep your artist profile links up to date.
              </p>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default ArtistSocialHub;
