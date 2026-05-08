import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Images, Box } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RoomGalleryModalProps {
  roomName: string;
  placeholderCount?: number;
}

const GalleryModal = ({ roomName, onClose }: { roomName: string; onClose: () => void }) => {
  const [current, setCurrent] = useState(0);
  const total = 6;

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
            <h2 className="font-bebas text-2xl text-white tracking-wider">{roomName} — GALLERY</h2>
            <button onClick={onClose} className="text-white/70 hover:text-white transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="relative aspect-video bg-card border border-border rounded-lg overflow-hidden flex items-center justify-center">
            <div className="text-center space-y-3 px-8">
              <Images className="w-12 h-12 text-primary/40 mx-auto" />
              <p className="font-bebas text-xl text-foreground tracking-wider">PHOTO {current + 1} OF {total}</p>
              <p className="text-sm text-muted-foreground font-barlow">
                Real room photos coming soon — Seb to provide hi-res images.
              </p>
            </div>
            <button
              onClick={() => setCurrent((c) => (c - 1 + total) % total)}
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white rounded-full p-2 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setCurrent((c) => (c + 1) % total)}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white rounded-full p-2 transition-colors"
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
              />
            ))}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const View3DModal = ({ roomName, onClose }: { roomName: string; onClose: () => void }) => (
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
        className="relative w-full max-w-lg bg-card border border-border rounded-lg p-8 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors">
          <X className="w-5 h-5" />
        </button>
        <Box className="w-16 h-16 text-primary/60 mx-auto mb-4" />
        <h2 className="font-bebas text-3xl text-foreground tracking-wider mb-2">{roomName}</h2>
        <p className="font-bebas text-xl text-primary tracking-wider mb-4">3D VIEW COMING SOON</p>
        <p className="text-sm text-muted-foreground font-barlow">
          Immersive 3D room files are being prepared with Marble Studio Labs.
          Check back soon for a full walkthrough of this space.
        </p>
      </motion.div>
    </motion.div>
  </AnimatePresence>
);

export const RoomViewButtons = ({ roomName }: RoomGalleryModalProps) => {
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [view3DOpen, setView3DOpen] = useState(false);

  return (
    <>
      <div className="flex gap-3 justify-center">
        <Button variant="outline" className="font-bebas tracking-wider" onClick={() => setGalleryOpen(true)}>
          <Images className="w-4 h-4 mr-2" /> VIEW GALLERY
        </Button>
        <Button variant="outline" className="font-bebas tracking-wider" onClick={() => setView3DOpen(true)}>
          <Box className="w-4 h-4 mr-2" /> VIEW IN 3D
        </Button>
      </div>
      {galleryOpen && <GalleryModal roomName={roomName} onClose={() => setGalleryOpen(false)} />}
      {view3DOpen && <View3DModal roomName={roomName} onClose={() => setView3DOpen(false)} />}
    </>
  );
};
