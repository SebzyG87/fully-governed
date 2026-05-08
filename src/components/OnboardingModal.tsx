import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Crown, Music, LayoutDashboard } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface OnboardingModalProps {
  open: boolean;
  onComplete: () => void;
  userId: string;
}

const steps = [
  {
    icon: Crown,
    title: "WELCOME TO FULLY GOVERNED",
    description: "Your creative home. Book studios, connect with artists, and build your sound — all in one place.",
  },
  {
    icon: Music,
    title: "THREE WORLD-CLASS ROOMS",
    description: "The Recording Studio (gold), Multi-Purpose Room (red), and Content Creation Centre (purple). Each designed for different creative needs.",
  },
  {
    icon: LayoutDashboard,
    title: "YOUR DASHBOARD",
    description: "Track bookings, earn loyalty points, manage your profile, and connect with the community. Let's get started!",
  },
];

const OnboardingModal = ({ open, onComplete, userId }: OnboardingModalProps) => {
  const [step, setStep] = useState(0);

  const handleNext = async () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      await supabase.from("profiles").update({ onboarding_complete: true } as any).eq("user_id", userId);
      onComplete();
    }
  };

  const current = steps[step];

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="bg-card border-border max-w-sm text-center [&>button]:hidden">
        <div className="py-6 space-y-6">
          <current.icon className="w-12 h-12 text-primary mx-auto" />
          <h2 className="text-3xl text-foreground">{current.title}</h2>
          <p className="text-muted-foreground font-barlow">{current.description}</p>

          <div className="flex items-center justify-center gap-2">
            {steps.map((_, i) => (
              <div key={i} className={`w-2 h-2 rounded-full transition-colors ${i === step ? "bg-primary" : "bg-border"}`} />
            ))}
          </div>

          <Button onClick={handleNext} className="font-bebas text-lg tracking-wider px-8 h-12">
            {step < steps.length - 1 ? "NEXT" : "LET'S GO"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OnboardingModal;
