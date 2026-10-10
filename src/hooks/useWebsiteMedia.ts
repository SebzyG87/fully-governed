import { useQuery } from "@tanstack/react-query";
import { isSupabaseConfigured, supabase } from "@/integrations/supabase/client";

export const useWebsiteMedia = (slotKey: string, fallback: string) => {
  const { data } = useQuery({
    queryKey: ["website-media", slotKey],
    enabled: isSupabaseConfigured,
    staleTime: 60_000,
    retry: false,
    queryFn: async () => {
      const { data: media, error } = await supabase
        .from("fg_site_media")
        .select("public_url")
        .eq("slot_key", slotKey)
        .maybeSingle();
      if (error) return null;
      return media?.public_url ?? null;
    },
  });

  return data || fallback;
};
