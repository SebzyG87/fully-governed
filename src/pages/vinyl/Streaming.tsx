import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const rows = [
  { stream: "Sales Commission", details: "Studio takes commission on all sales", rate: "10–20% per transaction" },
  { stream: "Ad-Supported Streaming", details: "Revenue from ads on free streams", rate: "£0.002–£0.005 per stream" },
  { stream: "Subscription Streaming", details: "Monthly split with artists", rate: "60% artists / 40% platform" },
  { stream: "Artist Premium Subscription", details: "Advanced tools for artists", rate: "£15 per artist per month" },
  { stream: "Platform Integration Fees", details: "Social and website linking", rate: "£50–£100 per setup" },
  { stream: "Packaging & Fulfilment", details: "USB, packaging, shipping markup", rate: "£2–£5 per unit" },
];

const Streaming = () => (
  <div className="min-h-screen bg-background pb-20 md:pb-0">
    <Navbar />
    <div className="grain-overlay" />
    <div className="container pt-24 pb-16 space-y-12 max-w-4xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <p className="font-mono text-xs tracking-[0.3em] text-primary mb-2 uppercase">Digital Vinyl Platform</p>
        <h1 className="font-bebas text-5xl md:text-7xl text-foreground tracking-wider">HOW STREAMING REVENUE WORKS</h1>
        <p className="text-muted-foreground font-barlow mt-2 max-w-xl mx-auto">Informational overview of how the platform generates revenue for artists.</p>
      </motion.div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/30">
                <th className="text-left p-4 font-bebas text-base tracking-wider text-foreground">Revenue Stream</th>
                <th className="text-left p-4 font-bebas text-base tracking-wider text-foreground">Details</th>
                <th className="text-right p-4 font-bebas text-base tracking-wider text-foreground">Rate</th>
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
          Full streaming monetization launches in Phase 4 of the platform roadmap. See our{" "}
          <Link to="/story" className="text-primary hover:underline">Story page</Link>{" "}
          for the full timeline.
        </p>
      </div>
    </div>
    <Footer />
  </div>
);

export default Streaming;
