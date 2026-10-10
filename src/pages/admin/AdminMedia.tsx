import { useEffect, useState } from "react";
import { ImagePlus, LoaderCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { websiteMediaSlots, type WebsiteMediaSlot } from "@/lib/websiteMedia";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface SavedMedia {
  slot_key: string;
  label: string;
  public_url: string;
  storage_path: string;
}

const fileExtension = (file: File) => ({
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
}[file.type]);

const checkPanoramaRatio = (file: File) => new Promise<boolean>((resolve) => {
  const image = new Image();
  const objectUrl = URL.createObjectURL(file);
  image.onload = () => {
    const ratio = image.naturalWidth / image.naturalHeight;
    URL.revokeObjectURL(objectUrl);
    resolve(ratio >= 1.8 && ratio <= 2.2);
  };
  image.onerror = () => {
    URL.revokeObjectURL(objectUrl);
    resolve(false);
  };
  image.src = objectUrl;
});

const AdminMedia = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [savedMedia, setSavedMedia] = useState<Record<string, SavedMedia>>({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [uploading, setUploading] = useState<string | null>(null);

  const loadMedia = async () => {
    const { data, error } = await supabase
      .from("fg_site_media")
      .select("slot_key, label, public_url, storage_path");
    if (error) {
      setLoadError("Image management needs the website media database migration. The existing website images remain in place.");
    } else {
      setLoadError("");
      setSavedMedia(Object.fromEntries(((data || []) as SavedMedia[]).map((item) => [item.slot_key, item])));
    }
    setLoading(false);
  };

  useEffect(() => { void loadMedia(); }, []);

  const upload = async (slot: WebsiteMediaSlot, file?: File) => {
    if (!file) return;
    const extension = fileExtension(file);
    if (!extension) {
      toast({ title: "Unsupported image", description: "Use a JPEG, PNG, WebP, or AVIF image.", variant: "destructive" });
      return;
    }
    if (file.size > 30 * 1024 * 1024) {
      toast({ title: "Image is too large", description: "The maximum upload size is 30 MB.", variant: "destructive" });
      return;
    }
    if (slot.kind === "panorama" && !(await checkPanoramaRatio(file))) {
      toast({ title: "Choose a 360 panorama", description: "360 images need an equirectangular, approximately 2:1 aspect ratio.", variant: "destructive" });
      return;
    }

    setUploading(slot.key);
    const oldItem = savedMedia[slot.key];
    const path = `${slot.key}/${crypto.randomUUID()}.${extension}`;
    const { error: uploadError } = await supabase.storage
      .from("website-media")
      .upload(path, file, { cacheControl: "3600", contentType: file.type, upsert: false });

    if (uploadError) {
      setUploading(null);
      toast({ title: "Upload failed", description: uploadError.message, variant: "destructive" });
      return;
    }

    const publicUrl = supabase.storage.from("website-media").getPublicUrl(path).data.publicUrl;
    const versionedUrl = `${publicUrl}${publicUrl.includes("?") ? "&" : "?"}v=${Date.now()}`;
    const { error: saveError } = await supabase.from("fg_site_media").upsert({
      slot_key: slot.key,
      label: slot.label,
      public_url: versionedUrl,
      storage_path: path,
      updated_by: user?.id ?? null,
    }, { onConflict: "slot_key" });

    if (saveError) {
      await supabase.storage.from("website-media").remove([path]);
      setUploading(null);
      toast({ title: "Image was uploaded but not published", description: saveError.message, variant: "destructive" });
      return;
    }

    if (oldItem?.storage_path) {
      await supabase.storage.from("website-media").remove([oldItem.storage_path]);
    }
    setSavedMedia((current) => ({
      ...current,
      [slot.key]: { slot_key: slot.key, label: slot.label, public_url: versionedUrl, storage_path: path },
    }));
    setUploading(null);
    toast({ title: "Website image updated", description: `${slot.label} is now live.` });
  };

  return (
    <div className="space-y-6 p-6 lg:p-8">
      <header>
        <h1 className="font-bebas text-4xl text-foreground">WEBSITE IMAGES</h1>
        <p className="font-barlow text-sm text-muted-foreground">Replace images used across the homepage, room cards, room galleries, booking page, and virtual tour.</p>
      </header>

      {loadError && <p role="alert" className="border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">{loadError}</p>}
      {loading ? (
        <div className="flex items-center gap-2 text-muted-foreground"><LoaderCircle className="h-4 w-4 animate-spin" /> Loading website images</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {websiteMediaSlots.map((slot) => {
            const image = savedMedia[slot.key]?.public_url || slot.fallback;
            const busy = uploading === slot.key;
            return (
              <section key={slot.key} className="min-w-0 border border-border bg-card">
                <img src={image} alt={slot.label} className="aspect-video w-full bg-muted object-cover" />
                <div className="space-y-3 p-4">
                  <div>
                    <h2 className="font-barlow text-sm font-semibold text-foreground">{slot.label}</h2>
                    <p className="mt-1 font-mono text-[11px] text-muted-foreground">{slot.kind === "panorama" ? "360 panorama · 2:1 image" : "Website image"}</p>
                  </div>
                  <label className="inline-flex min-h-10 cursor-pointer items-center gap-2 border border-border px-3 text-sm text-foreground transition-colors hover:border-primary hover:text-primary">
                    {busy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
                    {busy ? "Uploading…" : "Replace image"}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/avif"
                      className="sr-only"
                      aria-label={`Replace ${slot.label}`}
                      disabled={Boolean(uploading)}
                      onChange={(event) => {
                        const file = event.currentTarget.files?.[0];
                        event.currentTarget.value = "";
                        void upload(slot, file);
                      }}
                    />
                  </label>
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminMedia;
