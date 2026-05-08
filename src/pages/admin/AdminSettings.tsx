import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Settings, Save, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface RoomSetting {
  id: string;
  name: string;
  description: string | null;
  slug: string;
}

interface EngineerRow {
  id: string;
  name: string;
  speciality: string | null;
  availability: string;
}

const AdminSettings = () => {
  const [rooms, setRooms] = useState<RoomSetting[]>([]);
  const [engineers, setEngineers] = useState<EngineerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [newEngName, setNewEngName] = useState("");
  const [newEngSpec, setNewEngSpec] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    Promise.all([
      supabase.from("rooms").select("id, name, description, slug"),
      supabase.from("engineers").select("*"),
    ]).then(([roomsRes, engRes]) => {
      setRooms((roomsRes.data as RoomSetting[]) || []);
      setEngineers((engRes.data as EngineerRow[]) || []);
      setLoading(false);
    });
  }, []);

  const updateRoom = (id: string, field: string, value: string) => {
    setRooms(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const saveRooms = async () => {
    for (const room of rooms) {
      await supabase.from("rooms").update({ name: room.name, description: room.description }).eq("id", room.id);
    }
    toast({ title: "Settings saved" });
  };

  const addEngineer = async () => {
    if (!newEngName.trim()) return;
    const { error } = await supabase.from("engineers").insert({ name: newEngName, speciality: newEngSpec || null });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Engineer added" });
      setNewEngName("");
      setNewEngSpec("");
      const { data } = await supabase.from("engineers").select("*");
      setEngineers((data as EngineerRow[]) || []);
    }
  };

  const removeEngineer = async (id: string) => {
    await supabase.from("engineers").delete().eq("id", id);
    setEngineers(prev => prev.filter(e => e.id !== id));
    toast({ title: "Engineer removed" });
  };

  const toggleEngineerAvailability = async (id: string, current: string) => {
    const next = current === "available" ? "unavailable" : "available";
    await supabase.from("engineers").update({ availability: next }).eq("id", id);
    setEngineers(prev => prev.map(e => e.id === id ? { ...e, availability: next } : e));
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-4xl text-foreground">SETTINGS</h1>
        <p className="text-muted-foreground font-barlow text-sm">Studio configuration</p>
      </motion.div>

      <div className="bg-card border border-border rounded-lg p-6 space-y-4">
        <h2 className="text-2xl text-foreground">STUDIO DETAILS</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-muted-foreground text-xs">Studio Name</Label>
            <Input value="Fully Governed" disabled className="mt-1 bg-background opacity-60" />
          </div>
          <div>
            <Label className="text-muted-foreground text-xs">Address</Label>
            <Input value="174-178 V22 Building, Unit 1B-1C, Lewisham" disabled className="mt-1 bg-background opacity-60" />
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg p-6 space-y-4">
        <h2 className="text-2xl text-foreground">ROOM SETTINGS</h2>
        {loading ? (
          <Settings className="w-6 h-6 text-primary animate-pulse" />
        ) : (
          rooms.map((room) => (
            <div key={room.id} className="border border-border rounded-lg p-4 space-y-3">
              <div>
                <Label className="text-muted-foreground text-xs">Room Name</Label>
                <Input value={room.name} onChange={(e) => updateRoom(room.id, "name", e.target.value)} className="mt-1 bg-background" />
              </div>
              <div>
                <Label className="text-muted-foreground text-xs">Description</Label>
                <Input value={room.description || ""} onChange={(e) => updateRoom(room.id, "description", e.target.value)} className="mt-1 bg-background" />
              </div>
            </div>
          ))
        )}
        <Button onClick={saveRooms} className="font-bebas tracking-wider">
          <Save className="w-4 h-4 mr-1" /> SAVE ROOM SETTINGS
        </Button>
      </div>

      {/* Engineers Management */}
      <div className="bg-card border border-border rounded-lg p-6 space-y-4">
        <h2 className="text-2xl text-foreground">ENGINEERS & PRODUCERS</h2>
        {engineers.map((eng) => (
          <div key={eng.id} className="flex items-center justify-between border border-border rounded-lg p-3">
            <div>
              <p className="text-foreground text-sm">{eng.name}</p>
              <p className="text-xs text-muted-foreground">{eng.speciality || "General"}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => toggleEngineerAvailability(eng.id, eng.availability)}
                className={`text-xs font-mono px-2 py-0.5 rounded ${eng.availability === "available" ? "bg-emerald-500/20 text-emerald-400" : "bg-destructive/20 text-destructive"}`}
              >
                {eng.availability}
              </button>
              <button onClick={() => removeEngineer(eng.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
        <div className="flex gap-2">
          <Input value={newEngName} onChange={(e) => setNewEngName(e.target.value)} placeholder="Name" className="bg-background" />
          <Input value={newEngSpec} onChange={(e) => setNewEngSpec(e.target.value)} placeholder="Speciality" className="bg-background" />
          <Button onClick={addEngineer} size="sm" className="font-bebas tracking-wider">
            <Plus className="w-4 h-4 mr-1" /> ADD
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
