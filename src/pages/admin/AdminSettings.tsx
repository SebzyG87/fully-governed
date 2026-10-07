import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Settings, Save, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { StripeIntegrationPlaceholderPanel } from "@/components/payments/StripeIntegrationPlaceholderPanel";
import { AIAdminPanel } from "@/components/studio-ops/AIAdminPanel";
import { EmailWorkflowPreview } from "@/components/studio-ops/EmailWorkflowPreview";
import { useToast } from "@/hooks/use-toast";

interface RoomSetting {
  id: string;
  name: string;
  description: string | null;
  slug: string;
  pricing?: {
    capacity?: number;
    setup_types?: string[];
    setup_time_minutes?: number;
    breakdown_time_minutes?: number;
    overtime_rate_per_hour?: number;
  } | null;
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
      supabase.from("rooms").select("id, name, description, slug, pricing"),
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

  const updateRoomPricing = (id: string, field: string, value: string | number | string[]) => {
    setRooms(prev => prev.map((room) => (
      room.id === id ? { ...room, pricing: { ...(room.pricing || {}), [field]: value } } : room
    )));
  };

  const saveRooms = async () => {
    for (const room of rooms) {
      await supabase.from("rooms").update({ name: room.name, description: room.description, pricing: room.pricing || {} }).eq("id", room.id);
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
            <Input value="HMEZZ 1B, V22 Building, 174-186 Hither Green Lane, Hither Green, Lewisham, London SE13 6QB" disabled className="mt-1 bg-background opacity-60" />
          </div>
        </div>
      </div>

      <details className="bg-card border border-border rounded-lg p-6">
        <summary className="cursor-pointer text-2xl text-foreground">PRIVATE DEVELOPER CONFIG</summary>
        <p className="mt-2 mb-4 text-sm text-muted-foreground font-barlow">
          Internal integration notes live here, away from day-to-day operations dashboards.
        </p>
        <div className="space-y-5">
          <StripeIntegrationPlaceholderPanel />
          <EmailWorkflowPreview />
          <AIAdminPanel />
        </div>
      </details>

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
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
                <div>
                  <Label className="text-muted-foreground text-xs">Capacity</Label>
                  <Input
                    type="number"
                    min="1"
                    value={room.pricing?.capacity ?? ""}
                    onChange={(e) => updateRoomPricing(room.id, "capacity", Number(e.target.value || 0))}
                    className="mt-1 bg-background"
                  />
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Setup Types</Label>
                  <Input
                    value={(room.pricing?.setup_types || []).join(", ")}
                    onChange={(e) => updateRoomPricing(room.id, "setup_types", e.target.value.split(",").map((item) => item.trim()).filter(Boolean))}
                    placeholder="recording, podcast, video"
                    className="mt-1 bg-background"
                  />
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Setup Minutes</Label>
                  <Input
                    type="number"
                    min="0"
                    value={room.pricing?.setup_time_minutes ?? ""}
                    onChange={(e) => updateRoomPricing(room.id, "setup_time_minutes", Number(e.target.value || 0))}
                    className="mt-1 bg-background"
                  />
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Breakdown Minutes</Label>
                  <Input
                    type="number"
                    min="0"
                    value={room.pricing?.breakdown_time_minutes ?? ""}
                    onChange={(e) => updateRoomPricing(room.id, "breakdown_time_minutes", Number(e.target.value || 0))}
                    className="mt-1 bg-background"
                  />
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Overtime £/hr</Label>
                  <Input
                    type="number"
                    min="0"
                    value={room.pricing?.overtime_rate_per_hour ?? ""}
                    onChange={(e) => updateRoomPricing(room.id, "overtime_rate_per_hour", Number(e.target.value || 0))}
                    className="mt-1 bg-background"
                  />
                </div>
              </div>
            </div>
          ))
        )}
        <Button onClick={saveRooms} className="font-bebas tracking-wider">
          <Save className="w-4 h-4 mr-1" /> SAVE ROOM SETTINGS
        </Button>
      </div>

      {/* Higgsfield Ad Planning & Campaign Specs */}
      <div className="bg-card border border-border rounded-lg p-6 space-y-4">
        <div className="flex justify-between items-center pb-2 border-b border-border/40">
          <h2 className="text-2xl text-foreground font-bebas tracking-wider">HIGGSFIELD AD PLANNING & CAMPAIGN SPECS</h2>
          <span className="rounded bg-red-950/20 text-red-300 border border-red-500/30 px-2.5 py-0.5 text-[10px] font-mono font-bold animate-pulse">
            CREDITS EXPIRING SOON
          </span>
        </div>
        <div className="space-y-4 text-xs font-barlow text-muted-foreground leading-relaxed">
          <p className="rounded-xl border border-amber-500/25 bg-amber-500/10 p-3.5 text-amber-100 font-semibold">
            Operational Rule: Do not fake room layouts in campaigns. Only use real room footage if it is of exceptional quality. If physical footage is weak, prioritize ads focused on digital or creative services where room aesthetics are irrelevant.
          </p>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-border bg-card/60 p-4 space-y-2">
              <h4 className="font-bebas text-base text-foreground tracking-wide uppercase">Ad Service Focus Categories</h4>
              <ul className="grid grid-cols-2 gap-1 font-mono text-[10px] text-muted-foreground">
                <li>• Artist Development</li>
                <li>• Video Editing</li>
                <li>• Motion Graphics</li>
                <li>• Music Production</li>
                <li>• Mixing & Mastering</li>
                <li>• Graphic Design</li>
                <li>• 3D Modelling</li>
                <li>• 3D Printing</li>
                <li>• Content Strategy</li>
                <li>• Podcast Production</li>
                <li>• Release Campaigns</li>
                <li>• Web & Business Systems</li>
              </ul>
            </div>

            <div className="rounded-xl border border-border bg-card/60 p-4 space-y-2">
              <h4 className="font-bebas text-base text-foreground tracking-wide uppercase">Approved Creative Formats</h4>
              <ul className="space-y-1">
                <li>• <strong className="text-foreground">UGC Explainer:</strong> Explaining creative automations or 3D prototyping.</li>
                <li>• <strong className="text-foreground">Storyboard Concept:</strong> Visual narrative using text/graphics overlay.</li>
                <li>• <strong className="text-foreground">Before/After Transformation:</strong> Showing raw mix vs master masterclass or raw asset vs 3D product render.</li>
                <li>• <strong className="text-foreground">Cinematic Campaigns:</strong> Stylistic content rollouts without physical studio dependencies.</li>
              </ul>
            </div>
          </div>
          <p className="text-[10px] italic">Campaign planning data loaded from HIGGSFIELD_AD_PLANNING.md configuration file.</p>
        </div>
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
