import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Skeleton } from "@/components/ui/skeleton";

interface EquipmentItem {
  id: string;
  name: string;
  description: string | null;
  status: string;
  room_id: string | null;
  condition_notes: string | null;
}

interface Room {
  id: string;
  name: string;
  color: string;
}

const statusIcon: Record<string, JSX.Element> = {
  available: <CheckCircle className="w-4 h-4 text-green-500" />,
  "in use": <AlertTriangle className="w-4 h-4 text-primary" />,
  maintenance: <XCircle className="w-4 h-4 text-destructive" />,
};

// Only equipment marked operational in the supplied register is advertised.
const studioEquipment = {
  "VERIFIED OPERATIONAL EQUIPMENT": [
    "Melco CV700 embroidery machine",
    "Bambu H2D 3D printer",
    "Heat press",
  ],
};

const Equipment = () => {
  const [items, setItems] = useState<EquipmentItem[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEquipmentAndRooms = async () => {
      try {
        const { data: eqData } = await supabase.from("equipment" as any).select("*").order("name");
        const { data: roomData } = await supabase.from("rooms").select("id, name, color");

        setItems((eqData as any) || []);
        setRooms((roomData as any) || []);
      } catch (error) {
        // Equipment fetch failed — empty state will show
      } finally {
        setLoading(false);
      }
    };

    fetchEquipmentAndRooms();
  }, []);

  const roomName = (id: string | null) => rooms.find(r => r.id === id)?.name || "Shared";

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <div className="grain-overlay" />
      <Navbar />
      <div className="container pt-24 pb-16 space-y-12">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <p className="font-mono text-xs tracking-[0.3em] text-primary mb-2 uppercase">What We've Got</p>
          <h1 className="font-bebas text-5xl md:text-7xl text-foreground tracking-wider">EQUIPMENT</h1>
          <p className="text-muted-foreground font-barlow mt-2 max-w-xl mx-auto">Equipment confirmed operational in the supplied register. Ask the studio to confirm availability for your booking.</p>
        </motion.div>

        {/* Verified equipment from the supplied operational register */}
        <div className="max-w-4xl mx-auto space-y-6">
          <figure className="overflow-hidden border border-border">
            <img
              src="/images/rooms/360/production-workshop.jpeg"
              alt="Fully Governed production workshop"
              className="aspect-video w-full object-cover"
            />
            <figcaption className="border-t border-border px-4 py-2 text-sm text-muted-foreground">Production workshop</figcaption>
          </figure>
          {Object.entries(studioEquipment).map(([category, items], ci) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: ci * 0.05 }}
              className="bg-card border border-border rounded-lg overflow-hidden"
            >
              <div className="bg-secondary/50 px-4 py-3 border-b border-border">
                <h2 className="font-bebas text-xl text-foreground tracking-wider">{category}</h2>
              </div>
              <ul className="divide-y divide-border">
                {items.map((item) => (
                  <li key={item} className="px-4 py-3 text-sm text-muted-foreground font-barlow flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-primary shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* DB-tracked equipment */}
        {loading ? (
          <div className="max-w-4xl mx-auto space-y-3">
            <Skeleton className="h-6 w-48" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-32 rounded-lg" />
              ))}
            </div>
          </div>
        ) : items.length > 0 && (
          <div className="max-w-4xl mx-auto">
            <h2 className="font-bebas text-2xl text-foreground tracking-wider mb-4">TRACKED INVENTORY</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map((item, i) => (
                <motion.div key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="bg-card border border-border rounded-lg p-4 hover:border-interactive hover:shadow-[0_0_12px_hsl(var(--interactive))] transition-all">
                  <div className="flex items-start justify-between">
                    <h3 className="text-lg text-foreground">{item.name.toUpperCase()}</h3>
                    {statusIcon[item.status] || statusIcon.available}
                  </div>
                  <p className="text-xs text-muted-foreground font-mono mt-1">{roomName(item.room_id)}</p>
                  {item.description && <p className="text-sm text-muted-foreground mt-2">{item.description}</p>}
                  <span className="inline-block mt-2 text-xs font-mono px-2 py-0.5 rounded bg-secondary text-secondary-foreground capitalize">{item.status}</span>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Equipment;
