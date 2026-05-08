import { motion } from "framer-motion";
import {
  Coffee,
  Wifi,
  Car,
  Gamepad2,
  Sofa,
  UtensilsCrossed,
  Snowflake,
  DoorOpen,
  Wrench,
  Sun,
  Droplets,
  ShieldCheck,
  Cross,
  Zap,
  Shield,
} from "lucide-react";

const amenities = [
  { icon: Coffee, label: "Barista Coffee Machine" },
  { icon: UtensilsCrossed, label: "Fresh Juice Bar / Blender" },
  { icon: Droplets, label: "Chilled Water Machine" },
  { icon: UtensilsCrossed, label: "Microwave & Air Fryer" },
  { icon: Snowflake, label: "Fridge Freezer" },
  { icon: Sofa, label: "High-End Seating" },
  { icon: Gamepad2, label: "Board Games, Dominos & Pool Table" },
  { icon: Wifi, label: "Free Wi-Fi" },
  { icon: Sun, label: "Rooftop Communal Break Area" },
  { icon: Car, label: "Secure Parking" },
  { icon: DoorOpen, label: "Private Entrances" },
  { icon: Wrench, label: "On-Site Caretaker 24hr" },
  { icon: ShieldCheck, label: "Fire Blankets" },
  { icon: Cross, label: "First Aid Kits" },
  { icon: Zap, label: "PAC Tested Equipment" },
  { icon: Shield, label: "Public Liability Insurance" },
];

const AmenitiesSection = () => {
  return (
    <section className="py-24 bg-background">
      <div className="container px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="font-mono text-xs tracking-[0.3em] text-primary mb-2 uppercase">
            Everything You Need
          </p>
          <h2 className="font-bebas text-5xl md:text-7xl text-foreground tracking-wider">
            AMENITIES & FACILITIES
          </h2>
        </motion.div>

        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {amenities.map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.03 }}
              className="flex flex-col items-center text-center gap-3 p-4 bg-card border border-border rounded-lg"
            >
              <item.icon className="w-6 h-6 text-primary" />
              <span className="font-mono text-xs text-muted-foreground leading-tight">
                {item.label}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AmenitiesSection;
