import { useState } from "react";
import { motion } from "framer-motion";
import { Music, Mic, Monitor, Send, GraduationCap } from "lucide-react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const courses = [
  { icon: Music, title: "BEAT MAKING", description: "Learn the fundamentals of beat production using FL Studio and Logic Pro. From drum patterns to melodies.", level: "Beginner", price: "£30/hr" },
  { icon: Mic, title: "MUSIC PRODUCTION", description: "Full music production workflow — arrangement, sound selection, mixing, and mastering basics.", level: "Intermediate", price: "£30/hr" },
  { icon: Monitor, title: "MIXING BASICS", description: "Take your tracks to the next level. Learn EQ, compression, stereo imaging and mastering workflows.", level: "Intermediate", price: "£30/hr" },
  { icon: Music, title: "MUSIC THEORY", description: "Scales, chords, progressions, and song structure. Essential foundations for any genre.", level: "Beginner", price: "£30/hr" },
  { icon: GraduationCap, title: "ARTIST DEVELOPMENT", description: "Build your brand, develop your sound, and create a release strategy. One-on-one mentoring.", level: "All Levels", price: "£30/hr" },
];

const Academy = () => {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [interest, setInterest] = useState("");

  // Partnership form
  const [partnerName, setPartnerName] = useState("");
  const [partnerOrg, setPartnerOrg] = useState("");
  const [partnerEmail, setPartnerEmail] = useState("");
  const [partnerDetails, setPartnerDetails] = useState("");

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navbar />
      <div className="grain-overlay" />
      <div className="container pt-24 pb-16 space-y-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <p className="font-mono text-xs tracking-[0.3em] text-primary mb-2 uppercase">Learn · Create · Grow</p>
          <h1 className="font-bebas text-5xl md:text-7xl text-foreground tracking-wider">BEAT ACADEMY</h1>
          <p className="text-muted-foreground font-barlow mt-2 max-w-xl mx-auto">
            Hands-on music production courses taught in our studio by experienced producers and engineers.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {courses.map((course, i) => (
            <motion.div
              key={course.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-card border border-border rounded-lg p-6"
            >
              <div className="flex items-center justify-between mb-3">
                <course.icon className="w-8 h-8 text-primary" />
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-primary">{course.price}</span>
                  <span className="text-xs font-mono text-muted-foreground px-2 py-0.5 bg-accent rounded">{course.level}</span>
                </div>
              </div>
              <h3 className="font-bebas text-2xl text-foreground tracking-wider">{course.title}</h3>
              <p className="text-sm text-muted-foreground font-barlow mt-2">{course.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Inquiry Form */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-lg mx-auto bg-card border border-border rounded-lg p-8">
          <h2 className="font-bebas text-3xl text-foreground tracking-wider text-center mb-2">INTERESTED?</h2>
          <p className="text-muted-foreground text-center text-sm mb-6">Leave your details and we'll get in touch with course dates and pricing.</p>
          <div className="space-y-4">
            <div>
              <Label className="text-muted-foreground">Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 bg-background" />
            </div>
            <div>
              <Label className="text-muted-foreground">Email</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 bg-background" />
            </div>
            <div>
              <Label className="text-muted-foreground">What are you interested in?</Label>
              <textarea value={interest} onChange={(e) => setInterest(e.target.value)} rows={3} className="w-full mt-1 bg-background border border-border rounded-md px-3 py-2 text-foreground text-sm resize-none focus:border-interactive focus:ring-1 focus:ring-interactive focus:outline-none transition-colors" placeholder="e.g. Beat making, mixing, vocal recording..." />
            </div>
            <Button
              className="w-full font-bebas text-lg tracking-wider h-12"
              disabled={!name || !email}
              onClick={() => {
                toast({ title: "Inquiry sent! 🎓", description: "We'll be in touch soon." });
                setName(""); setEmail(""); setInterest("");
              }}
            >
              <Send className="w-4 h-4 mr-2" /> SEND INQUIRY
            </Button>
          </div>
        </motion.div>

        {/* School & Community Partnerships */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-lg mx-auto bg-card border border-primary/30 rounded-lg p-8">
          <div className="flex items-center gap-3 mb-4 justify-center">
            <GraduationCap className="w-8 h-8 text-primary" />
            <h2 className="font-bebas text-3xl text-foreground tracking-wider">SCHOOL & COMMUNITY PARTNERSHIPS</h2>
          </div>
          <p className="text-muted-foreground text-center text-sm mb-6">Partner with us for group workshops, educational programmes, and youth engagement. We offer group rates and bespoke curriculum design.</p>
          <div className="space-y-4">
            <div>
              <Label className="text-muted-foreground">Contact Name</Label>
              <Input value={partnerName} onChange={(e) => setPartnerName(e.target.value)} className="mt-1 bg-background" />
            </div>
            <div>
              <Label className="text-muted-foreground">Organisation</Label>
              <Input value={partnerOrg} onChange={(e) => setPartnerOrg(e.target.value)} className="mt-1 bg-background" placeholder="School, college, youth group..." />
            </div>
            <div>
              <Label className="text-muted-foreground">Email</Label>
              <Input type="email" value={partnerEmail} onChange={(e) => setPartnerEmail(e.target.value)} className="mt-1 bg-background" />
            </div>
            <div>
              <Label className="text-muted-foreground">What are you looking for?</Label>
              <textarea value={partnerDetails} onChange={(e) => setPartnerDetails(e.target.value)} rows={3} className="w-full mt-1 bg-background border border-border rounded-md px-3 py-2 text-foreground text-sm resize-none focus:border-interactive focus:ring-1 focus:ring-interactive focus:outline-none transition-colors" placeholder="Group size, age range, topics of interest..." />
            </div>
            <Button
              className="w-full font-bebas text-lg tracking-wider h-12"
              disabled={!partnerName || !partnerEmail}
              onClick={() => {
                toast({ title: "Partnership inquiry sent! 🤝", description: "We'll be in touch within 48 hours." });
                setPartnerName(""); setPartnerOrg(""); setPartnerEmail(""); setPartnerDetails("");
              }}
            >
              <Send className="w-4 h-4 mr-2" /> SEND PARTNERSHIP INQUIRY
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Academy;
