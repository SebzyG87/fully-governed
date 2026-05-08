import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Train, Bus, Car, Coffee, ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const LocationSection = () => {
  const { toast } = useToast();
  const [visitorName, setVisitorName] = useState("");
  const [regNumber, setRegNumber] = useState("");
  const [visitDate, setVisitDate] = useState(new Date().toISOString().split("T")[0]);
  const [submitting, setSubmitting] = useState(false);

  const handleRegister = async () => {
    if (!visitorName || !regNumber) return;
    setSubmitting(true);
    const { error } = await (supabase.from("vehicle_registrations" as any).insert({
      visitor_name: visitorName,
      registration_number: regNumber.toUpperCase(),
      visit_date: visitDate,
    }) as any);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Vehicle registered ✅", description: "You're all set for parking." });
      setVisitorName("");
      setRegNumber("");
    }
    setSubmitting(false);
  };

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
              174–178 V22 Building
              <br />
              Unit 1B–1C
              <br />
              Lewisham, London
            </p>
            <p className="font-mono text-xs text-primary tracking-wider">GATED COMMUNITY</p>
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
                  <p className="font-barlow text-sm text-foreground font-medium">Lewisham Station</p>
                  <p className="font-mono text-xs text-muted-foreground">5 min walk · Trains to London Bridge, Cannon Street & Charing Cross</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Train className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-barlow text-sm text-foreground font-medium">Hither Green Station</p>
                  <p className="font-mono text-xs text-muted-foreground">7 min walk · Trains to London Bridge</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Bus className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-barlow text-sm text-foreground font-medium">Bus Routes</p>
                  <p className="font-mono text-xs text-muted-foreground">Multiple routes linking all local transport</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Car className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-barlow text-sm text-foreground font-medium">Secure On-Site Parking</p>
                  <p className="font-mono text-xs text-muted-foreground">Gated parking available · Register your vehicle below</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Coffee className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-barlow text-sm text-foreground font-medium">On-Site Facilities</p>
                  <p className="font-mono text-xs text-muted-foreground">Rooftop break area · Toilets · Smoking area · Pool table</p>
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
          </motion.div>
        </div>

        {/* Vehicle Registration Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-lg mx-auto mt-12 bg-card border border-border rounded-lg p-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <Car className="w-6 h-6 text-primary" />
            <h3 className="font-bebas text-2xl text-foreground tracking-wider">REGISTER YOUR VEHICLE</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">Pre-register your vehicle for hassle-free parking on arrival.</p>
          <div className="space-y-4">
            <div>
              <Label className="text-muted-foreground">Your Name</Label>
              <Input value={visitorName} onChange={(e) => setVisitorName(e.target.value)} className="mt-1 bg-background" placeholder="Full name" />
            </div>
            <div>
              <Label className="text-muted-foreground">Vehicle Registration</Label>
              <Input value={regNumber} onChange={(e) => setRegNumber(e.target.value)} className="mt-1 bg-background uppercase" placeholder="e.g. AB12 CDE" />
            </div>
            <div>
              <Label className="text-muted-foreground">Date of Visit</Label>
              <Input type="date" value={visitDate} onChange={(e) => setVisitDate(e.target.value)} className="mt-1 bg-background" />
            </div>
            <Button onClick={handleRegister} disabled={submitting || !visitorName || !regNumber} className="w-full font-bebas text-lg tracking-wider h-12">
              {submitting ? "REGISTERING..." : "REGISTER VEHICLE"}
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default LocationSection;
