import { motion } from "framer-motion";
import { MapPin, Train, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

const LocationSection = () => {
  return (
    <section id="location" className="py-24 bg-background">
      <div className="container px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="font-mono text-xs tracking-[0.3em] text-primary mb-2 uppercase">
            South East London
          </p>
          <h2 className="font-bebas text-5xl md:text-7xl text-foreground tracking-wider">
            FIND US
          </h2>
        </motion.div>

        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Address */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-card border border-border rounded-lg p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <MapPin className="w-6 h-6 text-primary" />
              <h3 className="font-bebas text-2xl text-foreground tracking-wider">ADDRESS</h3>
            </div>
            <p className="font-barlow text-muted-foreground leading-relaxed mb-2">
              HMEZZ 1B, V22 Building
              <br />
              174–186 Hither Green Lane
              <br />
              Hither Green, Lewisham, London SE13 6QB
            </p>
            <p className="font-mono text-xs text-muted-foreground">Contact the studio to confirm access and parking for your booking.</p>
          </motion.div>

          {/* Transport */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-card border border-border rounded-lg p-8"
          >
            <h3 className="font-bebas text-2xl text-foreground tracking-wider mb-6">
              GETTING HERE
            </h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Train className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-barlow text-sm text-foreground font-medium">Nearby rail</p>
                  <p className="font-mono text-xs text-muted-foreground">Hither Green and Lewisham stations serve the area. Check current routes before travelling.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Train className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                </div>
              </div>
            </div>
            <a
              href="https://tfl.gov.uk/plan-a-journey/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 mt-6 font-mono text-xs text-primary hover:text-interactive transition-colors"
            >
              Plan your journey on TfL <ExternalLink className="w-3 h-3" />
            </a>
            <p className="mt-3 text-xs text-muted-foreground">Parking and building access must be confirmed with the studio.</p>
            <Link to="/contact" className="mt-3 inline-block font-mono text-xs text-primary hover:text-interactive">Contact the studio</Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default LocationSection;
