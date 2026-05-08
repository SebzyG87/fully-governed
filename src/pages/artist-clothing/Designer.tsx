import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Upload, Check } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const productTypes = [
  { value: "t-shirt", label: "T-Shirt", icon: "👕" },
  { value: "hoodie", label: "Hoodie", icon: "🧥" },
  { value: "cap", label: "Cap", icon: "🧢" },
  { value: "tote-bag", label: "Tote Bag", icon: "👜" },
];

const placements = ["Front", "Back", "Sleeve"];

const colours = [
  { name: "Black", hex: "#111111" },
  { name: "White", hex: "#F5F5F5" },
  { name: "Grey", hex: "#6B7280" },
  { name: "Navy", hex: "#1E3A5F" },
  { name: "Forest Green", hex: "#228B22" },
  { name: "Burgundy", hex: "#800020" },
];

const Designer = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);

  const [productType, setProductType] = useState("t-shirt");
  const [artworkFile, setArtworkFile] = useState<File | null>(null);
  const [artworkPreview, setArtworkPreview] = useState<string | null>(null);
  const [placement, setPlacement] = useState("Front");
  const [baseColour, setBaseColour] = useState("Black");
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [saving, setSaving] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "image/png") {
      toast({ title: "Only PNG files are accepted", variant: "destructive" });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "File must be under 5MB", variant: "destructive" });
      return;
    }
    setArtworkFile(file);
    setArtworkPreview(URL.createObjectURL(file));
  };

  const handleSave = async (status: "draft" | "under_review") => {
    if (!user) return;
    if (!title.trim()) {
      toast({ title: "Product title is required", variant: "destructive" });
      return;
    }
    if (!price || Number(price) <= 0) {
      toast({ title: "A valid selling price is required", variant: "destructive" });
      return;
    }

    setSaving(true);
    let artworkUrl: string | null = null;

    if (artworkFile) {
      const ext = artworkFile.name.split(".").pop();
      const path = `clothing/${user.id}/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from("avatars").upload(path, artworkFile);
      if (!uploadError) {
        const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
        artworkUrl = urlData.publicUrl;
      }
    }

    const { error } = await supabase.from("clothing_products").insert({
      user_id: user.id,
      name: title.trim(),
      base_price: Number(price),
      status,
      product_type: productType,
      base_colour: baseColour,
      artwork_url: artworkUrl,
      placement: placement.toLowerCase(),
    });

    setSaving(false);

    if (error) {
      toast({ title: "Failed to save product", description: error.message, variant: "destructive" });
      return;
    }

    if (status === "under_review") {
      toast({ title: "Submitted! Admin will review within 24 hours." });
    } else {
      toast({ title: "Draft saved successfully." });
    }

    // Reset
    setTitle("");
    setPrice("");
    setArtworkFile(null);
    setArtworkPreview(null);
    setProductType("t-shirt");
    setPlacement("Front");
    setBaseColour("Black");
  };

  const selectedColourHex = colours.find(c => c.name === baseColour)?.hex || "#111";

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navbar />
      <div className="grain-overlay" />
      <div className="container pt-24 pb-16 space-y-12 max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <p className="font-mono text-xs tracking-[0.3em] text-primary mb-2 uppercase">My Clothing</p>
          <h1 className="font-bebas text-5xl md:text-7xl text-foreground tracking-wider">DESIGN TOOL</h1>
          <p className="text-muted-foreground font-barlow mt-2">Select base product, upload artwork, position it, preview mockup and submit for review.</p>
        </motion.div>

        {/* Step 1 */}
        <section className="space-y-4">
          <h2 className="font-bebas text-2xl text-foreground tracking-wider">STEP 1 — SELECT BASE PRODUCT</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {productTypes.map((pt) => (
              <button key={pt.value} onClick={() => setProductType(pt.value)} className={`border rounded-lg p-4 text-center transition-colors ${productType === pt.value ? "border-primary bg-primary/10" : "border-border bg-card hover:border-primary/50"}`}>
                <span className="text-3xl block mb-2">{pt.icon}</span>
                <span className="font-barlow text-sm text-foreground">{pt.label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Step 2 */}
        <section className="space-y-4">
          <h2 className="font-bebas text-2xl text-foreground tracking-wider">STEP 2 — UPLOAD ARTWORK</h2>
          <div className="border border-dashed border-border rounded-lg p-8 text-center bg-card cursor-pointer hover:border-primary/50 transition-colors" onClick={() => fileRef.current?.click()}>
            {artworkPreview ? (
              <img src={artworkPreview} alt="Artwork" className="max-h-48 mx-auto rounded" />
            ) : (
              <>
                <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground font-barlow text-sm">Click to upload PNG (max 5MB)</p>
              </>
            )}
            <input ref={fileRef} type="file" accept=".png" className="hidden" onChange={handleFileChange} />
          </div>
        </section>

        {/* Step 3 */}
        <section className="space-y-4">
          <h2 className="font-bebas text-2xl text-foreground tracking-wider">STEP 3 — PLACEMENT</h2>
          <div className="flex gap-4">
            {placements.map((p) => (
              <button key={p} onClick={() => setPlacement(p)} className={`flex-1 border rounded-lg py-3 font-barlow text-sm transition-colors ${placement === p ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-muted-foreground hover:border-primary/50"}`}>
                {p}
              </button>
            ))}
          </div>
        </section>

        {/* Step 4 */}
        <section className="space-y-4">
          <h2 className="font-bebas text-2xl text-foreground tracking-wider">STEP 4 — BASE COLOUR</h2>
          <div className="flex flex-wrap gap-3">
            {colours.map((c) => (
              <button key={c.name} onClick={() => setBaseColour(c.name)} className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all ${baseColour === c.name ? "border-primary scale-110" : "border-border"}`} style={{ backgroundColor: c.hex }} title={c.name}>
                {baseColour === c.name && <Check className="w-5 h-5 text-primary" />}
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground font-barlow">Selected: {baseColour}</p>
        </section>

        {/* Step 5 */}
        <section className="space-y-4">
          <h2 className="font-bebas text-2xl text-foreground tracking-wider">STEP 5 — PRODUCT DETAILS</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="font-barlow text-sm">Product Title *</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="My Custom Tee" maxLength={100} />
            </div>
            <div className="space-y-2">
              <Label className="font-barlow text-sm">Selling Price (£) *</Label>
              <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="25.00" min="1" step="0.01" />
            </div>
          </div>
        </section>

        {/* Preview */}
        <section className="space-y-4">
          <h2 className="font-bebas text-2xl text-foreground tracking-wider">PREVIEW</h2>
          <div className="border border-border rounded-lg p-6 bg-card flex flex-col items-center gap-4">
            <div className="w-48 h-56 rounded-lg flex flex-col items-center justify-center gap-2 relative" style={{ backgroundColor: selectedColourHex }}>
              <span className="text-xs font-mono uppercase tracking-wider" style={{ color: baseColour === "White" ? "#333" : "#eee" }}>
                {productTypes.find(p => p.value === productType)?.label}
              </span>
              {artworkPreview && (
                <img src={artworkPreview} alt="Preview" className="w-20 h-20 object-contain rounded" />
              )}
              <span className="text-[10px] font-mono uppercase" style={{ color: baseColour === "White" ? "#666" : "#aaa" }}>
                {placement}
              </span>
            </div>
            <div className="text-center">
              <p className="font-bebas text-lg text-foreground">{title || "Untitled"}</p>
              <p className="text-primary font-barlow">£{price || "0.00"}</p>
            </div>
          </div>
        </section>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button variant="outline" className="flex-1" onClick={() => handleSave("draft")} disabled={saving}>
            {saving ? "Saving…" : "Save as Draft"}
          </Button>
          <Button className="flex-1 bg-primary text-primary-foreground" onClick={() => handleSave("under_review")} disabled={saving}>
            {saving ? "Submitting…" : "Submit for Review"}
          </Button>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Designer;
