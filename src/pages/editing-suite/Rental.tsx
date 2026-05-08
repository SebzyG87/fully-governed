import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import QuoteRequestModal from "@/components/QuoteRequestModal";
import { RoomViewButtons } from "@/components/RoomGalleryModal";

const rentalOptions = [
  { type: "Full Multi-Purpose Room", hourly: "£30–£50", daily: "£200–£350", weekly: "£800–£1,200", monthly: "£2,500–£4,000" },
  { type: "Editing Room Only", hourly: "£20–£30", daily: "£120–£180", weekly: "—", monthly: "—" },
  { type: "Radio Studio Only", hourly: "£25–£40", daily: "£150–£250", weekly: "—", monthly: "—" },
  { type: "Content Creation Area Only", hourly: "£15–£25", daily: "£100–£150", weekly: "—", monthly: "—" },
];

const Rental = () => {
  const [quoteOpen, setQuoteOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navbar />
      <div className="grain-overlay" />
      <div className="container pt-24 pb-16 space-y-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <p className="font-mono text-xs tracking-[0.3em] text-primary mb-2 uppercase">Editing Suite</p>
          <h1 className="font-bebas text-5xl md:text-7xl text-foreground tracking-wider">RENT THE SPACE</h1>
          <p className="text-muted-foreground font-barlow mt-2 max-w-xl mx-auto">Flexible rental options for independent editors, producers, and creators.</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-4xl mx-auto">
          <div className="overflow-x-auto">
            <table className="w-full bg-card border border-border rounded-lg overflow-hidden">
              <thead>
                <tr className="border-b border-border bg-secondary/30">
                  <th className="text-left py-4 px-4 text-foreground font-bebas tracking-wider">Rental Type</th>
                  <th className="text-center py-4 px-4 text-foreground font-bebas tracking-wider">Hourly</th>
                  <th className="text-center py-4 px-4 text-foreground font-bebas tracking-wider">Daily (8hrs)</th>
                  <th className="text-center py-4 px-4 text-foreground font-bebas tracking-wider">Weekly (5 days)</th>
                  <th className="text-center py-4 px-4 text-foreground font-bebas tracking-wider">Monthly</th>
                </tr>
              </thead>
              <tbody>
                {rentalOptions.map((option, i) => (
                  <tr key={option.type} className={i < rentalOptions.length - 1 ? "border-b border-border" : ""}>
                    <td className="py-4 px-4 text-foreground font-barlow font-medium">{option.type}</td>
                    <td className="py-4 px-4 text-primary font-mono text-center">{option.hourly}</td>
                    <td className="py-4 px-4 text-primary font-mono text-center">{option.daily}</td>
                    <td className="py-4 px-4 text-primary font-mono text-center">{option.weekly}</td>
                    <td className="py-4 px-4 text-primary font-mono text-center">{option.monthly}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        <div className="bg-card border border-border rounded-lg p-6 max-w-2xl mx-auto text-center">
          <p className="text-sm text-muted-foreground font-barlow">
            Platform access is included in all monthly rentals. Long-term and custom arrangements available — use "Request a Quote."
          </p>
        </div>

        <RoomViewButtons roomName="Multi-Use Room" />

        <div className="text-center">
          <Button className="font-bebas text-lg tracking-wider px-8 h-12" onClick={() => setQuoteOpen(true)}>REQUEST A QUOTE</Button>
        </div>
      </div>
      <Footer />
      <QuoteRequestModal open={quoteOpen} onOpenChange={setQuoteOpen} prefilledService="Other" />
    </div>
  );
};

export default Rental;
