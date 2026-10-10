import { useEffect, useState } from "react";
import { ImagePlus, LoaderCircle, RotateCcw, Save, Trash2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { roomGalleryDefaults, websiteMediaSlots, type RoomGalleryKey, type WebsiteMediaSlot } from "@/lib/websiteMedia";
import type { RoomGalleryContent } from "@/hooks/useRoomGalleryContent";
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
  const queryClient = useQueryClient();
  const [savedMedia, setSavedMedia] = useState<Record<string, SavedMedia>>({});
  const [galleryContent, setGalleryContent] = useState<Record<RoomGalleryKey, RoomGalleryContent>>({ ...roomGalleryDefaults });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [uploading, setUploading] = useState<string | null>(null);
  const [savingRoom, setSavingRoom] = useState<RoomGalleryKey | null>(null);
  const [resettingImage, setResettingImage] = useState<string | null>(null);

  const loadMedia = async () => {
    const [{ data, error }, { data: roomRows, error: roomError }] = await Promise.all([
      supabase
      .from("fg_site_media")
      .select("slot_key, label, public_url, storage_path"),
      (supabase as any).from("fg_room_gallery_content").select("room_key, title, description"),
    ]);
    if (error) {
      setLoadError("Image management needs the website media database migration. The existing website images remain in place.");
    } else {
      setLoadError("");
      setSavedMedia(Object.fromEntries(((data || []) as SavedMedia[]).map((item) => [item.slot_key, item])));
    }
    if (!roomError) {
      setGalleryContent((current) => {
        const next = { ...roomGalleryDefaults, ...current };
        for (const row of roomRows || []) {
          if (row.room_key in roomGalleryDefaults) {
            next[row.room_key as RoomGalleryKey] = { title: row.title, description: row.description };
          }
        }
        return next;
      });
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
    await queryClient.invalidateQueries({ queryKey: ["website-media", slot.key] });
    setUploading(null);
    toast({ title: "Website image updated", description: `${slot.label} is now live.` });
  };

  const resetImage = async (slot: WebsiteMediaSlot) => {
    const existing = savedMedia[slot.key];
    if (!existing) return;
    setResettingImage(slot.key);
    const { error } = await supabase.from("fg_site_media").delete().eq("slot_key", slot.key);
    if (error) {
      setResettingImage(null);
      toast({ title: "Could not reset image", description: error.message, variant: "destructive" });
      return;
    }
    setSavedMedia((current) => {
      const next = { ...current };
      delete next[slot.key];
      return next;
    });
    await queryClient.invalidateQueries({ queryKey: ["website-media", slot.key] });
    const { error: storageError } = await supabase.storage.from("website-media").remove([existing.storage_path]);
    setResettingImage(null);
    toast({
      title: storageError ? "Image reset; uploaded file cleanup failed" : "Image reset to original",
      description: storageError ? storageError.message : `${slot.label} now uses its bundled image.`,
      variant: storageError ? "destructive" : "default",
    });
  };

  const saveGalleryContent = async (roomKey: RoomGalleryKey) => {
    const content = galleryContent[roomKey];
    const title = content.title.trim();
    const description = content.description.trim();
    if (!title || !description) {
      toast({ title: "Add a gallery name and description", variant: "destructive" });
      return;
    }
    setSavingRoom(roomKey);
    const { error } = await (supabase as any).from("fg_room_gallery_content").upsert({
      room_key: roomKey,
      title,
      description,
      updated_by: user?.id ?? null,
    }, { onConflict: "room_key" });
    setSavingRoom(null);
    if (error) {
      toast({ title: "Gallery details not saved", description: error.message, variant: "destructive" });
      return;
    }
    setGalleryContent((current) => ({ ...current, [roomKey]: { title, description } }));
    await queryClient.invalidateQueries({ queryKey: ["room-gallery-content", roomKey] });
    toast({ title: "Room gallery updated", description: "Booking and room-card wording has not changed." });
  };

  const resetGalleryContent = async (roomKey: RoomGalleryKey) => {
    const { error } = await (supabase as any).from("fg_room_gallery_content").delete().eq("room_key", roomKey);
    if (error) {
      toast({ title: "Could not restore gallery details", description: error.message, variant: "destructive" });
      return;
    }
    setGalleryContent((current) => ({ ...current, [roomKey]: { ...roomGalleryDefaults[roomKey] } }));
    await queryClient.invalidateQueries({ queryKey: ["room-gallery-content", roomKey] });
    toast({ title: "Default gallery details restored" });
  };

  return (
    <div className="space-y-6 p-6 lg:p-8">
      <header>
        <h1 className="font-bebas text-4xl text-foreground">WEBSITE IMAGES</h1>
        <p className="font-barlow text-sm text-muted-foreground">Manage the homepage and room photography used across home, booking, equipment, and tour pages. Removing an upload restores its original image.</p>
      </header>

      {loadError && <p role="alert" className="border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">{loadError}</p>}
      <section className="space-y-4 border-b border-border pb-6">
        <div>
          <h2 className="font-bebas text-2xl text-foreground">ROOM GALLERY DETAILS</h2>
          <p className="text-sm text-muted-foreground">These names and descriptions appear only in the photo galleries and 360° tour.</p>
        </div>
        <div className="grid gap-4 xl:grid-cols-3">
          {(Object.keys(roomGalleryDefaults) as RoomGalleryKey[]).map((roomKey) => {
            const content = galleryContent[roomKey];
            return (
              <section key={roomKey} className="space-y-3 border border-border bg-card p-4">
                <label className="block text-xs font-semibold uppercase text-muted-foreground" htmlFor={`gallery-title-${roomKey}`}>Gallery name</label>
                <input id={`gallery-title-${roomKey}`} value={content.title} onChange={(event) => setGalleryContent((current) => ({ ...current, [roomKey]: { ...current[roomKey], title: event.target.value } }))} maxLength={100} className="min-h-10 w-full border border-border bg-background px-3 text-sm text-foreground" />
                <label className="block text-xs font-semibold uppercase text-muted-foreground" htmlFor={`gallery-description-${roomKey}`}>Gallery description</label>
                <textarea id={`gallery-description-${roomKey}`} value={content.description} onChange={(event) => setGalleryContent((current) => ({ ...current, [roomKey]: { ...current[roomKey], description: event.target.value } }))} maxLength={500} rows={3} className="w-full resize-y border border-border bg-background px-3 py-2 text-sm text-foreground" />
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={() => void saveGalleryContent(roomKey)} disabled={savingRoom === roomKey} className="inline-flex min-h-10 items-center gap-2 bg-primary px-3 text-sm font-semibold text-primary-foreground disabled:opacity-60">
                    {savingRoom === roomKey ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save gallery details
                  </button>
                  <button type="button" onClick={() => void resetGalleryContent(roomKey)} className="inline-flex min-h-10 items-center gap-2 border border-border px-3 text-sm text-foreground hover:border-primary">
                    <RotateCcw className="h-4 w-4" /> Restore default
                  </button>
                </div>
              </section>
            );
          })}
        </div>
      </section>
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
                    <p className="mt-1 font-mono text-[11px] text-primary">{slot.page}</p>
                    <p className="mt-1 font-mono text-[11px] text-muted-foreground">{slot.kind === "panorama" ? "360 panorama · 2:1 image" : "Website image"}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <label className="inline-flex min-h-10 cursor-pointer items-center gap-2 border border-border px-3 text-sm text-foreground transition-colors hover:border-primary hover:text-primary">
                      {busy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
                      {busy ? "Uploading…" : "Upload / replace"}
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/avif"
                        className="sr-only"
                        aria-label={`Upload or replace ${slot.label}`}
                        disabled={Boolean(uploading) || Boolean(resettingImage)}
                        onChange={(event) => {
                          const file = event.currentTarget.files?.[0];
                          event.currentTarget.value = "";
                          void upload(slot, file);
                        }}
                      />
                    </label>
                    {savedMedia[slot.key] && (
                      <button type="button" onClick={() => void resetImage(slot)} disabled={Boolean(resettingImage)} className="inline-flex min-h-10 items-center gap-2 border border-destructive/50 px-3 text-sm text-destructive hover:bg-destructive/10 disabled:opacity-60">
                        {resettingImage === slot.key ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />} Remove upload
                      </button>
                    )}
                  </div>
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
