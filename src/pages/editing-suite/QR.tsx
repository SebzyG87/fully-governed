import { motion } from "framer-motion";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import QuoteRequestModal from "@/components/QuoteRequestModal";

const QR = () => {
  const [quoteOpen, setQuoteOpen] = useState(false);
  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navbar />
      <div className="grain-overlay" />
      <main className="container space-y-10 pt-24 pb-16">
        <motion.header initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-3xl text-center">
          <p className="mb-2 font-mono text-xs uppercase tracking-[0.3em] text-primary">Fashion, print & NFC</p>
          <h1 className="font-bebas text-5xl text-foreground md:text-7xl">NFC & QR PRODUCTION</h1>
          <p className="mx-auto mt-3 max-w-xl font-barlow text-muted-foreground">Physical smart tags and QR items that connect your product or release to a digital destination.</p>
        </motion.header>
        <section className="mx-auto max-w-3xl" aria-label="NFC and QR prices">
          <div className="divide-y divide-border border-y border-border">
            <div className="flex items-center justify-between gap-4 py-5"><h2 className="font-barlow text-foreground">Single NFC/QR item</h2><p className="font-mono text-primary">£12</p></div>
            <div className="flex items-center justify-between gap-4 py-5"><h2 className="font-barlow text-foreground">NFC / QR packs</h2><p className="font-mono text-primary">£35–£125</p></div>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">Materials and the destination setup are confirmed with the order. Physical production is subject to design, stock and equipment checks.</p>
        </section>
        <div className="text-center"><Button onClick={() => setQuoteOpen(true)}>Request NFC/QR production</Button></div>
      </main>
      <Footer />
      <QuoteRequestModal open={quoteOpen} onOpenChange={setQuoteOpen} prefilledService="NFC/QR production" />
    </div>
  );
};

export default QR;
