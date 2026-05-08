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

// Section 22 — full equipment tables
const studioEquipment = {
  "WORKSTATIONS": [
    "Apple Mac Studio M2 Ultra",
    "Apple MacBook Pro 16\" M3 Pro",
    "Custom PC (video editing / gaming)",
  ],
  "DISPLAYS": [
    "Samsung 49\" Ultra-Wide Curved Monitor",
    "Dell UltraSharp 27\" 4K (x2)",
    "BenQ PD3200U 32\" 4K",
  ],
  "AUDIO": [
    "Neumann TLM 103 Condenser Mic",
    "Universal Audio Apollo Twin X Interface",
    "DBX 286s Mic Preamp / Channel Strip",
    "MLV Mass Loaded Vinyl Soundproofing panels",
    "Focusrite Scarlett 18i20 (3rd Gen)",
    "Shure SM7B Dynamic Mic",
    "Audio-Technica ATH-M50x (x4)",
    "KRK Rokit 8 G4 Studio Monitors (pair)",
    "Akai MPC Live II",
    "Native Instruments Komplete Kontrol S61",
    "Roland SP-404 MKII",
  ],
  "CAMERAS & LIGHTING": [
    "Sony A7 IV Mirrorless Camera",
    "Sony 24-70mm f/2.8 GM II Lens",
    "Elgato Ring Light",
    "Aputure 120D II LED Panel (x2)",
    "DJI RS3 Pro Gimbal",
    "Elgato Cam Link 4K",
  ],
  "STREAMING & GAMING": [
    "Elgato Stream Deck XL",
    "Elgato HD60 X Capture Card",
    "Razer Kiyo Pro Webcam",
    "Corsair K100 RGB Keyboard",
    "Logitech G Pro X Superlight Mouse",
  ],
  "STORAGE & NETWORK": [
    "Synology DS920+ NAS (16TB RAID)",
    "Samsung T7 Shield 2TB SSD (x3)",
    "10Gbps Ethernet Switch",
  ],
  "SOFTWARE": [
    "Logic Pro X",
    "Ableton Live Suite 11",
    "FL Studio 21 Producer",
    "Adobe Creative Cloud (Full Suite)",
    "DaVinci Resolve Studio",
    "OBS Studio",
    "Streamlabs Desktop",
  ],
  "STUDIO AMENITIES": [
    "Red royal velvet sofas and seating",
    "Mini fridge (stocked with drinks)",
    "Microwave",
    "Cloud ceiling acoustic treatment",
    "Full acoustic treatment throughout",
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
          <p className="text-muted-foreground font-barlow mt-2 max-w-xl mx-auto">Full inventory across all three rooms.</p>
        </motion.div>

        {/* Static Section 22 equipment tables */}
        <div className="max-w-4xl mx-auto space-y-6">
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
