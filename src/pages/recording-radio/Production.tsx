import { motion } from "framer-motion";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import QuoteRequestModal from "@/components/QuoteRequestModal";

const packages = [
  { name: "Promo Launch", episode: "£150", series: "£1,200" },
  { name: "Promo Growth", episode: "£165", series: "£1,320" },
  { name: "Promo Full", episode: "£205", series: "£1,640" },
  { name: "Basic", episode: "£250", series: "£2,000" },
  { name: "Standard", episode: "£350", series: "£2,800" },
  { name: "Premium", episode: "£450", series: "£3,600" },
  { name: "B2B Corporate", episode: "£500", series: "£4,000" },
];

const Production = () => {
  const [quoteOpen, setQuoteOpen] = useState(false);
  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navbar />
      <div className="grain-overlay" />
      <main className="container space-y-10 pt-24 pb-16">
        <motion.header initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-3xl text-center">
          <p className="mb-2 font-mono text-xs uppercase tracking-[0.3em] text-primary">Recording & Radio</p>
          <h1 className="font-bebas text-5xl text-foreground md:text-7xl">PODCAST & SHOW PRODUCTION</h1>
          <p className="mx-auto mt-3 max-w-xl font-barlow text-muted-foreground">Finished-episode packages for independent creators and corporate productions.</p>
        </motion.header>

        <section className="mx-auto max-w-4xl" aria-label="Production package rates">
          <div className="overflow-x-auto border-y border-border">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-secondary/40 font-bebas text-lg tracking-wide text-foreground">
                <tr><th className="p-4">Package</th><th className="p-4 text-right">Per episode</th><th className="p-4 text-right">8 episodes</th></tr>
              </thead>
              <tbody className="font-barlow">
                {packages.map((item) => <tr key={item.name} className="border-b border-border last:border-0"><th scope="row" className="p-4 font-medium text-foreground">{item.name}</th><td className="p-4 text-right font-mono text-primary">{item.episode}</td><td className="p-4 text-right font-mono text-primary">{item.series}</td></tr>)}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">Prices are for finished episodes and include package-specific production and delivery, not just room hire. Deliverables and revision limits vary by package. Prices are published without VAT; Fully Governed Studios is not VAT registered.</p>
        </section>

        <section className="mx-auto flex max-w-4xl flex-col gap-4 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-bebas text-2xl text-foreground">DRY HIRE OR YOUR OWN SHOW</h2>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">Self-operated stream-room hire is £45 per hour. Send a brief for a custom show, live production, or series plan.</p>
          </div>
          <Button onClick={() => setQuoteOpen(true)} className="shrink-0">Request a quote</Button>
        </section>
      </main>
      <Footer />
      <QuoteRequestModal open={quoteOpen} onOpenChange={setQuoteOpen} prefilledService="Radio production" />
    </div>
  );
};

export default Production;
