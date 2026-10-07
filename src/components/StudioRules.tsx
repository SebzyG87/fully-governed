import { motion } from "framer-motion";
import {
  Ban,
  Camera,
  Trash2,
  SprayCan,
  Lightbulb,
  ClipboardList,
  ShieldCheck,
  Car,
} from "lucide-react";

const rules = [
  { icon: Ban, text: "No smoking on premises" },
  { icon: Camera, text: "Photo of room clean required after every dry hire" },
  { icon: Ban, text: "No eating in the studio — waiting room only" },
  { icon: Trash2, text: "Empty bin and spray room after session" },
  { icon: Lightbulb, text: "Turn off lights after dry hire" },
  { icon: ClipboardList, text: "All sessions must be logged online or manually" },
  { icon: ShieldCheck, text: "Respect all equipment — PAC tested and insured" },
  { icon: Car, text: "Ask the studio to confirm parking availability" },
];

const StudioRules = () => {
  return (
    <section id="rules" className="py-24 bg-card">
      <div className="container px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="font-mono text-xs tracking-[0.3em] text-primary mb-2 uppercase">
            Respect the Space
          </p>
          <h2 className="font-bebas text-5xl md:text-7xl text-foreground tracking-wider">
            STUDIO RULES
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
          {rules.map((rule, i) => (
            <motion.div
              key={rule.text}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.03 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05, type: "spring", stiffness: 300, damping: 20 }}
              className="flex items-start gap-3 bg-secondary p-4 rounded-lg border border-border hover:border-interactive hover:shadow-[0_0_12px_hsl(var(--interactive))] transition-all cursor-default"
            >
              <rule.icon className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <p className="font-barlow text-sm text-muted-foreground">{rule.text}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StudioRules;
