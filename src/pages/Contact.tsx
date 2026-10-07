import { motion } from "framer-motion";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { MapPin, Mail, Clock, Train, Phone } from "lucide-react";

const Contact = () => {
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !subject.trim() || !message.trim()) return;

    setSubmitting(true);
    const { error } = await supabase.from("contact_messages" as any).insert({
      name: name.trim(),
      email: email.trim(),
      subject: subject.trim(),
      message: message.trim(),
    });
    setSubmitting(false);

    if (error) {
      toast({ title: "Failed to send message", description: error.message, variant: "destructive" });
      return;
    }

    toast({ title: "Message sent! We'll get back to you within 24 hours." });
    setName("");
    setEmail("");
    setSubject("");
    setMessage("");
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navbar />
      <div className="grain-overlay" />
      <div className="container pt-24 pb-16 space-y-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <h1 className="font-bebas text-5xl md:text-7xl text-foreground tracking-wider">CONTACT US</h1>
        </motion.div>

        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Left — Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label className="text-muted-foreground font-barlow text-sm">Full Name *</Label>
              <Input required value={name} onChange={(e) => setName(e.target.value)} className="mt-1 bg-background" maxLength={100} />
            </div>
            <div>
              <Label className="text-muted-foreground font-barlow text-sm">Email Address *</Label>
              <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 bg-background" maxLength={255} />
            </div>
            <div>
              <Label className="text-muted-foreground font-barlow text-sm">Subject *</Label>
              <Input required value={subject} onChange={(e) => setSubject(e.target.value)} className="mt-1 bg-background" maxLength={200} />
            </div>
            <div>
              <Label className="text-muted-foreground font-barlow text-sm">Message *</Label>
              <textarea rows={4} required value={message} onChange={(e) => setMessage(e.target.value)} className="w-full mt-1 bg-background border border-border rounded-md px-3 py-2 text-foreground text-sm resize-none font-barlow" maxLength={2000} />
            </div>
            <Button type="submit" disabled={submitting} className="w-full font-bebas text-lg tracking-wider h-12 bg-primary text-primary-foreground">
              {submitting ? "SENDING..." : "SEND MESSAGE"}
            </Button>
          </form>

          {/* Right — Studio Info */}
          <div className="space-y-6">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bebas text-xl text-foreground tracking-wider">ADDRESS</h3>
                <p className="text-sm text-muted-foreground font-barlow">HMEZZ 1B, V22 Building, 174–186 Hither Green Lane, Hither Green, Lewisham, London SE13 6QB</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bebas text-xl text-foreground tracking-wider">EMAIL</h3>
                <a href="mailto:contracts@fullygovernedstudios.co.uk" className="text-sm text-primary font-barlow hover:underline">contracts@fullygovernedstudios.co.uk</a>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bebas text-xl text-foreground tracking-wider">TELEPHONE</h3>
                <a href="tel:+447950116217" className="text-sm text-primary font-barlow hover:underline">07950 116217</a>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bebas text-xl text-foreground tracking-wider">HOURS</h3>
                <p className="text-sm text-muted-foreground font-barlow">Visits and sessions are by booking. Confirm access times with the studio.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Train className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bebas text-xl text-foreground tracking-wider">GETTING HERE</h3>
                <p className="text-sm text-muted-foreground font-barlow">
                  🚂 Lewisham Station — 5 min walk (trains to London Bridge, Cannon Street, Charing Cross)<br />
                  🚂 Hither Green Station — 5 min walk (trains to London Bridge)<br />
                  🚗 <strong>Parking:</strong> Ask the studio to confirm availability and access arrangements when booking.
                </p>
              </div>
            </div>

            {/* Map link */}
            <a
              href="https://maps.google.com/?q=V22+Building+Lewisham+London"
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-card border border-border rounded-lg p-4 text-center hover:border-primary/50 transition-colors"
            >
              <MapPin className="w-6 h-6 text-primary mx-auto mb-2" />
              <p className="font-bebas text-base text-foreground tracking-wider">VIEW ON GOOGLE MAPS</p>
            </a>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Contact;
