import { motion } from "framer-motion";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const SKILLS = ["Flyering", "Social Media", "Event Support", "Photography", "Video", "Street Promoting"];
const AVAILABILITY_OPTIONS = ["Weekdays", "Weekends", "Evenings", "Flexible"];

const Join = () => {
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    location: "",
    availability: "",
    skills: [] as string[],
    motivation: "",
  });

  const toggleSkill = (skill: string) => {
    setForm((f) => ({
      ...f,
      skills: f.skills.includes(skill) ? f.skills.filter((s) => s !== skill) : [...f.skills, skill],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.full_name.trim() || !form.email.trim() || !form.location.trim()) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setSubmitting(true);

    const { error } = await supabase.from("street_team_applications").insert({
      full_name: form.full_name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim() || null,
      location: form.location.trim(),
      availability: form.availability || null,
      skills: form.skills.length > 0 ? form.skills : null,
      reason: form.motivation.trim() || null,
      user_id: user?.id || null,
    } as any);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Application received! We'll be in touch within 48 hours. 👊");
      setForm({ full_name: "", email: "", phone: "", location: "", availability: "", skills: [], motivation: "" });
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navbar />
      <div className="grain-overlay" />
      <div className="container pt-24 pb-16 space-y-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <p className="font-mono text-xs tracking-[0.3em] text-primary mb-2 uppercase">Street Team</p>
          <h1 className="font-bebas text-5xl md:text-7xl text-foreground tracking-wider">JOIN THE TEAM</h1>
          <p className="text-muted-foreground font-barlow mt-2 max-w-xl mx-auto">Fill in the form below to apply. No login required.</p>
        </motion.div>

        <form onSubmit={handleSubmit} className="max-w-lg mx-auto space-y-5">
          <div>
            <Label className="text-muted-foreground font-barlow">Full Name *</Label>
            <Input value={form.full_name} onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))} required maxLength={100} className="mt-1 bg-background" />
          </div>
          <div>
            <Label className="text-muted-foreground font-barlow">Email Address *</Label>
            <Input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} required maxLength={255} className="mt-1 bg-background" />
          </div>
          <div>
            <Label className="text-muted-foreground font-barlow">Phone Number</Label>
            <Input type="tel" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} className="mt-1 bg-background" />
          </div>
          <div>
            <Label className="text-muted-foreground font-barlow">Location — City or Postcode *</Label>
            <Input value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} required maxLength={100} className="mt-1 bg-background" placeholder="e.g. Lewisham, SE13" />
          </div>
          <div>
            <Label className="text-muted-foreground font-barlow">Availability</Label>
            <Select value={form.availability} onValueChange={(v) => setForm((f) => ({ ...f, availability: v }))}>
              <SelectTrigger className="mt-1 font-barlow"><SelectValue placeholder="Select availability" /></SelectTrigger>
              <SelectContent>
                {AVAILABILITY_OPTIONS.map((o) => (
                  <SelectItem key={o} value={o}>{o}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-muted-foreground font-barlow">Skills (select all that apply)</Label>
            <div className="grid grid-cols-2 gap-3 mt-2">
              {SKILLS.map((s) => (
                <label key={s} className="flex items-center gap-2 text-sm text-foreground font-barlow cursor-pointer">
                  <Checkbox checked={form.skills.includes(s)} onCheckedChange={() => toggleSkill(s)} />
                  {s}
                </label>
              ))}
            </div>
          </div>
          <div>
            <Label className="text-muted-foreground font-barlow">Motivation (optional, max 500 chars)</Label>
            <Textarea
              value={form.motivation}
              onChange={(e) => setForm((f) => ({ ...f, motivation: e.target.value.slice(0, 500) }))}
              rows={4}
              maxLength={500}
              className="mt-1 bg-background resize-none"
              placeholder="Why do you want to join the street team?"
            />
            <p className="text-xs text-muted-foreground font-mono mt-1">{form.motivation.length}/500</p>
          </div>
          <Button type="submit" disabled={submitting} className="w-full font-bebas text-lg tracking-wider h-12">
            {submitting ? "SUBMITTING..." : "APPLY NOW"}
          </Button>
        </form>
      </div>
      <Footer />
    </div>
  );
};

export default Join;
