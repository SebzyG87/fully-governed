import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CalendarDays, Crown, Users, Ticket } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface Event {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  ticket_price: number;
  max_capacity: number;
  rsvp_count: number;
  status: string;
  image_url: string | null;
}

const Events = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    supabase.from("events").select("*").eq("status", "published").order("event_date", { ascending: true }).then(({ data }) => {
      setEvents((data as Event[]) || []);
      setLoading(false);
    });
  }, []);

  const handleRSVP = async (event: Event) => {
    if (!user) {
      toast({ title: "Sign in to RSVP", variant: "destructive" });
      return;
    }
    const { error } = await supabase.from("event_rsvps").insert({
      event_id: event.id,
      user_id: user.id,
    });
    if (error) {
      if (error.code === "23505") {
        toast({ title: "Already RSVP'd!", description: "You're on the list" });
      } else {
        toast({ title: "RSVP failed", description: error.message, variant: "destructive" });
      }
    } else {
      toast({ title: "You're in! 🎉" });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="grain-overlay" />
      <Navbar />
      <div className="container pt-24 pb-16 space-y-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <h1 className="text-5xl md:text-7xl text-foreground">EVENTS</h1>
          <p className="text-muted-foreground font-barlow mt-2">Boiler rooms, launches & networking nights</p>
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Crown className="w-8 h-8 text-primary animate-pulse-gold" />
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-16">
            <CalendarDays className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground font-barlow text-lg">No upcoming events — check back soon</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {events.map((event, i) => (
              <motion.div key={event.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="bg-card border border-border rounded-lg overflow-hidden hover:border-interactive hover:shadow-[0_0_12px_hsl(var(--interactive))] transition-all">
                {event.image_url && <img src={event.image_url} alt={event.title} className="w-full h-48 object-cover" />}
                <div className="p-6 space-y-3">
                  <h3 className="text-2xl text-foreground">{event.title.toUpperCase()}</h3>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground font-mono">
                    <span className="flex items-center gap-1"><CalendarDays className="w-3 h-3" /> {format(new Date(event.event_date), "d MMM yyyy · HH:mm")}</span>
                    <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {event.rsvp_count}/{event.max_capacity}</span>
                  </div>
                  {event.description && <p className="text-sm text-muted-foreground">{event.description}</p>}
                  <div className="flex items-center justify-between pt-2">
                    <span className="font-mono text-primary">{Number(event.ticket_price) > 0 ? `£${Number(event.ticket_price).toFixed(2)}` : "FREE"}</span>
                    <Button size="sm" onClick={() => handleRSVP(event)} className="font-bebas tracking-wider">
                      <Ticket className="w-4 h-4 mr-1" /> RSVP
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Events;
