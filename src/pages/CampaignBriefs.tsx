import { useState } from "react";
import { BriefcaseBusiness, CheckCircle2, Megaphone, Rocket, Sparkles } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

type BriefType = "artist_development" | "creative_services" | "business_growth" | "campaign_brief";

const BRIEF_TYPES: Array<{
  key: BriefType;
  label: string;
  icon: typeof Sparkles;
  description: string;
  services: string[];
}> = [
  {
    key: "artist_development",
    label: "Artist Development",
    icon: Sparkles,
    description: "For artists who need release strategy, identity, content direction, and growth planning.",
    services: ["Release strategy", "Artist positioning", "Content plan", "Studio package", "Mentoring"],
  },
  {
    key: "creative_services",
    label: "Creative Services",
    icon: Megaphone,
    description: "For content, video, design, 3D, editing, campaign assets, and creative production briefs.",
    services: ["Video editing", "Social assets", "Artwork", "Motion graphics", "3D / product visuals"],
  },
  {
    key: "business_growth",
    label: "Business Growth",
    icon: BriefcaseBusiness,
    description: "For founders, local businesses, and teams needing systems, marketing, websites, and content.",
    services: ["Website", "CRM / workflow", "Local marketing", "Content engine", "Automation"],
  },
  {
    key: "campaign_brief",
    label: "Campaign Brief",
    icon: Rocket,
    description: "For single campaign planning across objectives, audience, assets, channels, and timeline.",
    services: ["Launch campaign", "Paid social assets", "Organic rollout", "Landing page", "Reporting"],
  },
];

const PLATFORM_OPTIONS = ["Instagram", "TikTok", "YouTube", "Spotify", "Website", "Email", "Local / offline", "Other"];

