import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const formats = [
  { name: "Instant Digital Download", how: "Pay once → instant download + permanent Vault access" },
  { name: "Limited Pressing", how: "Copy limit set by artist — once sold out it becomes a rare collectible permanently" },
  { name: "QR Postcard", how: "Physical postcard — scan to unlock in your Vault" },
  { name: "USB Card", how: "Preloaded USB — plug in to auto-launch artist's mini-platform" },
  { name: "NFC Card", how: "Tap your phone → instant Vault access, no app needed" },
];

const Products = () => (
  <div className="min-h-screen bg-background pb-20 md:pb-0">
    <Navbar />
    <div className="grain-overlay" />
    <div className="container pt-24 pb-16 space-y-12 max-w-4xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <p className="font-mono text-xs tracking-[0.3em] text-primary mb-2 uppercase">Digital Vinyl Platform</p>
        <h1 className="font-bebas text-5xl md:text-7xl text-foreground tracking-wider">OWNABLE PRODUCTS</h1>
        <p className="font-bebas text-2xl text-primary tracking-wider mt-2">Music you actually own.</p>
        <p className="text-muted-foreground font-barlow mt-1">Not a subscription. Yours forever.</p>
      </motion.div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/30">
                <th className="text-left p-4 font-bebas text-base tracking-wider text-foreground">Format</th>
                <th className="text-left p-4 font-bebas text-base tracking-wider text-foreground">How It Works</th>
              </tr>
            </thead>
            <tbody className="font-barlow">
              {formats.map((f, i) => (
                <tr key={f.name} className={i < formats.length - 1 ? "border-b border-border" : ""}>
                  <td className="p-4 text-foreground font-medium">{f.name}</td>
                  <td className="p-4 text-muted-foreground">{f.how}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="text-center">
        <Link to="/shop" className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-bebas text-xl tracking-wider px-10 py-3 rounded-sm hover:shadow-[0_0_12px_hsl(var(--interactive))] transition-all">
          BROWSE AVAILABLE PRODUCTS <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
    </div>
    <Footer />
  </div>
);

export default Products;
