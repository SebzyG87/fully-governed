import { useQuery } from "@tanstack/react-query";
import { isSupabaseConfigured, supabase } from "@/integrations/supabase/client";
import { roomGalleryDefaults, type RoomGalleryKey } from "@/lib/websiteMedia";

export interface RoomGalleryContent {
  title: string;
  description: string;
}

export const useRoomGalleryContent = (roomKey: RoomGalleryKey): RoomGalleryContent => {
  const fallback = roomGalleryDefaults[roomKey];
  const { data } = useQuery({
    queryKey: ["room-gallery-content", roomKey],
    enabled: isSupabaseConfigured,
    staleTime: 60_000,
    retry: false,
    queryFn: async () => {
      const { data: content, error } = await (supabase as any)
        .from("fg_room_gallery_content")
        .select("title, description")
        .eq("room_key", roomKey)
        .maybeSingle();
      if (error) return null;
      return content as RoomGalleryContent | null;
    },
  });

  return {
    title: data?.title || fallback.title,
    description: data?.description || fallback.description,
  };
};
