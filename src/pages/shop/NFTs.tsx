import { Radio, Smartphone } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const NFTs = () => (
  <div className="min-h-screen bg-background pb-20 md:pb-0">
    <Navbar />
    <main className="container max-w-3xl pt-24 pb-16 space-y-8">
      <header className="text-center space-y-3">
        <p className="font-mono text-xs text-primary uppercase">Fully Governed Studios</p>
        <h1 className="font-bebas text-5xl text-foreground">RADIO & NFC</h1>
        <p className="text-muted-foreground">The proposed service is being prepared. Online radio broadcasts and NFC music products are not available to purchase yet.</p>
      </header>
      <section className="grid gap-6 sm:grid-cols-2">
        <div className="border border-border p-5 space-y-3">
          <Radio className="text-primary" aria-hidden="true" />
          <h2 className="font-bebas text-2xl">RADIO</h2>
          <p className="text-sm text-muted-foreground">Show proposals and music submissions can be discussed with the studio. Broadcast availability depends on licensing and technical setup.</p>
        </div>
        <div className="border border-border p-5 space-y-3">
          <Smartphone className="text-primary" aria-hidden="true" />
          <h2 className="font-bebas text-2xl">NFC MUSIC PRODUCTS</h2>
          <p className="text-sm text-muted-foreground">Artist keyrings and tap-to-listen pages are planned. Artist terms, product details and prices will be confirmed before launch.</p>
        </div>
      </section>
    </main>
    <Footer />
  </div>
);

export default NFTs;
