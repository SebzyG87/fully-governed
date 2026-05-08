import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Megaphone, Plus, Save, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface EventRow {
  id: string;
  title: string;
  event_date: string;
  ticket_price: number;
  max_capacity: number;
  rsvp_count: number;
  status: string;
}

const AdminEvents = () => {
  const [events, setEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [price, setPrice] = useState("0");
  const [capacity, setCapacity] = useState("50");
  const { toast } = useToast();

  const fetchEvents = async () => {
    const { data } = await supabase.from("events").select("*").order("event_date", { ascending: false });
    setEvents((data as EventRow[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchEvents(); }, []);

  const handleAdd = async () => {
    if (!title.trim() || !date) return;
    const { error } = await supabase.from("events").insert({
      title,
      event_date: new Date(date).toISOString(),
      ticket_price: parseFloat(price) || 0,
      max_capacity: parseInt(capacity) || 50,
      status: "draft",
    });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Event created" });
      setTitle(""); setDate(""); setPrice("0"); setCapacity("50"); setShowAdd(false);
      fetchEvents();
    }
  };

  const toggleStatus = async (id: string, current: string) => {
    const newStatus = current === "published" ? "draft" : "published";
    await supabase.from("events").update({ status: newStatus }).eq("id", id);
    fetchEvents();
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl text-foreground">EVENTS & ADS</h1>
          <p className="text-muted-foreground font-barlow text-sm">{events.length} events</p>
        </div>
        <Button size="sm" onClick={() => setShowAdd(!showAdd)} className="font-bebas tracking-wider">
          <Plus className="w-4 h-4 mr-1" /> CREATE EVENT
        </Button>
      </motion.div>

      {showAdd && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="bg-card border border-border rounded-lg p-4 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <Label className="text-muted-foreground text-xs">Title</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 bg-background" />
            </div>
            <div>
              <Label className="text-muted-foreground text-xs">Date & Time</Label>
              <Input type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} className="mt-1 bg-background" />
            </div>
            <div>
              <Label className="text-muted-foreground text-xs">Ticket Price (£)</Label>
              <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} className="mt-1 bg-background" />
            </div>
            <div>
              <Label className="text-muted-foreground text-xs">Max Capacity</Label>
              <Input type="number" value={capacity} onChange={(e) => setCapacity(e.target.value)} className="mt-1 bg-background" />
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleAdd} className="font-bebas tracking-wider"><Save className="w-4 h-4 mr-1" /> SAVE</Button>
            <Button size="sm" variant="ghost" onClick={() => setShowAdd(false)}><X className="w-4 h-4" /></Button>
          </div>
        </motion.div>
      )}

      {loading ? (
        <div className="flex justify-center py-12"><Megaphone className="w-6 h-6 text-primary animate-pulse" /></div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground font-mono text-xs">
                <th className="text-left py-3 px-2">Title</th>
                <th className="text-left py-3 px-2">Date</th>
                <th className="text-left py-3 px-2">Price</th>
                <th className="text-left py-3 px-2">Capacity</th>
                <th className="text-left py-3 px-2">RSVPs</th>
                <th className="text-left py-3 px-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {events.map((e) => (
                <tr key={e.id} className="border-b border-border/50 hover:bg-accent/30 transition-colors">
                  <td className="py-3 px-2 text-foreground">{e.title}</td>
                  <td className="py-3 px-2 font-mono text-muted-foreground text-xs">{format(new Date(e.event_date), "d MMM yy HH:mm")}</td>
                  <td className="py-3 px-2 font-mono text-foreground">{Number(e.ticket_price) > 0 ? `£${Number(e.ticket_price).toFixed(2)}` : "Free"}</td>
                  <td className="py-3 px-2 font-mono text-muted-foreground">{e.max_capacity}</td>
                  <td className="py-3 px-2 font-mono text-muted-foreground">{e.rsvp_count}</td>
                  <td className="py-3 px-2">
                    <button onClick={() => toggleStatus(e.id, e.status)} className={`text-xs font-mono px-2 py-0.5 rounded cursor-pointer ${e.status === "published" ? "bg-green-500/20 text-green-400" : "bg-secondary text-secondary-foreground"}`}>
                      {e.status}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminEvents;
