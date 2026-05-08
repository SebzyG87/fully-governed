import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Crown, Music, Video, MessageSquare, Star, ExternalLink, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

interface QRCode {
  id: string;
  user_id: string;
  code_slug: string;
  content_type: string;
  content_title: string;
  content_description: string | null;
  file_url: string | null;
  scan_count: number;
}

const TYPE_ICONS = {
  track: Music,
  video: Video,
  message: MessageSquare,
  exclusive: Star,
};

const TYPE_LABELS = {
  track: "Track Drop",
  video: "Exclusive Video",
  message: "Personal Message",
  exclusive: "Exclusive Content",
};

const Unlock = () => {
  const { code } = useParams<{ code: string }>();
  const [content, setContent] = useState<QRCode | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!code) return;
    const fetchAndRecord = async () => {
      const { data } = await supabase
        .from("fg_qr_codes")
        .select("*")
        .eq("code_slug", code)
        .limit(1)
        .maybeSingle();

      if (!data) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setContent(data);
      setLoading(false);

      // Increment scan count
      await supabase
        .from("fg_qr_codes")
        .update({ scan_count: (data.scan_count ?? 0) + 1 })
        .eq("id", data.id);
    };

    fetchAndRecord();
  }, [code]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (notFound || !content) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6 px-4 text-center">
        <Crown className="w-12 h-12 text-primary/30" />
        <h1 className="font-bebas text-4xl tracking-wider text-foreground">CODE NOT FOUND</h1>
        <p className="text-muted-foreground font-barlow max-w-sm">
          This QR code doesn't match any unlock in our system. Check that you scanned the code correctly, or contact the artist directly.
        </p>
        <a href="/" className="font-bebas text-primary tracking-wider hover:underline">BACK TO FULLY GOVERNED</a>
      </div>
    );
  }

  const Icon = TYPE_ICONS[content.content_type as keyof typeof TYPE_ICONS] ?? Star;
  const typeLabel = TYPE_LABELS[content.content_type as keyof typeof TYPE_LABELS] ?? "Content";

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-16">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Crown className="w-5 h-5 text-primary" />
            <span className="font-mono text-xs tracking-[0.3em] text-primary uppercase">Fully Governed</span>
          </div>
          <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest">You've unlocked</p>
        </div>

        {/* Content card */}
        <div className="bg-card border border-primary/30 rounded-2xl overflow-hidden shadow-[0_0_40px_rgba(212,175,55,0.1)]">
          {/* Gold accent bar */}
          <div className="h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />

          <div className="p-8 text-center space-y-6">
            {/* Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-20 h-20 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center mx-auto"
            >
              <Icon className="w-10 h-10 text-primary" />
            </motion.div>

            {/* Type badge */}
            <span className="inline-block font-mono text-xs text-primary bg-primary/10 border border-primary/20 px-3 py-1 rounded-full uppercase tracking-widest">
              {typeLabel}
            </span>

            {/* Title */}
            <h1 className="font-bebas text-3xl md:text-4xl tracking-wider text-foreground leading-tight">
              {content.content_title}
            </h1>

            {/* Description */}
            {content.content_description && (
              <p className="text-muted-foreground font-barlow text-sm leading-relaxed max-w-sm mx-auto">
                {content.content_description}
              </p>
            )}

            {/* CTA */}
            {content.file_url && (
              <Button
                asChild
                size="lg"
                className="font-bebas text-lg tracking-wider w-full py-6"
              >
                <a href={content.file_url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-5 h-5 mr-2" />
                  {content.content_type === "track" ? "PLAY TRACK" :
                   content.content_type === "video" ? "WATCH VIDEO" :
                   "OPEN CONTENT"}
                </a>
              </Button>
            )}

            {!content.file_url && (
              <div className="bg-primary/5 border border-primary/10 rounded-lg p-4">
                <p className="font-barlow text-sm text-muted-foreground">
                  Content coming soon — check back or follow the artist for updates.
                </p>
              </div>
            )}
          </div>

          <div className="h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />
        </div>

        {/* Footer */}
        <p className="text-center font-mono text-xs text-muted-foreground mt-6 tracking-widest">
          POWERED BY FULLY GOVERNED · LEWISHAM, SE
        </p>
      </motion.div>
    </div>
  );
};

export default Unlock;
