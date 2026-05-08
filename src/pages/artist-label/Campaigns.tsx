import { motion } from "framer-motion";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import QuoteRequestModal from "@/components/QuoteRequestModal";

const Campaigns = () => {
  const [quoteOpen, setQuoteOpen] = useState(false);
  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navbar />
      <div className="grain-overlay" />
      <div className="container pt-24 pb-16 space-y-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <p className="font-mono text-xs tracking-[0.3em] text-primary mb-2 uppercase">My Label</p>
          <h1 className="font-bebas text-5xl md:text-7xl text-foreground tracking-wider">CAMPAIGNS</h1>
        </motion.div>

        <div className="max-w-3xl mx-auto space-y-8">
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="font-bebas text-2xl text-foreground tracking-wider mb-4">DIGITAL CAMPAIGN SUPPORT</h2>
            <p className="text-sm text-muted-foreground font-barlow mb-4">Social media management, ad setup, email marketing, content scheduling.</p>
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <tbody className="font-barlow">
                  <tr className="border-b border-border"><td className="p-3 text-muted-foreground">Monthly Management</td><td className="p-3 text-right text-primary font-mono">£200–£600/month</td></tr>
                  <tr><td className="p-3 text-muted-foreground">Per Campaign</td><td className="p-3 text-right text-primary font-mono">£1,500–£4,000</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="font-bebas text-2xl text-foreground tracking-wider mb-4">PHYSICAL CAMPAIGN SUPPORT</h2>
            <p className="text-sm text-muted-foreground font-barlow mb-4">Street team coordination, event planning, in-store promotions, merchandise distribution.</p>
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <tbody className="font-barlow">
                  <tr className="border-b border-border"><td className="p-3 text-muted-foreground">Per Region</td><td className="p-3 text-right text-primary font-mono">£300–£800</td></tr>
                  <tr><td className="p-3 text-muted-foreground">National Campaign</td><td className="p-3 text-right text-primary font-mono">£1,000–£3,000</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="font-bebas text-2xl text-foreground tracking-wider mb-4">ONLINE CAMPAIGN MANAGEMENT</h2>
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <tbody className="font-barlow">
                  <tr className="border-b border-border"><td className="p-3 text-muted-foreground">Strategy & Setup</td><td className="p-3 text-right text-primary font-mono">£500–£2,000</td></tr>
                  <tr><td className="p-3 text-muted-foreground">Ongoing Management</td><td className="p-3 text-right text-primary font-mono">£800–£5,000/month</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="text-center">
            <Button variant="outline" onClick={() => setQuoteOpen(true)} className="font-bebas text-lg tracking-wider px-8 h-12">REQUEST A QUOTE</Button>
          </div>
        </div>
      </div>
      <Footer />
      <QuoteRequestModal open={quoteOpen} onOpenChange={setQuoteOpen} prefilledService="Campaign Management" />
    </div>
  );
};

export default Campaigns;
