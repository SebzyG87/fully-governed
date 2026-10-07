import { motion } from "framer-motion";
import { Scissors, Video, Headphones, Sparkles, Zap, ArrowRight, Music, Camera, Palette, QrCode, Megaphone } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";

const sections = [
  {
    title: "CORE EDITING SERVICES",
    description: "Video editing, animation, photo and graphics, audio, NFC/QR production and add-ons.",
    href: "/editing-suite/core",
    icon: Video,
  },
  {
    title: "STREAMING & GAMING",
    description: "Streaming and gaming production enquiries; equipment and setup are confirmed by quote.",
    href: "/editing-suite/streaming",
    icon: Zap,
  },
  {
    title: "VOICEOVER & AUDIOBOOKS",
    description: "Professional voiceover, audiobook production and voice coaching.",
    href: "/editing-suite/voiceover",
    icon: Headphones,
  },
  {
    title: "PLATFORM-ENABLED SERVICES",
    description: "Digital releases, USB preloading, direct-to-fan setup and NFC/QR production.",
    href: "/editing-suite/platform",
    icon: Sparkles,
  },
  {
    title: "RENTAL OPTIONS",
    description: "Flexible room rentals — hourly, daily, weekly or monthly.",
    href: "/editing-suite/rental",
    icon: Scissors,
  },
];

const quickServices = [
  { title: "VIDEO EDITING", href: "/editing-suite/video", icon: Video },
  { title: "ANIMATION", href: "/editing-suite/animation", icon: Sparkles },
  { title: "AUDIO & MIXING", href: "/editing-suite/audio", icon: Music },
  { title: "PHOTO & GRAPHICS", href: "/editing-suite/photo", icon: Camera },
  { title: "COLOUR GRADING", href: "/editing-suite/color", icon: Palette },
  { title: "CAMPAIGNS", href: "/editing-suite/campaign", icon: Megaphone },
  { title: "QR CODES", href: "/editing-suite/qr", icon: QrCode },
  { title: "STREAMING & GAMING", href: "/editing-suite/streaming", icon: Zap },
  { title: "VOICEOVER", href: "/editing-suite/voiceover", icon: Headphones },
];

const quickPricing = [
  { service: "Edit Suite intro rate", rate: "£10/hr" },
  { service: "Edit Suite standard rate", rate: "£20/hr" },
  { service: "Edit Suite annual rate", rate: "£19.99/hr" },
  { service: "Additional editing", rate: "Request a quote" },
  { service: "Revision", rate: "Request a quote" },
  { service: "Custom editing and production", rate: "Request a quote" },
];

const Editing = () => (
  <div className="min-h-screen bg-background pb-20 md:pb-0">
    <Navbar />
    <div className="grain-overlay" />
    <div className="container pt-24 pb-16 space-y-16">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <p className="font-mono text-xs tracking-[0.3em] text-primary mb-2 uppercase">Post-Production Services</p>
        <h1 className="font-bebas text-5xl md:text-7xl text-foreground tracking-wider">EDITING SUITE & CREATIVE HUB</h1>
        <p className="text-muted-foreground font-barlow mt-2 max-w-xl mx-auto">
          Don't just record — finish. Our in-house team handles mixing, mastering, video editing, animation and more.
        </p>
      </motion.div>

      {/* Quick Pricing Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="bg-card border border-border rounded-lg p-6 max-w-3xl mx-auto"
      >
        <h2 className="font-bebas text-2xl text-foreground tracking-wider mb-4 text-center">QUICK PRICING</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {quickPricing.map((item) => (
            <div key={item.service} className="text-center">
              <p className="text-sm text-muted-foreground font-barlow">{item.service}</p>
              <p className="text-primary font-mono text-sm">{item.rate}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Service Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {sections.map((section, i) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
          >
            <Link
              to={section.href}
              className="block bg-card border border-border rounded-lg p-6 hover:border-primary/50 transition-colors group h-full"
            >
              <section.icon className="w-8 h-8 text-primary mb-4" />
              <h3 className="font-bebas text-xl text-foreground tracking-wider mb-2 group-hover:text-primary transition-colors">
                {section.title}
              </h3>
              <p className="text-sm text-muted-foreground font-barlow mb-4">{section.description}</p>
              <div className="flex items-center gap-2 text-primary text-sm font-mono">
                View Services <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Quick Service Access */}
      <div className="max-w-5xl mx-auto">
        <h2 className="font-bebas text-2xl text-foreground tracking-wider mb-6 text-center">JUMP TO A SERVICE</h2>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
          {quickServices.map((s) => (
            <Link
              key={s.href}
              to={s.href}
              className="flex flex-col items-center gap-2 bg-card border border-border rounded-lg p-4 hover:border-primary/50 hover:text-primary transition-colors group text-center"
            >
              <s.icon className="w-5 h-5 text-primary" />
              <span className="font-bebas text-xs tracking-wider text-foreground group-hover:text-primary leading-tight">{s.title}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="text-center">
        <Link to="/book">
          <Button className="font-bebas text-lg tracking-wider px-8 h-12">
            BOOK A SESSION
          </Button>
        </Link>
        <p className="text-xs text-muted-foreground mt-2 font-mono">Or request a custom quote on any service page</p>
      </div>
    </div>
    <Footer />
  </div>
);

export default Editing;
