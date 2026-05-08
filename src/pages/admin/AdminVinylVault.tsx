import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Disc3, Search, Save, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface Track {
  id: string;
  title: string;
  status: string;
  is_exclusive: boolean;
  tier_required: string;
  file_url: string | null;
  cover_url: string | null;
  profiles?: { full_name: string };
}

const TIERS = ["free", "member", "gold", "platinum"];

interface TrackRowProps {
  track: Track;
  onSave: (id: string, is_exclusive: boolean, tier_required: string) => Promise<void>;
  saving: string | null;
}

const TrackRow = ({ track, onSave, saving }: TrackRowProps) => {
  const [isEx, setIsEx] = useState(track.is_exclusive);
  const [tier, setTier] = useState(track.tier_required ?? "free");
  const dirty = isEx !== track.is_exclusive || tier !== (track.tier_required ?? "free");

  return (
    <tr className="hover:bg-accent/20">
      <td className="p-3">
        <p className="text-foreground">{track.title}</p>
        <p className="text-xs text-muted-foreground">{(track.profiles as any)?.full_name ?? "Unknown"}</p>
      </td>
      <td className="p-3 text-center">
        <input
          type="checkbox"
          checked={isEx}
          onChange={e => setIsEx(e.target.checked)}
          className="accent-primary w-4 h-4"
        />
      </td>
      <td className="p-3 text-center">
        <select
          value={tier}
          onChange={e => setTier(e.target.value)}
          disabled={!isEx}
          className="bg-background border border-border rounded px-2 py-1 text-xs font-mono disabled:opacity-40"
        >
          {TIERS.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </td>
      <td className="p-3 text-right">
        <Button
          size="sm"
          onClick={() => onSave(track.id, isEx, isEx ? tier : "free")}
          disabled={!dirty || saving === track.id}
          className="font-bebas tracking-wider"
        >
          {saving === track.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <><Save className="w-3 h-3 mr-1" />SAVE</>}
        </Button>
      </td>
    </tr>
  );
};

const AdminVinylVault = () => {
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: tracks, isLoading } = useQuery({
    queryKey: ["admin_vinyl_vault"],
    queryFn: async () => {
      const { data } = await supabase
        .from("music_tracks")
        .select("*, profiles(full_name)")
        .eq("status", "approved")
        .order("created_at", { ascending: false });
      return (data ?? []) as Track[];
    },
  });

  const updateTrack = async (id: string, is_exclusive: boolean, tier_required: string) => {
    setSaving(id);
    const { error } = await supabase
      .from("music_tracks")
      .update({ is_exclusive, tier_required })
      .eq("id", id);
    setSaving(null);
    if (error) {
      toast({ title: "Update failed", variant: "destructive" });
    } else {
      toast({ title: "Track updated" });
      queryClient.invalidateQueries({ queryKey: ["admin_vinyl_vault"] });
    }
  };

  const filtered = search
    ? (tracks ?? []).filter(t =>
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        (t.profiles as any)?.full_name?.toLowerCase().includes(search.toLowerCase())
      )
    : (tracks ?? []);

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex items-center gap-3">
        <Disc3 className="w-6 h-6 text-primary" />
        <h1 className="font-bebas text-3xl tracking-wider text-foreground">DIGITAL VINYL VAULT</h1>
      </div>
      <p className="text-muted-foreground font-barlow text-sm">
        Control which tracks are exclusive and which membership tier is required to access them.
      </p>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search tracks or artists..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/30">
              <th className="text-left p-3 font-bebas tracking-wider">Track</th>
              <th className="text-center p-3 font-bebas tracking-wider">Exclusive</th>
              <th className="text-center p-3 font-bebas tracking-wider">Min Tier</th>
              <th className="text-right p-3 font-bebas tracking-wider">Save</th>
            </tr>
          </thead>
          <tbody className="font-barlow divide-y divide-border">
            {isLoading ? (
              <tr><td colSpan={4} className="p-6 text-center text-muted-foreground">Loading...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={4} className="p-6 text-center text-muted-foreground">No approved tracks</td></tr>
            ) : filtered.map(track => (
              <TrackRow key={track.id} track={track} onSave={updateTrack} saving={saving} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminVinylVault;
