import { motion } from "framer-motion";
import { Disc3, Usb, Users, Sparkles, FileText, Megaphone, GraduationCap } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import QuoteRequestModal from "@/components/QuoteRequestModal";

const services = [
  {
    icon: Disc3,
    title: "DIGITAL VINYL PRODUCTION",
    description: "Professional formatting and packaging for Digital Vinyl releases (WAV/FLAC + artwork).",
    items: [{ service: "Per Project", rate: "£50–£300" }],
  },
  {
    icon: Usb,
    title: "USB STICK PRELOADING",
    description: "Custom branded USB sticks preloaded with your music, videos and behind-the-scenes content.",
    items: [
      { service: "Per Unit", rate: "£10–£50" },
      { service: "Bundle Packages", rate: "£100–£800" },
    ],
  },
  {
    icon: Users,
    title: "DIRECT-TO-FAN SETUP",
    description: "Get your products listed on the Digital Vinyl platform and start selling to fans.",
    items: [{ service: "Setup Fee", rate: "£50–£150" }],
  },
  {
    icon: Sparkles,
    title: "NFT-READY ASSET CREATION",
    description: "Prepare your music, artwork and videos as limited edition NFT-ready collectibles.",
    items: [{ service: "Per Project", rate: "£50–£500" }],
  },
  {
    icon: FileText,
    title: "CONTENT STRATEGY",
    description: "Full content strategy planning for your release cycle and online presence.",
    items: [{ service: "Per Project", rate: "£300–£800" }],
  },
  {
    icon: Megaphone,
    title: "CONTENT PRODUCTION",
    description: "Video, photo and written content produced to brief.",
    items: [
      { service: "Hourly", rate: "£30–£60/hr" },
      { service: "Per Piece", rate: "£50–£200" },
    ],
  },
  {
    icon: GraduationCap,
    title: "TRAINING & WORKSHOPS",
    description: "Learn the tools and techniques for self-sufficient content creation.",
    items: [
      { service: "Per Session", rate: "£50–£100" },
      { service: "Full Course", rate: "£200–£500" },
    ],
  },
];

const uniqueAddOns = [
  { name: "AI-Enhanced Editing", rate: "£45–£75/hr" },
  { name: "Archive Footage Restoration", rate: "£50–£80/hr" },
  { name: "Branded Asset Packs", rate: "£100–£400" },
  { name: "Interactive Video Editing", rate: "£300–£1,200" },
];

const Platform = () => {
  const [quoteOpen, setQuoteOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navbar />
      <div className="grain-overlay" />
      <div className="container pt-24 pb-16 space-y-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <p className="font-mono text-xs tracking-[0.3em] text-primary mb-2 uppercase">Editing Suite</p>
          <h1 className="font-bebas text-5xl md:text-7xl text-foreground tracking-wider">PLATFORM-ENABLED SERVICES</h1>
          <p className="text-muted-foreground font-barlow mt-2 max-w-xl mx-auto">Digital Vinyl production, USB preloading, direct-to-fan distribution, content strategy and training.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {services.map((svc, i) => (
            <motion.div key={svc.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} className="bg-card border border-border rounded-lg p-6">
              <svc.icon className="w-8 h-8 text-primary mb-4" />
              <h3 className="font-bebas text-lg text-foreground tracking-wider mb-2">{svc.title}</h3>
              <p className="text-sm text-muted-foreground font-barlow mb-4">{svc.description}</p>
              <div className="space-y-2 border-t border-border pt-4">
                {svc.items.map((item) => (
                  <div key={item.service} className="flex justify-between text-sm">
                    <span className="text-muted-foreground font-barlow">{item.service}</span>
                    <span className="text-primary font-mono">{item.rate}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Unique Add-Ons */}
        <div className="max-w-3xl mx-auto">
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="p-4 border-b border-border">
              <h3 className="font-bebas text-xl text-foreground tracking-wider">UNIQUE ADD-ONS</h3>
            </div>
            <table className="w-full text-sm">
              <tbody className="font-barlow">
                {uniqueAddOns.map((addon, i) => (
                  <tr key={addon.name} className={i < uniqueAddOns.length - 1 ? "border-b border-border" : ""}>
                    <td className="p-4 text-muted-foreground">{addon.name}</td>
                    <td className="p-4 text-right text-primary font-mono whitespace-nowrap">{addon.rate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="text-center bg-card border border-border rounded-lg p-8 max-w-2xl mx-auto">
          <h3 className="font-bebas text-2xl text-foreground tracking-wider mb-2">WANT TO SELL ON THE PLATFORM?</h3>
          <p className="text-sm text-muted-foreground font-barlow mb-4">Artists keep 85% of sales. 10% studio tech fee, 5% payment processing.</p>
          <Link to="/vinyl/artists"><Button variant="outline" className="font-bebas tracking-wider">LEARN MORE ABOUT SELLING</Button></Link>
        </div>

        <div className="flex gap-4 justify-center">
          <Link to="/book"><Button className="font-bebas text-lg tracking-wider px-8 h-12">BOOK NOW</Button></Link>
          <Button variant="outline" onClick={() => setQuoteOpen(true)} className="font-bebas text-lg tracking-wider px-8 h-12">REQUEST A QUOTE</Button>
        </div>
      </div>
      <Footer />
      <QuoteRequestModal open={quoteOpen} onOpenChange={setQuoteOpen} prefilledService="Digital Vinyl Production" />
    </div>
  );
};

export default Platform;
