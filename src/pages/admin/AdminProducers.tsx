import { useEffect, useState } from "react";
import { Save, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ProducerProfile {
  id: string;
  slug: string;
  display_name: string;
  role_title: string;
  bio: string | null;
  avatar_url: string | null;
  skills: string[];
  is_active: boolean;
  sort_order: number;
}

const emptyProducer = {
  slug: "",
  display_name: "",
  role_title: "Producer / Specialist",
  bio: "",
  avatar_url: "",
  skills: "",
  is_active: true,
  sort_order: 100,
};

export default function AdminProducers() {
  const { toast } = useToast();
  const [producers, setProducers] = useState<ProducerProfile[]>([]);
  const [form, setForm] = useState(emptyProducer);

  const loadProducers = async () => {
    const { data } = await supabase
      .from("fg_producer_profiles" as any)
      .select("id, slug, display_name, role_title, bio, avatar_url, skills, is_active, sort_order")
      .order("sort_order", { ascending: true });
    setProducers((data as ProducerProfile[]) || []);
  };

  useEffect(() => {
    loadProducers();
  }, []);

  const saveProducer = async () => {
    if (!form.display_name.trim() || !form.slug.trim()) {
      toast({ title: "Name and slug are required", variant: "destructive" });
      return;
    }

    const payload = {
      slug: form.slug.trim(),
      display_name: form.display_name.trim(),
      role_title: form.role_title.trim(),
      bio: form.bio.trim() || null,
      avatar_url: form.avatar_url.trim() || null,
      skills: form.skills.split(",").map((skill) => skill.trim()).filter(Boolean),
      is_active: form.is_active,
      sort_order: Number(form.sort_order) || 100,
    };

    const { error } = await supabase.from("fg_producer_profiles" as any).upsert(payload, { onConflict: "slug" });
    if (error) {
      toast({ title: "Producer could not be saved", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Producer saved" });
    setForm(emptyProducer);
    loadProducers();
  };

  const toggleActive = async (producer: ProducerProfile) => {
    const { error } = await supabase
      .from("fg_producer_profiles" as any)
      .update({ is_active: !producer.is_active })
      .eq("id", producer.id);
    if (error) {
      toast({ title: "Status update failed", description: error.message, variant: "destructive" });
      return;
    }
    loadProducers();
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-4xl text-foreground">PRODUCERS</h1>
        <p className="text-muted-foreground font-barlow text-sm">Manage producer profiles, skills, rates placeholders and visibility.</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_24rem]">
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-background/50">
              <tr className="text-left text-xs text-muted-foreground">
                <th className="p-3">Name</th>
                <th className="p-3">Role</th>
                <th className="p-3">Skills</th>
                <th className="p-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {producers.map((producer) => (
                <tr key={producer.id} className="border-b border-border/50">
                  <td className="p-3">
                    <p className="text-foreground font-semibold">{producer.display_name}</p>
                    <p className="text-xs text-muted-foreground font-mono">{producer.slug}</p>
                  </td>
                  <td className="p-3 text-muted-foreground">{producer.role_title}</td>
                  <td className="p-3 text-xs text-muted-foreground">{producer.skills?.slice(0, 4).join(", ")}</td>
                  <td className="p-3 text-right">
                    <Button size="sm" variant="outline" onClick={() => toggleActive(producer)} className="font-mono text-xs">
                      {producer.is_active ? "Active" : "Hidden"}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-card border border-border rounded-lg p-5 space-y-4">
          <h2 className="font-bebas text-2xl tracking-wide text-foreground flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" /> Add / Update
          </h2>
          <div>
            <Label>Name</Label>
            <Input value={form.display_name} onChange={(event) => setForm({ ...form, display_name: event.target.value })} className="mt-1 bg-background" />
          </div>
          <div>
            <Label>Slug</Label>
            <Input value={form.slug} onChange={(event) => setForm({ ...form, slug: event.target.value })} className="mt-1 bg-background" placeholder="mono-luke" />
          </div>
          <div>
            <Label>Role title</Label>
            <Input value={form.role_title} onChange={(event) => setForm({ ...form, role_title: event.target.value })} className="mt-1 bg-background" />
          </div>
          <div>
            <Label>Skills comma-separated</Label>
            <Input value={form.skills} onChange={(event) => setForm({ ...form, skills: event.target.value })} className="mt-1 bg-background" />
          </div>
          <div>
            <Label>Avatar URL</Label>
            <Input value={form.avatar_url} onChange={(event) => setForm({ ...form, avatar_url: event.target.value })} className="mt-1 bg-background" />
          </div>
          <div>
            <Label>Bio</Label>
            <textarea value={form.bio} onChange={(event) => setForm({ ...form, bio: event.target.value })} rows={4} className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground" />
          </div>
          <Button onClick={saveProducer} className="w-full font-bebas tracking-wide">
            <Save className="mr-2 h-4 w-4" /> Save Producer
          </Button>
        </div>
      </div>
    </div>
  );
}