export default function CampaignBriefs() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [briefType, setBriefType] = useState<BriefType>("artist_development");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const active = BRIEF_TYPES.find((brief) => brief.key === briefType) ?? BRIEF_TYPES[0];

  const [form, setForm] = useState({
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    projectName: "",
    goal: "",
    audience: "",
    budgetRange: "",
    timeline: "",
    platforms: [] as string[],
    services: [] as string[],
    creativeNotes: "",
  });

  const toggleListValue = (field: "platforms" | "services", value: string) => {
    setForm((current) => ({
      ...current,
      [field]: current[field].includes(value)
        ? current[field].filter((item) => item !== value)
        : [...current[field], value],
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.contactName.trim() || !form.contactEmail.trim() || !form.goal.trim()) {
      toast({ title: "Missing details", description: "Name, email, and goal are required.", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.from("fg_campaign_briefs" as any).insert({
      brief_type: briefType,
      contact_name: form.contactName.trim(),
      contact_email: form.contactEmail.trim(),
      contact_phone: form.contactPhone.trim() || null,
      project_name: form.projectName.trim() || null,
      goal: form.goal.trim(),
      audience: form.audience.trim() || null,
      budget_range: form.budgetRange || null,
      timeline: form.timeline || null,
      platforms: form.platforms,
      services: form.services,
      creative_notes: form.creativeNotes.trim() || null,
      submitted_by: user?.id ?? null,
    });
    setSubmitting(false);

    if (error) {
      toast({ title: "Brief could not be sent", description: error.message, variant: "destructive" });
      return;
    }

    setSubmitted(true);
    toast({ title: "Brief submitted", description: "The Fully Governed team can now review your brief." });
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background pb-20 md:pb-0">
        <Navbar />
        <main className="container max-w-3xl pt-28 pb-16">
          <div className="rounded-lg border border-border bg-card/50 p-8 text-center">
            <CheckCircle2 className="mx-auto h-12 w-12 text-primary" />
            <h1 className="mt-4 font-bebas text-4xl tracking-wide text-foreground">BRIEF RECEIVED</h1>
            <p className="mt-2 text-sm text-muted-foreground">Your brief has been saved for review. The team can follow up with a quote, plan, or discovery call.</p>
            <Button className="mt-6 font-bebas tracking-wide" onClick={() => setSubmitted(false)}>Submit another brief</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navbar />
      <main className="container max-w-6xl pt-28 pb-16 space-y-8">
        <section className="space-y-3">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-primary">Campaign intake</p>
          <h1 className="font-bebas text-5xl tracking-wide text-foreground">CREATIVE BRIEF FORMS</h1>
          <p className="max-w-2xl text-sm text-muted-foreground">Choose the brief type and give the team enough context to scope a useful plan.</p>
        </section>

        <div className="grid gap-4 md:grid-cols-4">
          {BRIEF_TYPES.map((brief) => {
            const Icon = brief.icon;
            const selected = brief.key === briefType;
            return (
              <button
                key={brief.key}
                type="button"
                onClick={() => setBriefType(brief.key)}
                className={`rounded-lg border p-4 text-left transition-colors ${selected ? "border-primary bg-primary/10" : "border-border bg-card/40 hover:border-primary/30"}`}
              >
                <Icon className="h-5 w-5 text-primary" />
                <h2 className="mt-3 font-bebas text-xl tracking-wide text-foreground">{brief.label}</h2>
                <p className="mt-1 text-xs text-muted-foreground">{brief.description}</p>
              </button>
            );
          })}
        </div>

        <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[1fr_20rem]">
          <div className="space-y-5 rounded-lg border border-border bg-card/45 p-5">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Name</Label>
                <Input value={form.contactName} onChange={(event) => setForm({ ...form, contactName: event.target.value })} required className="mt-1 bg-background" />
              </div>
              <div>
                <Label>Email</Label>
                <Input type="email" value={form.contactEmail} onChange={(event) => setForm({ ...form, contactEmail: event.target.value })} required className="mt-1 bg-background" />
              </div>
              <div>
                <Label>Phone</Label>
                <Input value={form.contactPhone} onChange={(event) => setForm({ ...form, contactPhone: event.target.value })} className="mt-1 bg-background" />
              </div>
              <div>
                <Label>Project / artist / business name</Label>
                <Input value={form.projectName} onChange={(event) => setForm({ ...form, projectName: event.target.value })} className="mt-1 bg-background" />
              </div>
            </div>

            <div>
              <Label>Main goal</Label>
              <textarea value={form.goal} onChange={(event) => setForm({ ...form, goal: event.target.value })} required rows={4} className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground" />
            </div>

            <div>
              <Label>Audience</Label>
              <Input value={form.audience} onChange={(event) => setForm({ ...form, audience: event.target.value })} className="mt-1 bg-background" placeholder="Who needs to see, hear, buy, book, or respond?" />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Budget range</Label>
                <select value={form.budgetRange} onChange={(event) => setForm({ ...form, budgetRange: event.target.value })} className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground">
                  <option value="">Select...</option>
                  <option value="under_500">Under GBP 500</option>
                  <option value="500_1500">GBP 500 - GBP 1,500</option>
                  <option value="1500_5000">GBP 1,500 - GBP 5,000</option>
                  <option value="5000_plus">GBP 5,000+</option>
                </select>
              </div>
              <div>
                <Label>Timeline</Label>
                <select value={form.timeline} onChange={(event) => setForm({ ...form, timeline: event.target.value })} className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground">
                  <option value="">Select...</option>
                  <option value="asap">ASAP</option>
                  <option value="2_4_weeks">2-4 weeks</option>
                  <option value="1_3_months">1-3 months</option>
                  <option value="planning">Planning ahead</option>
                </select>
              </div>
            </div>

            <div>
              <Label>Creative notes</Label>
              <textarea value={form.creativeNotes} onChange={(event) => setForm({ ...form, creativeNotes: event.target.value })} rows={5} className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground" />
            </div>
          </div>

          <aside className="space-y-4 rounded-lg border border-border bg-card/45 p-5">
            <div>
              <h2 className="font-bebas text-2xl tracking-wide text-foreground">{active.label}</h2>
              <p className="mt-1 text-xs text-muted-foreground">{active.description}</p>
            </div>

            <div className="space-y-2">
              <Label>Services</Label>
              {active.services.map((service) => (
                <label key={service} className="flex items-center gap-2 rounded-md border border-border bg-background/45 p-2 text-xs text-foreground">
                  <input type="checkbox" checked={form.services.includes(service)} onChange={() => toggleListValue("services", service)} />
                  {service}
                </label>
              ))}
            </div>

            <div className="space-y-2">
              <Label>Platforms</Label>
              <div className="grid grid-cols-2 gap-2">
                {PLATFORM_OPTIONS.map((platform) => (
                  <label key={platform} className="flex items-center gap-2 rounded-md border border-border bg-background/45 p-2 text-xs text-foreground">
                    <input type="checkbox" checked={form.platforms.includes(platform)} onChange={() => toggleListValue("platforms", platform)} />
                    {platform}
                  </label>
                ))}
              </div>
            </div>

            <Button type="submit" disabled={submitting} className="w-full font-bebas text-lg tracking-wide">
              {submitting ? "Sending..." : "Submit Brief"}
            </Button>
          </aside>
        </form>
      </main>
      <Footer />
    </div>
  );
}
