import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const rows = [
  { stream: "Artist / producer share", details: "Agreed for each product in the signed contract.", rate: "Agreed in writing" },
  { stream: "NFC keyring sales", details: "Price, production costs and shares are agreed before sale.", rate: "Per signed agreement" },
  { stream: "FGS Radio airplay", details: "Broadcast begins after the stream and required music licences are active.", rate: "No rate published" },
];

const Streaming = () => (
  <div className="min-h-screen bg-background pb-20 md:pb-0">
    <Navbar />
    <div className="grain-overlay" />
    <div className="container pt-24 pb-16 space-y-12 max-w-4xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <p className="font-mono text-xs tracking-[0.3em] text-primary mb-2 uppercase">Digital Vinyl Platform</p>
        <h1 className="font-bebas text-5xl md:text-7xl text-foreground tracking-wider">HOW STREAMING REVENUE WORKS</h1>
        <p className="text-muted-foreground font-barlow mt-2 max-w-xl mx-auto">Artist payments and product shares are set out in the agreement for each release or keyring.</p>
      </motion.div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/30">
                <th className="text-left p-4 font-bebas text-base tracking-wider text-foreground">Revenue Stream</th>
                <th className="text-left p-4 font-bebas text-base tracking-wider text-foreground">How terms are set</th>
                <th className="text-right p-4 font-bebas text-base tracking-wider text-foreground">Terms</th>
              </tr>
            </thead>
            <tbody className="font-barlow">
              {rows.map((r, i) => (
                <tr key={r.stream} className={i < rows.length - 1 ? "border-b border-border" : ""}>
                  <td className="p-4 text-foreground font-medium">{r.stream}</td>
                  <td className="p-4 text-muted-foreground">{r.details}</td>
                  <td className="p-4 text-right text-primary font-mono">{r.rate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg p-6 text-center">
        <p className="text-sm text-muted-foreground font-barlow">
          Live radio and streaming monetization are not available yet. See our{" "}
          <Link to="/story" className="text-primary hover:underline">Story page</Link>{" "}
          for the full timeline.
        </p>
      </div>
    </div>
    <Footer />
  </div>
);

export default Streaming;
