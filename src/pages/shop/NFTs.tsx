import { motion } from "framer-motion";
import { Gem } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const rarityTiers = [
  { tier: "COMMON", copies: "50+", color: "text-muted-foreground", desc: "Standard digital collectible" },
  { tier: "LIMITED", copies: "20–49", color: "text-primary", desc: "Limited edition release" },
  { tier: "RARE", copies: "10–19", color: "text-room-multi", desc: "Rare collectible pressing" },
  { tier: "ULTRA RARE", copies: "<10", color: "text-room-content", desc: "Ultra rare — once sold out, gone forever" },
];

const NFTs = () => (
  <div className="min-h-screen bg-background pb-20 md:pb-0">
    <Navbar />
    <div className="grain-overlay" />
    <div className="container pt-24 pb-16 space-y-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <p className="font-mono text-xs tracking-[0.3em] text-primary mb-2 uppercase">Shop</p>
        <h1 className="font-bebas text-5xl md:text-7xl text-foreground tracking-wider">LIMITED NFT EDITIONS</h1>
        <p className="text-muted-foreground font-barlow mt-2 max-w-xl mx-auto">
          Own a piece of the culture. Each NFT edition is numbered, Studio Certified, and permanently yours.
        </p>
      </motion.div>

      <div className="max-w-3xl mx-auto">
        <div className="bg-card border border-border rounded-lg p-6 space-y-4">
          <h2 className="font-bebas text-2xl text-foreground tracking-wider">RARITY LEVELS</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {rarityTiers.map((r) => (
              <div key={r.tier} className="bg-secondary/50 border border-border rounded-lg p-4 text-center">
                <Gem className={`w-8 h-8 ${r.color} mx-auto mb-2`} />
                <p className={`font-bebas text-lg tracking-wider ${r.color}`}>{r.tier}</p>
                <p className="text-xs text-muted-foreground font-barlow">{r.copies} copies</p>
                <p className="text-xs text-muted-foreground font-barlow mt-1">{r.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6 mt-6">
          <h2 className="font-bebas text-2xl text-foreground tracking-wider mb-3">HOW IT WORKS</h2>
          <ul className="space-y-2 text-sm text-muted-foreground font-barlow">
            <li>• Each sale generates a unique token number ("Copy 7 of 50")</li>
            <li>• Purchased editions appear in your personal Vault with Studio Certified badge</li>
            <li>• Sold out editions show "Sold Out — Rare Edition" permanently</li>
            <li>• Payment split: 85% artist / 10% studio / 5% processing</li>
          </ul>
        </div>

        <div className="text-center py-16">
          <Gem className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground font-barlow text-lg">No drops available yet — check back soon.</p>
        </div>
      </div>
    </div>
    <Footer />
  </div>
);

export default NFTs;
