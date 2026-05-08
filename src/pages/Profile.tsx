import { useEffect, useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Crown, User, Save, ArrowLeft, Upload, Radio } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const Profile = () => {
  const { user, profile, role, loading, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [fullName, setFullName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [genre, setGenre] = useState("");
  const [instagram, setInstagram] = useState("");
  const [soundcloud, setSoundcloud] = useState("");
  const [youtube, setYoutube] = useState("");
  const [tiktok, setTiktok] = useState("");
  const [spotify, setSpotify] = useState("");
  const [twitter, setTwitter] = useState("");
  const [artistRole, setArtistRole] = useState("artist");
  const [inBuilding, setInBuilding] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate("/auth", { state: { from: "/profile" } });
  }, [loading, user, navigate]);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "");
      setDisplayName(profile.display_name || profile.full_name || "");
      setPhone(profile.phone || "");
      setBio(profile.bio || "");
      setGenre(profile.genre || "");
      setInstagram(profile.instagram || "");
      setSoundcloud(profile.soundcloud || "");
      setYoutube(profile.youtube || "");
      setTiktok((profile as any).tiktok || "");
      setSpotify((profile as any).spotify || "");
      setTwitter((profile as any).twitter || "");
      setArtistRole((profile as any).artist_role || "artist");
      setInBuilding((profile as any).in_building || false);
    }
  }, [profile]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${user.id}/avatar.${ext}`;

    const { error: uploadError } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    if (uploadError) {
      toast({ title: "Upload failed", description: uploadError.message, variant: "destructive" });
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
    await supabase.from("profiles").update({ avatar_url: urlData.publicUrl }).eq("user_id", user.id);
    await refreshProfile();
    toast({ title: "Avatar updated! 📸" });
    setUploading(false);
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await (supabase.from("profiles").update({
      full_name: fullName,
      display_name: displayName || fullName,
      phone,
      bio,
      genre,
      instagram,
      soundcloud,
      youtube,
      tiktok,
      spotify,
      twitter,
      artist_role: artistRole,
      in_building: inBuilding,
    } as any) as any).eq("user_id", user.id);

    if (error) {
      toast({ title: "Error saving profile", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Profile updated 🎤" });
      await refreshProfile();
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Crown className="w-8 h-8 text-primary animate-pulse-gold" />
      </div>
    );
  }

  if (!user || !profile) return null;

  const tierEmoji = role === "creator_admin" ? "🛡️" : role === "family" ? "👑" : "🎤";
  const tierLabel = role === "creator_admin" ? "ADMIN" : role === "family" ? "FAMILY" : "CUSTOMER";

  return (
    <div className="min-h-screen bg-background">
      <div className="grain-overlay" />
      <header className="border-b border-border bg-card/50 backdrop-blur-xl">
        <div className="container flex items-center justify-between h-16">
          <Link to="/dashboard" className="flex items-center gap-2 text-muted-foreground hover:text-interactive transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-barlow text-sm">Back to Dashboard</span>
          </Link>
        </div>
      </header>

      <div className="container py-8 max-w-2xl space-y-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative group">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt="Avatar" className="w-16 h-16 rounded-full border-2 border-interactive object-cover" />
              ) : (
                <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center">
                  <User className="w-8 h-8 text-muted-foreground" />
                </div>
              )}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 bg-background/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                disabled={uploading}
              >
                <Upload className="w-5 h-5 text-foreground" />
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
              {(profile as any).in_building && (
                <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-emerald-500 border-2 border-background" title="In the building" />
              )}
            </div>
            <div>
              <h1 className="text-3xl text-foreground uppercase">{profile.display_name || profile.full_name}</h1>
              <p className="text-muted-foreground font-barlow text-sm">{tierEmoji} {tierLabel} · {Math.max(0, profile.loyalty_points)} pts</p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card border border-border rounded-lg p-6 space-y-4">
          <h2 className="text-2xl text-foreground">EDIT PROFILE</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-muted-foreground">Full Name (used for bookings)</Label>
              <Input value={fullName} onChange={(e) => setFullName(e.target.value)} className="mt-1 bg-background" />
            </div>
            <div>
              <Label className="text-muted-foreground">Artist / Display Name (shown publicly)</Label>
              <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="mt-1 bg-background" />
            </div>
          </div>

          <div>
            <Label className="text-muted-foreground">Phone (Optional)</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1 bg-background" placeholder="+44..." />
          </div>

          <div>
            <Label className="text-muted-foreground">Role</Label>
            <select
              value={artistRole}
              onChange={(e) => setArtistRole(e.target.value)}
              className="w-full mt-1 bg-background border border-border rounded-md px-3 py-2 text-foreground text-sm focus:border-interactive focus:ring-1 focus:ring-interactive focus:outline-none transition-colors"
            >
              <option value="artist">Artist</option>
              <option value="producer">Producer</option>
              <option value="both">Artist & Producer</option>
            </select>
          </div>

          <div>
            <Label className="text-muted-foreground">Genre / Style</Label>
            <Input value={genre} onChange={(e) => setGenre(e.target.value)} className="mt-1 bg-background" placeholder="e.g. UK Drill, Afrobeats, Podcast" />
          </div>

          <div>
            <Label className="text-muted-foreground">Bio</Label>
            <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} className="w-full mt-1 bg-background border border-border rounded-md px-3 py-2 text-foreground text-sm resize-none focus:border-interactive focus:ring-1 focus:ring-interactive focus:outline-none transition-colors" placeholder="Tell us about yourself..." />
          </div>

          <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer group">
            <input type="checkbox" checked={inBuilding} onChange={(e) => setInBuilding(e.target.checked)} className="accent-interactive" />
            <Radio className="w-4 h-4 text-emerald-500" />
            <span className="group-hover:text-interactive transition-colors">I'm in the building right now</span>
          </label>

          <h3 className="text-xl text-foreground pt-2">SOCIALS</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label className="text-muted-foreground">Instagram</Label>
              <Input value={instagram} onChange={(e) => setInstagram(e.target.value)} className="mt-1 bg-background" placeholder="@handle" />
            </div>
            <div>
              <Label className="text-muted-foreground">SoundCloud</Label>
              <Input value={soundcloud} onChange={(e) => setSoundcloud(e.target.value)} className="mt-1 bg-background" placeholder="URL" />
            </div>
            <div>
              <Label className="text-muted-foreground">YouTube</Label>
              <Input value={youtube} onChange={(e) => setYoutube(e.target.value)} className="mt-1 bg-background" placeholder="URL" />
            </div>
            <div>
              <Label className="text-muted-foreground">TikTok</Label>
              <Input value={tiktok} onChange={(e) => setTiktok(e.target.value)} className="mt-1 bg-background" placeholder="@handle" />
            </div>
            <div>
              <Label className="text-muted-foreground">Spotify</Label>
              <Input value={spotify} onChange={(e) => setSpotify(e.target.value)} className="mt-1 bg-background" placeholder="URL" />
            </div>
            <div>
              <Label className="text-muted-foreground">Twitter / X</Label>
              <Input value={twitter} onChange={(e) => setTwitter(e.target.value)} className="mt-1 bg-background" placeholder="@handle" />
            </div>
          </div>

          <Button onClick={handleSave} disabled={saving} className="w-full font-bebas text-lg tracking-wider h-12">
            <Save className="w-4 h-4 mr-2" />
            {saving ? "SAVING..." : "SAVE PROFILE"}
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;
