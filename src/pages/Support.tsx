import { motion } from "framer-motion";
import { Headphones, Globe, Smartphone, Megaphone, Rocket, Wrench } from "lucide-react";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import QuoteRequestModal from "@/components/QuoteRequestModal";

const supportServices = [
  {
    icon: Headphones,
    title: "TECHNICAL SUPPORT",
    description: "On-demand troubleshooting for websites, ordering systems and digital tools. Team training on digital tools.",
    pricing: [
      { service: "Hourly Support", rate: "Request a quote" },
      { service: "Priority support retainer", rate: "Request a quote" },
    ],
  },
  {
    icon: Globe,
    title: "WEBSITE DEVELOPMENT & MAINTENANCE",
    description: "Responsive website builds with portfolio, services and payment gateway sections. Timeline: 4–6 weeks for initial build.",
    pricing: [
      { service: "Initial Build", rate: "Request a quote" },
      { service: "Monthly Maintenance", rate: "Request a quote" },
    ],
  },
  {
    icon: Smartphone,
    title: "APP & PLATFORM INTEGRATION",
    description: "Third-party app integrations, booking systems, analytics tools. Timeline: 2–3 weeks post-website launch.",
    pricing: [
      { service: "Integration Package", rate: "Request a quote" },
      { service: "Ad-hoc Tasks", rate: "Request a quote" },
    ],
  },
  {
    icon: Megaphone,
    title: "DIGITAL MARKETING TOOLS",
    description: "Email marketing platform setup and management (e.g. Mailchimp), landing pages for campaigns, local SEO optimisation.",
    pricing: [
      { service: "Monthly Management", rate: "Request a quote" },
    ],
  },
  {
    icon: Rocket,
    title: "CAMPAIGN MANAGEMENT",
    description: "Full campaign strategy, setup, optimisation, analytics and ad management.",
    pricing: [
      { service: "Strategy & Setup", rate: "Request a quote" },
      { service: "Ongoing Management", rate: "Request a quote" },
    ],
  },
  {
    icon: Wrench,
    title: "FUTURE DEVELOPMENT",
    description: "Custom mobile app development and AI-powered features. Contact us to register interest.",
    pricing: [
      { service: "Custom Mobile App", rate: "Request a quote" },
      { service: "AI Features", rate: "POA (phased rollout)" },
    ],
  },
];

const Support = () => {
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
      <div className="container pt-24 pb-16 space-y-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <p className="font-mono text-xs tracking-[0.3em] text-primary mb-2 uppercase">
            Business & Creator Support
          </p>
          <h1 className="font-bebas text-5xl md:text-7xl text-foreground tracking-wider">
            SUPPORT SERVICES
          </h1>
          <p className="text-muted-foreground font-barlow mt-2 max-w-2xl mx-auto">
            Technical, digital marketing and development support for businesses and creators.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {supportServices.map((svc, i) => (
            <motion.div
              key={svc.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-card border border-border rounded-lg p-6"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <svc.icon className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bebas text-xl text-foreground tracking-wider">
                    {svc.title}
                  </h3>
                  <p className="text-sm text-muted-foreground font-barlow mt-1">
                    {svc.description}
                  </p>
                </div>
              </div>

              <div className="border-t border-border pt-4 space-y-2">
                {svc.pricing.map((p) => (
                  <div key={p.service} className="flex justify-between text-sm">
                    <span className="text-muted-foreground font-barlow">{p.service}</span>
                    <span className="text-primary font-mono">{p.rate}</span>
                  </div>
                ))}
              </div>

              <Button
                variant="outline"
                className="w-full mt-4 font-mono text-xs"
                onClick={() => openQuote(svc.title.replace("& ", "").replace(" ", " "))}
              >
                Request a Quote
              </Button>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto"
        >
          <p className="text-muted-foreground font-barlow mb-4">
            Not sure what you need? Get in touch and we'll help you figure it out.
          </p>
          <Button
            className="font-bebas text-lg tracking-wider px-8"
            onClick={() => openQuote("Other")}
          >
            GET IN TOUCH
          </Button>
        </motion.div>
      </div>
      <Footer />
      <QuoteRequestModal
        open={quoteOpen}
        onOpenChange={setQuoteOpen}
        prefilledService={selectedService}
      />
    </div>
  );
};

export default Support;
