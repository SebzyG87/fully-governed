import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Users, Search, ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

interface Artist {
  user_id: string;
  full_name: string;
  genre: string | null;
  artist_role: string | null;
  bio: string | null;
  in_building: boolean | null;
  instagram: string | null;
  spotify: string | null;
  created_at: string;
}

const AdminArtists = () => {
  const [search, setSearch] = useState("");

  const { data: artists, isLoading } = useQuery({
    queryKey: ["admin_artists"],
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("user_id, full_name, genre, artist_role, bio, in_building, instagram, spotify, created_at")
        .not("full_name", "is", null)
        .order("created_at", { ascending: false });
      return (data ?? []) as Artist[];
    },
  });

  const filtered = search
    ? (artists ?? []).filter(a =>
        a.full_name.toLowerCase().includes(search.toLowerCase()) ||
        (a.genre ?? "").toLowerCase().includes(search.toLowerCase()) ||
        (a.artist_role ?? "").toLowerCase().includes(search.toLowerCase())
      )
    : (artists ?? []);

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex items-center gap-3">
        <Users className="w-6 h-6 text-primary" />
        <h1 className="font-bebas text-3xl tracking-wider text-foreground">ARTIST PROFILES</h1>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total artists", value: artists?.length ?? 0 },
          { label: "In building", value: artists?.filter(a => a.in_building).length ?? 0 },
          { label: "With genre", value: artists?.filter(a => a.genre).length ?? 0 },
          { label: "With bio", value: artists?.filter(a => a.bio).length ?? 0 },
        ].map(s => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-3 text-center">
            <p className="font-bebas text-2xl text-primary">{s.value}</p>
            <p className="font-barlow text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search by name, genre, role..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/30">
              <th className="text-left p-3 font-bebas tracking-wider">Artist</th>
              <th className="text-left p-3 font-bebas tracking-wider hidden md:table-cell">Genre / Role</th>
              <th className="text-center p-3 font-bebas tracking-wider">In Building</th>
              <th className="text-right p-3 font-bebas tracking-wider">Joined</th>
              <th className="text-right p-3 font-bebas tracking-wider">Profile</th>
            </tr>
          </thead>
          <tbody className="font-barlow divide-y divide-border">
            {isLoading ? (
              <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">Loading...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">No artists found</td></tr>
            ) : filtered.map(a => (
              <tr key={a.user_id} className="hover:bg-accent/20">
                <td className="p-3">
                  <p className="text-foreground font-medium">{a.full_name}</p>
                  {a.bio && <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5 max-w-[200px]">{a.bio}</p>}
                </td>
                <td className="p-3 hidden md:table-cell">
                  {a.genre && <span className="font-mono text-xs text-primary bg-primary/10 px-2 py-0.5 rounded">{a.genre}</span>}
                  {a.artist_role && <span className="font-mono text-xs text-muted-foreground ml-2">{a.artist_role}</span>}
                </td>
                <td className="p-3 text-center">
                  <div className={`w-2 h-2 rounded-full mx-auto ${a.in_building ? "bg-emerald-400" : "bg-muted"}`} />
                </td>
                <td className="p-3 text-right font-mono text-xs text-muted-foreground">{format(new Date(a.created_at), "dd MMM yy")}</td>
                <td className="p-3 text-right">
                  <Button size="sm" variant="outline" asChild>
                    <a href={`/artists/${a.full_name.replace(/\s+/g, "-").toLowerCase()}`} target="_blank" rel="noreferrer">
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminArtists;
