import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Images, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RoomGalleryModalProps {
  roomName: string;
  placeholderCount?: number;
}

const GalleryModal = ({ roomName, onClose, total }: { roomName: string; onClose: () => void; total: number }) => {
  const [current, setCurrent] = useState(0);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="relative w-full max-w-3xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bebas text-2xl text-white tracking-wider">{roomName} GALLERY</h2>
            <button onClick={onClose} className="text-white/70 hover:text-white transition-colors" aria-label="Close gallery">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="relative aspect-video bg-card border border-border rounded-lg overflow-hidden flex items-center justify-center">
            <div className="text-center space-y-3 px-8">
              <Images className="w-12 h-12 text-primary/40 mx-auto" />
              <p className="font-bebas text-xl text-foreground tracking-wider">
                PHOTO {current + 1} OF {total}
              </p>
              <p className="text-sm text-muted-foreground font-barlow">
                Room media is being prepared. This gallery will use the final studio images when they are uploaded.
              </p>
            </div>
            <button
              onClick={() => setCurrent((c) => (c - 1 + total) % total)}
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white rounded-full p-2 transition-colors"
              aria-label="Previous photo"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setCurrent((c) => (c + 1) % total)}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white rounded-full p-2 transition-colors"
              aria-label="Next photo"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="flex gap-2 mt-4 justify-center">
            {Array.from({ length: total }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`w-2 h-2 rounded-full transition-colors ${i === current ? "bg-primary" : "bg-white/30"}`}
                aria-label={`View photo ${i + 1}`}
              />
            ))}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export const RoomViewButtons = ({ roomName, placeholderCount = 6 }: RoomGalleryModalProps) => {
  const [galleryOpen, setGalleryOpen] = useState(false);

  return (
    <>
      <div className="flex gap-3 justify-center">
        <Button variant="outline" className="font-bebas tracking-wider" onClick={() => setGalleryOpen(true)}>
          <Images className="w-4 h-4 mr-2" /> VIEW GALLERY
        </Button>
      </div>
      {galleryOpen && (
        <GalleryModal roomName={roomName} total={placeholderCount} onClose={() => setGalleryOpen(false)} />
      )}
    </>
  );
};
