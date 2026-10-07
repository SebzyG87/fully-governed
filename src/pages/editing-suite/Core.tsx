import { motion } from "framer-motion";
import { Video, Palette, Camera, Music, QrCode, Sparkles, ArrowRight } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import QuoteRequestModal from "@/components/QuoteRequestModal";

const sections = [
  {
    icon: Video,
    title: "VIDEO EDITING",
    href: "/editing-suite/video",
    items: [
      { service: "Reels (from recording sessions)", rate: "Request a quote" },
      { service: "Blog & Interview Videos", rate: "Request a quote" },
      { service: "Video Editing (promos, tutorials, social media)", rate: "Request a quote" },
      { service: "Colour Grading", rate: "Request a quote" },
    ],
    note: "Reels include cutting, trimming, transitions, basic colour correction and platform optimisation.",
  },
  {
    icon: Sparkles,
    title: "ANIMATION",
    href: "/editing-suite/animation",
    items: [
      { service: "Simple 2D / Text Animation", rate: "Request a quote" },
      { service: "Complex 2D / 3D Animation, VFX, Character", rate: "Request a quote" },
      { service: "Campaign Editing (brand, non-profit)", rate: "Request a quote" },
    ],
    note: "Simple: logo animations, title sequences. Complex: character animation, 3D visuals, detailed explainers.",
  },
  {
    icon: Camera,
    title: "PHOTO & GRAPHICS",
    href: "/editing-suite/photo",
    items: [
      { service: "Photo Shoot Edits (retouching, compositing)", rate: "Request a quote" },
      { service: "Digital Graphics (social posts, banners)", rate: "Request a quote" },
      { service: "Print Materials (flyers, brochures)", rate: "See print and design prices" },
      { service: "Branding Packages (logo, guidelines, assets)", rate: "Request a quote" },
    ],
  },
  {
    icon: Music,
    title: "AUDIO",
    href: "/editing-suite/audio",
    items: [
      { service: "Audio Editing (podcasts, music, sound design)", rate: "Request a quote" },
      { service: "Audio Mixing & Mastering", rate: "Request a quote" },
      { service: "Radio Show Production", rate: "See podcast production packages" },
    ],
  },
  {
    icon: QrCode,
    title: "QR CODES",
    href: "/editing-suite/qr",
    items: [
      { service: "NFC / QR item and packs", rate: "See NFC & QR prices" },
    ],
    note: "Branded, tracking-enabled QR codes for your marketing materials.",
  },
  {
    icon: Palette,
    title: "ADD-ON SERVICES",
    href: null as string | null,
    items: [
      { service: "1-Hour Flip (rushed delivery)", rate: "Premium Add-on" },
      { service: "AI Avatar Design", rate: "POA" },
      { service: "Dropbox File Upload Link", rate: "Included with booking" },
    ],
    note: "1-Hour Flip: your social clips delivered within 60 minutes of your session.",
  },
];

const Core = () => {
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [selectedService, setSelectedService] = useState("");

  const openQuote = (service: string) => {
    setSelectedService(service);
    setQuoteOpen(true);
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navbar />
      <div className="grain-overlay" />
      <div className="container pt-24 pb-16 space-y-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <Link to="/editing-suite" className="font-mono text-xs text-muted-foreground hover:text-primary transition-colors">
            ← Back to Editing Suite
          </Link>
          <h1 className="font-bebas text-5xl md:text-7xl text-foreground tracking-wider mt-4">
            CORE EDITING SERVICES
          </h1>
          <p className="text-muted-foreground font-barlow mt-2 max-w-xl mx-auto">
            Video, animation, graphics, audio and QR codes — all under one roof.
          </p>
        </motion.div>

        <div className="space-y-12 max-w-4xl mx-auto">
          {sections.map((section, i) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-card border border-border rounded-lg p-6"
            >
              <div className="flex items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <section.icon className="w-6 h-6 text-primary" />
                  <h2 className="font-bebas text-2xl text-foreground tracking-wider">{section.title}</h2>
                </div>
                {section.href && (
                  <Link to={section.href} className="flex items-center gap-1 text-xs font-mono text-primary hover:underline whitespace-nowrap">
                    Full page <ArrowRight className="w-3 h-3" />
                  </Link>
                )}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 text-muted-foreground font-barlow font-medium">Service</th>
                      <th className="text-right py-2 text-muted-foreground font-barlow font-medium">Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {section.items.map((item) => (
                      <tr key={item.service} className="border-b border-border/50">
                        <td className="py-3 text-foreground font-barlow">{item.service}</td>
                        <td className="py-3 text-primary font-mono text-right whitespace-nowrap">{item.rate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {section.note && (
                <p className="text-xs text-muted-foreground font-barlow mt-3 italic">{section.note}</p>
              )}
            </motion.div>
          ))}
        </div>

        <div className="text-center">
          <Button className="font-bebas text-lg tracking-wider px-8 h-12" onClick={() => openQuote("Video Editing")}>
            REQUEST A QUOTE
          </Button>
          <p className="text-xs text-muted-foreground mt-2 font-mono">
            Complex custom work is always quoted individually
          </p>
        </div>
      </div>
      <Footer />
      <QuoteRequestModal open={quoteOpen} onOpenChange={setQuoteOpen} prefilledService={selectedService} />
    </div>
  );
};

export default Core;
