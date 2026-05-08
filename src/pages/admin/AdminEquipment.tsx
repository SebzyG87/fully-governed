import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Wrench, Plus, Save, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface EquipmentItem {
  id: string;
  name: string;
  description: string | null;
  status: string;
  room_id: string | null;
  condition_notes: string | null;
  pac_test_date: string | null;
  insurance_expiry: string | null;
}

interface Room {
  id: string;
  name: string;
}

const AdminEquipment = () => {
  const [items, setItems] = useState<EquipmentItem[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newRoom, setNewRoom] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const { toast } = useToast();

  const fetch = async () => {
    const [eqRes, roomRes] = await Promise.all([
      supabase.from("equipment").select("*").order("name"),
      supabase.from("rooms").select("id, name"),
    ]);
    setItems((eqRes.data as EquipmentItem[]) || []);
    setRooms((roomRes.data as Room[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetch(); }, []);

  const handleAdd = async () => {
    if (!newName.trim()) return;
    const { error } = await supabase.from("equipment").insert({
      name: newName,
      room_id: newRoom || null,
      description: newDesc || null,
    });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Equipment added" });
      setNewName(""); setNewDesc(""); setNewRoom(""); setShowAdd(false);
      fetch();
    }
  };

  const updateStatus = async (id: string, status: string) => {
    await supabase.from("equipment").update({ status }).eq("id", id);
    fetch();
  };

  const roomName = (id: string | null) => rooms.find(r => r.id === id)?.name || "Shared";

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl text-foreground">EQUIPMENT</h1>
          <p className="text-muted-foreground font-barlow text-sm">{items.length} items tracked</p>
        </div>
        <Button size="sm" onClick={() => setShowAdd(!showAdd)} className="font-bebas tracking-wider">
          <Plus className="w-4 h-4 mr-1" /> ADD ITEM
        </Button>
      </motion.div>

      {showAdd && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="bg-card border border-border rounded-lg p-4 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <Label className="text-muted-foreground text-xs">Name</Label>
              <Input value={newName} onChange={(e) => setNewName(e.target.value)} className="mt-1 bg-background" placeholder="e.g. Neumann U87" />
            </div>
            <div>
              <Label className="text-muted-foreground text-xs">Room</Label>
              <select value={newRoom} onChange={(e) => setNewRoom(e.target.value)} className="w-full mt-1 bg-background border border-border rounded-md px-3 py-2 text-foreground text-sm focus:border-interactive focus:outline-none">
                <option value="">Shared</option>
                {rooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </div>
            <div>
              <Label className="text-muted-foreground text-xs">Description</Label>
              <Input value={newDesc} onChange={(e) => setNewDesc(e.target.value)} className="mt-1 bg-background" placeholder="Optional" />
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleAdd} className="font-bebas tracking-wider"><Save className="w-4 h-4 mr-1" /> SAVE</Button>
            <Button size="sm" variant="ghost" onClick={() => setShowAdd(false)}><X className="w-4 h-4" /></Button>
          </div>
        </motion.div>
      )}

      {loading ? (
        <div className="flex justify-center py-12"><Wrench className="w-6 h-6 text-primary animate-pulse" /></div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground font-mono text-xs">
                <th className="text-left py-3 px-2">Name</th>
                <th className="text-left py-3 px-2">Room</th>
                <th className="text-left py-3 px-2">Status</th>
                <th className="text-left py-3 px-2">PAC Test</th>
                <th className="text-left py-3 px-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-border/50 hover:bg-accent/30 transition-colors">
                  <td className="py-3 px-2 text-foreground">{item.name}</td>
                  <td className="py-3 px-2 text-muted-foreground text-xs">{roomName(item.room_id)}</td>
                  <td className="py-3 px-2">
                    <select value={item.status} onChange={(e) => updateStatus(item.id, e.target.value)} className="bg-transparent border border-border rounded px-2 py-0.5 text-xs text-foreground focus:border-interactive focus:outline-none">
                      <option value="available">Available</option>
                      <option value="in use">In Use</option>
                      <option value="maintenance">Maintenance</option>
                    </select>
                  </td>
                  <td className="py-3 px-2 text-muted-foreground font-mono text-xs">{item.pac_test_date || "—"}</td>
                  <td className="py-3 px-2 text-xs text-muted-foreground">{item.condition_notes || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminEquipment;
