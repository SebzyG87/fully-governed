import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface QuoteRequestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prefilledService?: string;
}

const services = [
  "Mixing",
  "Mastering",
  "Video Editing",
  "Animation",
  "Photo & Graphics",
  "Branding Package",
  "Live Streaming Production",
  "Gaming Recording & Editing",
  "Voiceover Recording",
  "Audiobook Recording",
  "Digital Vinyl Production",
  "USB Preloading",
  "AI Avatar Design",
  "Content Strategy",
  "Website Development",
  "App Integration",
  "Marketing Campaign",
  "Beat Academy Lesson",
  "Internet Radio",
  "Radio production",
  "Radio show proposal",
  "NFC/QR production",
  "QR Code Creation",
  "Campaign Management",
  "Animation Editing",
  "Distribution Coordination",
  "Audio Editing",
  "Campaign Editing",
  "Legal & Paperwork",
  "Colour Grading",
  "Show Production",
  "Marketing Strategy",
  "Gaming & Streaming",
  "Modeling & Portfolio",
  "Podcasting",
  "Content Creation",
  "Private Event",
  "Other",
];

const budgetRanges = [
  "Under £100",
  "£100 – £250",
  "£250 – £500",
  "£500 – £1,000",
  "£1,000 – £2,500",
  "£2,500+",
  "Not sure yet",
];

const timelines = [
  "ASAP",
  "Within 1 week",
  "Within 2 weeks",
  "Within 1 month",
  "Flexible",
];

const referralSources = [
  "Instagram",
  "TikTok",
  "Google Search",
  "Friend / Word of Mouth",
  "Returning Customer",
  "Event / Flyer",
  "Other",
];

const QuoteRequestModal = ({ open, onOpenChange, prefilledService }: QuoteRequestModalProps) => {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    service: prefilledService || "",
    description: "",
    timeline: "",
    budget: "",
    referralSource: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.service) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    const { error } = await supabase.from("quote_requests").insert({
      name: form.name,
      email: form.email,
      phone: form.phone || null,
      service: form.service,
      description: form.description || null,
      timeline: form.timeline || null,
      budget: form.budget || null,
      referral_source: form.referralSource || null,
    });

    setLoading(false);

    if (error) {
      toast.error("Failed to submit quote request. Please try again.");
      console.error(error);
      return;
    }

    toast.success("Quote request submitted! We'll get back to you within 24 hours.");
    setForm({
      name: "",
      email: "",
      phone: "",
      service: "",
      description: "",
      timeline: "",
      budget: "",
      referralSource: "",
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-bebas text-2xl tracking-wider">Request a Quote</DialogTitle>
          <DialogDescription>
            Tell us about your project and we'll get back to you within 24 hours.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Your name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="07XXX XXXXXX"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="service">Service *</Label>
              <Select value={form.service} onValueChange={(v) => setForm({ ...form, service: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select service" />
                </SelectTrigger>
                <SelectContent>
                  {services.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Project Description</Label>
            <Textarea
              id="description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Tell us about your project..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="timeline">Timeline</Label>
              <Select value={form.timeline} onValueChange={(v) => setForm({ ...form, timeline: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="When do you need it?" />
                </SelectTrigger>
                <SelectContent>
                  {timelines.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="budget">Budget Range</Label>
              <Select value={form.budget} onValueChange={(v) => setForm({ ...form, budget: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Estimated budget" />
                </SelectTrigger>
                <SelectContent>
                  {budgetRanges.map((b) => (
                    <SelectItem key={b} value={b}>{b}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="referral">How did you hear about us?</Label>
            <Select value={form.referralSource} onValueChange={(v) => setForm({ ...form, referralSource: v })}>
              <SelectTrigger>
                <SelectValue placeholder="Select..." />
              </SelectTrigger>
              <SelectContent>
                {referralSources.map((r) => (
                  <SelectItem key={r} value={r}>{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" className="w-full font-bebas text-lg tracking-wider" disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Submit Quote Request
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default QuoteRequestModal;
