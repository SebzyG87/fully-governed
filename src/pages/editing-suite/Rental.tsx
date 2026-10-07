import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import QuoteRequestModal from "@/components/QuoteRequestModal";
import { RoomViewButtons } from "@/components/RoomGalleryModal";
import { studioRates } from "@/lib/studioRates";

const rentalOptions = [
  { type: "Music Studio dry hire", hourly: `£${studioRates.recordingHourly.toFixed(2)}`, details: "2-hour minimum; 4-hour block preferred" },
  { type: "Podcast room, audio-only", hourly: `£${studioRates.podcastSelfServiceHourly.toFixed(2)}`, details: "Self-service" },
  { type: "Video room", hourly: `£${studioRates.videoSelfOperatedHourly}`, details: "Self-operated" },
  { type: "Stream Room", hourly: `£${studioRates.streamRoomHourly}`, details: "Dry hire" },
  { type: "Edit Suite", hourly: "£10 / £20 / £19.99", details: "Intro / Standard / Annual; annual minimum 25 hours/month" },
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
                  <th className="text-center py-4 px-4 text-foreground font-bebas tracking-wider">Hourly rate</th>
                  <th className="text-left py-4 px-4 text-foreground font-bebas tracking-wider">Terms</th>
                </tr>
              </thead>
              <tbody>
                {rentalOptions.map((option, i) => (
                  <tr key={option.type} className={i < rentalOptions.length - 1 ? "border-b border-border" : ""}>
                    <td className="py-4 px-4 text-foreground font-barlow font-medium">{option.type}</td>
                    <td className="py-4 px-4 text-primary font-mono text-center">{option.hourly}</td>
                    <td className="py-4 px-4 text-muted-foreground font-barlow">{option.details}</td>
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
