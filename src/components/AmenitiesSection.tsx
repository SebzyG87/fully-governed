import { motion } from "framer-motion";
import { Mic, Radio, Video, Printer, Shirt, Clock } from "lucide-react";

const offerings = [
  { icon: Mic, label: "Recording studio hire" },
  { icon: Video, label: "Podcast and video production" },
  { icon: Radio, label: "Show and radio programme proposals" },
  { icon: Shirt, label: "Garment and embroidery services" },
  { icon: Printer, label: "Print and 3D production" },
  { icon: Clock, label: "Sessions by confirmed booking" },
];

const AmenitiesSection = () => (
  <section className="bg-background py-24">
    <div className="container px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-12 text-center">
        <p className="mb-2 font-mono text-xs uppercase tracking-[0.3em] text-primary">Studio services</p>
        <h2 className="font-bebas text-5xl text-foreground md:text-7xl">WHAT WE OFFER</h2>
      </motion.div>
      <div className="mx-auto grid max-w-5xl grid-cols-2 gap-4 md:grid-cols-3">
        {offerings.map(({ icon: Icon, label }, i) => (
          <motion.div key={label} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.03 }} className="flex min-h-28 flex-col items-center justify-center gap-3 border border-border bg-card p-4 text-center">
            <Icon className="h-6 w-6 text-primary" />
            <span className="font-mono text-xs leading-tight text-muted-foreground">{label}</span>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default AmenitiesSection;
