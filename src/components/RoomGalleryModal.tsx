import { lazy, Suspense, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Images, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const PanoramaViewer = lazy(() => import("@/components/PanoramaViewer").then((module) => ({ default: module.PanoramaViewer })));

interface RoomGalleryModalProps {
  roomName: string;
}

const GalleryModal = ({ roomName, onClose, images }: { roomName: string; onClose: () => void; images: string[] }) => {
  const [current, setCurrent] = useState(0);
  const [panoramaOpen, setPanoramaOpen] = useState(false);
  const total = images.length;

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

          <div className="relative aspect-video bg-card border border-border rounded-lg overflow-hidden">
            <img src={images[current]} alt={`${roomName}, panorama ${current + 1}`} className="h-full w-full object-cover" />
            <span className="absolute bottom-3 left-3 rounded-sm bg-black/70 px-2 py-1 font-mono text-xs text-white">{current + 1} / {total}</span>
            <button onClick={() => setPanoramaOpen(true)} className="absolute bottom-3 right-3 rounded-sm bg-black/75 px-3 py-2 text-sm text-white hover:bg-black" aria-label={`Explore ${roomName} in 360 degrees`}>Explore 360</button>
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
      <Dialog open={panoramaOpen} onOpenChange={setPanoramaOpen}>
        <DialogContent className="max-w-6xl border-border bg-background p-4 sm:p-6">
          <DialogHeader><DialogTitle className="font-bebas text-2xl">{roomName} 360°</DialogTitle></DialogHeader>
          <Suspense fallback={<div className="h-[min(72vh,760px)] min-h-[360px] w-full animate-pulse bg-muted" />}>
            <PanoramaViewer src={images[current]} label={roomName} />
          </Suspense>
        </DialogContent>
      </Dialog>
    </AnimatePresence>
  );
};

export const RoomViewButtons = ({ roomName }: RoomGalleryModalProps) => {
  const [galleryOpen, setGalleryOpen] = useState(false);
  const name = roomName.toLowerCase();
  const images = name.includes("recording")
    ? ["recording-room-01.jpeg", "recording-room-02.jpeg"]
    : name.includes("multi-use")
      ? ["multi-use-room-01.jpeg", "multi-use-room-02.jpeg"]
      : ["content-room-01.jpeg", "content-room-02.jpeg"];
  const imagePaths = images.map((image) => `/images/rooms/360/${image}`);

  return (
    <>
      <div className="flex gap-3 justify-center">
        <Button variant="outline" className="font-bebas tracking-wider" onClick={() => setGalleryOpen(true)}>
          <Images className="w-4 h-4 mr-2" /> VIEW PHOTOS
        </Button>
      </div>
      {galleryOpen && (
        <GalleryModal roomName={roomName} images={imagePaths} onClose={() => setGalleryOpen(false)} />
      )}
    </>
  );
};
