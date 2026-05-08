import { motion } from "framer-motion";
import { Radio as RadioIcon, Headphones } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Radio = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="grain-overlay" />
      <Navbar />
      <div className="container pt-24 pb-16 space-y-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <h1 className="text-5xl md:text-7xl text-foreground">RADIO</h1>
          <p className="text-muted-foreground font-barlow mt-2">Fully Governed Internet Radio</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="max-w-2xl mx-auto">
          <div className="bg-card border border-border rounded-lg p-8 text-center space-y-6">
            <div className="w-24 h-24 rounded-full bg-interactive/10 flex items-center justify-center mx-auto">
              <RadioIcon className="w-12 h-12 text-interactive animate-pulse" />
            </div>
            <h2 className="text-3xl text-foreground">COMING SOON</h2>
            <p className="text-muted-foreground font-barlow">
              Fully Governed Radio is launching soon. Live broadcasts, curated playlists, and exclusive studio sessions — straight from SE London.
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground font-mono">
              <Headphones className="w-4 h-4" />
              <span>Stay tuned for launch date</span>
            </div>
          </div>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
};

export default Radio;
