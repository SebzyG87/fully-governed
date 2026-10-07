import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const roomRates = [
  { name: "Music Studio dry hire", details: "2-hour minimum · preferred 4-hour block", price: "£12.50 / hour" },
  { name: "Music Studio annual rate", details: "Annual booking arrangement", price: "£7.50 / hour" },
  { name: "Podcast room, audio-only self-service", details: "4 broadcast mics, headphones, RØDECaster Pro II; raw WAV/MP3", price: "£49.99 / hour" },
  { name: "Video room, self-operated", details: "306 sq. ft. room; client brings or operates cameras", price: "£70 / hour" },
  { name: "Stream Room dry hire", details: "Self-operated room hire", price: "£45 / hour" },
  { name: "Edit Suite", details: "Intro / Standard / Annual · annual plan has a 25-hour monthly minimum", price: "£10 / £20 / £19.99 per hour" },
  { name: "Engineer add-on", details: "Added to room hire", price: "£25 flat" },
  { name: "Creative time packs", details: "25 / 50 / 100 hours", price: "£250 / £500 / £750" },
];

const productionRates = [
  ["Promo Launch", "£150", "£1,200"],
  ["Promo Growth", "£165", "£1,320"],
  ["Promo Full", "£205", "£1,640"],
  ["Basic", "£250", "£2,000"],
  ["Standard", "£350", "£2,800"],
  ["Premium", "£450", "£3,600"],
  ["B2B Corporate", "£500", "£4,000"],
];

const makerRates = [
  ["Garment alteration / custom patch", "£15 / £20"],
  ["Sample garment / custom garment", "£60 / £150"],
  ["Logo design / full brand identity", "£75 / £450"],
  ["3D print: small / medium / large / engineering", "£15 / £25 / £45 / £60"],
  ["Embroidery: simple / medium / full back", "£30 / £45 / £75"],
  ["Bulk embroidery (10 items) / digitising", "£220 / £30"],
  ["Transfer print: T-shirt / hoodie", "£20 / £30"],
  ["A1 / A0 print", "£18 / £28"],
  ["A1 laminated / foam-mounted", "£25 / £32"],
  ["Single NFC/QR item / NFC packs", "£12 / £35–£125"],
];

const consultationRates = [
  ["New Creator Start-up (60 min)", "£45"],
  ["Podcast Strategy & Growth (90 min)", "£75"],
  ["Studio Production Planning (90 min)", "£85"],
  ["Stream / Content Setup (90 min)", "£95"],
  ["Business Scale-Up Roadmap (2 hours)", "£150"],
];

const Pricing = () => (
  <div className="min-h-screen bg-background">
    <div className="grain-overlay" />
    <Navbar />
    <main className="container space-y-12 pt-24 pb-16">
      <motion.header initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <h1 className="font-bebas text-5xl text-foreground md:text-7xl">PRICING</h1>
        <p className="mt-2 font-barlow text-muted-foreground">Studio hire and production rates</p>
      </motion.header>

      <section className="mx-auto max-w-5xl" aria-labelledby="room-rates">
        <h2 id="room-rates" className="mb-3 font-bebas text-2xl text-foreground">ROOM & EQUIPMENT HIRE</h2>
        <div className="divide-y divide-border border-y border-border">
          {roomRates.map((item) => (
            <div key={item.name} className="flex flex-col gap-1 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
              <div>
                <h3 className="font-barlow font-semibold text-foreground">{item.name}</h3>
                <p className="text-sm text-muted-foreground">{item.details}</p>
              </div>
              <p className="shrink-0 font-mono text-primary">{item.price}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-5xl" aria-labelledby="podcast-rates">
        <h2 id="podcast-rates" className="mb-3 font-bebas text-2xl text-foreground">PODCAST & SHOW PRODUCTION</h2>
        <div className="overflow-x-auto border-y border-border">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border font-bebas text-lg text-foreground"><tr><th className="p-3">Package</th><th className="p-3 text-right">Per episode</th><th className="p-3 text-right">8 episodes</th></tr></thead>
            <tbody>{productionRates.map(([name, episode, series]) => <tr key={name} className="border-b border-border last:border-0"><th scope="row" className="p-3 font-barlow font-medium text-foreground">{name}</th><td className="p-3 text-right font-mono text-primary">{episode}</td><td className="p-3 text-right font-mono text-primary">{series}</td></tr>)}</tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">Production prices are for finished episodes, not room hire. No VAT is added; Fully Governed Studios is not VAT registered.</p>
      </section>

      <section className="mx-auto max-w-5xl" aria-labelledby="maker-rates">
        <h2 id="maker-rates" className="mb-3 font-bebas text-2xl text-foreground">FASHION, PRINT, 3D & NFC</h2>
        <div className="divide-y divide-border border-y border-border">
          {makerRates.map(([name, price]) => <div key={name} className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between"><h3 className="font-barlow text-sm text-foreground">{name}</h3><p className="font-mono text-primary">{price}</p></div>)}
        </div>
      </section>

      <section className="mx-auto max-w-5xl" aria-labelledby="consultation-rates">
        <h2 id="consultation-rates" className="mb-3 font-bebas text-2xl text-foreground">CONSULTATIONS</h2>
        <div className="divide-y divide-border border-y border-border">
          {consultationRates.map(([name, price]) => <div key={name} className="flex items-center justify-between gap-4 py-3"><h3 className="font-barlow text-sm text-foreground">{name}</h3><p className="shrink-0 font-mono text-primary">{price}</p></div>)}
        </div>
      </section>

      <p className="mx-auto max-w-5xl text-xs text-muted-foreground">Prices are in GBP. VAT is not added. Only verified, operational equipment is available; confirm requirements when booking.</p>

      <div className="text-center">
        <Link to="/book" className="inline-flex items-center justify-center bg-primary px-6 py-3 font-bebas text-lg tracking-wider text-primary-foreground transition-colors hover:bg-primary/90">CHECK AVAILABILITY</Link>
      </div>
    </main>
    <Footer />
  </div>
);

export default Pricing;
