import { motion } from "framer-motion";
import { Instagram, MessageCircle, MapPin } from "lucide-react";

const socials = [
  {
    icon: Instagram,
    label: "INSTAGRAM",
    description: "Behind the scenes, sessions & community updates",
    href: "https://instagram.com/fullygoverned",
    cta: "FOLLOW US",
  },
  {
    icon: MessageCircle,
    label: "WHATSAPP",
    description: "Quick bookings, questions & direct contact",
    href: "https://wa.me/447000000000",
    cta: "MESSAGE US",
  },
  {
    icon: MapPin,
    label: "GOOGLE MAPS",
    description: "Find us, leave a review & share with friends",
    href: "https://maps.google.com/?q=Fully+Governed+Lewisham",
    cta: "GET DIRECTIONS",
  },
];

const CommunitySection = () => {
  return (
    <section id="community" className="py-24 bg-card">
      <div className="container px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="font-mono text-xs tracking-[0.3em] text-primary mb-2 uppercase">
            Join the Movement
          </p>
          <h2 className="font-bebas text-5xl md:text-7xl text-foreground tracking-wider">
            COMMUNITY
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {socials.map((s, i) => (
            <motion.a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group bg-secondary border border-border rounded-lg p-6 text-center hover:border-interactive hover:shadow-[0_0_12px_hsl(var(--interactive))] transition-all"
            >
              <s.icon className="w-8 h-8 text-primary mx-auto mb-3 group-hover:text-interactive transition-colors" />
              <h3 className="font-bebas text-xl text-foreground tracking-wider mb-1">{s.label}</h3>
              <p className="font-barlow text-sm text-muted-foreground mb-4">{s.description}</p>
              <span className="font-mono text-xs text-interactive tracking-wider">{s.cta} →</span>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CommunitySection;
