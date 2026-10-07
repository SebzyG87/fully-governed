import { lazy, Suspense, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Images, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const PanoramaViewer = lazy(() => import("@/components/PanoramaViewer").then((module) => ({ default: module.PanoramaViewer })));

interface RoomGalleryModalProps {
  roomName: string;
}

const GalleryModal = ({ roomName, onClose, images }: { roomName: string; onClose: () => void; images: string[] }) => {
  const [current, setCurrent] = useState(0);
  const [view, setView] = useState<"360" | "photo">("360");
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
          className="relative w-full max-w-6xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bebas text-2xl text-white tracking-wider">{roomName} GALLERY</h2>
            <div className="flex items-center gap-4">
              <div className="flex rounded-sm border border-white/20 p-0.5" role="group" aria-label="Gallery view">
                <button type="button" aria-pressed={view === "360"} onClick={() => setView("360")} className={`px-3 py-1.5 text-sm ${view === "360" ? "bg-primary text-primary-foreground" : "text-white/75 hover:text-white"}`}>360° TOUR</button>
                <button type="button" aria-pressed={view === "photo"} onClick={() => setView("photo")} className={`px-3 py-1.5 text-sm ${view === "photo" ? "bg-primary text-primary-foreground" : "text-white/75 hover:text-white"}`}>PHOTO</button>
              </div>
              <button onClick={onClose} className="text-white/70 hover:text-white transition-colors" aria-label="Close gallery">
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="relative h-[min(68vh,680px)] min-h-[300px] bg-black border border-border rounded-lg overflow-hidden">
            {view === "360" ? (
              <Suspense fallback={<div className="h-full w-full animate-pulse bg-muted" />}>
                <PanoramaViewer key={images[current]} src={images[current]} label={roomName} />
              </Suspense>
            ) : (
              <img src={images[current]} alt={`${roomName}, photo ${current + 1}`} className="h-full w-full object-contain" />
            )}
            <span className="absolute bottom-3 left-3 rounded-sm bg-black/70 px-2 py-1 font-mono text-xs text-white">{current + 1} / {total}</span>
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

export const RoomViewButtons = ({ roomName }: RoomGalleryModalProps) => {
  const [galleryOpen, setGalleryOpen] = useState(false);
  const name = roomName.toLowerCase();
  const images = name.includes("recording")
    ? ["recording-room-01.jpeg", "recording-room-02.jpeg"]
    : ["multi-use-room-01.jpeg", "multi-use-room-02.jpeg"];
  const imagePaths = images.map((image) => `/images/rooms/360/${image}`);
  const tourRoom = name.includes("recording") ? "recording" : "multi-use";

  return (
    <>
      <div className="flex flex-wrap gap-3 justify-center">
        <Button variant="outline" className="font-bebas tracking-wider" onClick={() => setGalleryOpen(true)}>
          <Images className="w-4 h-4 mr-2" /> ROOM PHOTOS
        </Button>
        <Button asChild className="font-bebas tracking-wider">
          <Link to={`/360-tour?room=${tourRoom}`}>OPEN 360° TOUR</Link>
        </Button>
      </div>
      {galleryOpen && (
        <GalleryModal roomName={roomName} images={imagePaths} onClose={() => setGalleryOpen(false)} />
      )}
    </>
  );
};
