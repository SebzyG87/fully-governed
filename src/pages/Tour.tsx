import { motion } from "framer-motion";
import { Mic, Camera, Users, Wifi, Monitor, Headphones } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import heroStudio from "@/assets/hero-studio.jpg";
import roomContent from "@/assets/room-content.jpg";
import roomMulti from "@/assets/room-multi.jpg";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { View } from "lucide-react";

const rooms = [
  {
    name: "Recording Studio",
    image: heroStudio,
    color: "border-room-studio",
    features: [
      { icon: Mic, label: "Professional vocal booth" },
      { icon: Headphones, label: "Industry-standard monitors" },
      { icon: Monitor, label: "Full Logic Pro / FL Studio setup" },
      { icon: Wifi, label: "High-speed Wi-Fi" },
    ],
    description: "Room 1B — Our flagship recording space. Black and gold aesthetic with cloud ceiling, full acoustic treatment, MLV soundproofing, and red royal seating. Equipped with Neumann TLM 103, Apollo Twin, and KRK studio monitors. Professional and premium from the moment you walk in.",
  },
  {
    name: "Multi-Use Room",
    image: roomMulti,
    color: "border-room-multi",
    features: [
      { icon: Users, label: "Capacity for 20+ guests" },
      { icon: Mic, label: "Live performance ready" },
      { icon: Monitor, label: "Projector & screen" },
      { icon: Headphones, label: "PA system" },
    ],
    description: "Room 1A — Our editing suite and multi-purpose space. Post-production, video editing, animation, podcast recording, interviews, workshops, listening parties, and private events. Configure it however you need.",
  },
  {
    name: "Content Creation Centre",
    subBrand: "Fully Governed Media",
    image: roomContent,
    color: "border-room-content",
    features: [
      { icon: Camera, label: "Green screen & lighting rigs" },
      { icon: Monitor, label: "4K camera setup" },
      { icon: Mic, label: "Podcast-ready audio" },
      { icon: Wifi, label: "Streaming capable" },
    ],
    description: "Room 2 — Fully Governed Media content creation centre. Green screen, 4K camera, lighting rigs, streaming setup, photography, TikTok and YouTube content. Everything for professional digital content.",
  },
];

const Tour = () => {
  const [showViewer, setShowViewer] = useState(false);
  const [activeRoom, setActiveRoom] = useState<typeof rooms[0] | null>(null);

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navbar />
      <div className="grain-overlay" />
      <div className="container pt-24 pb-16 space-y-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <p className="font-mono text-xs tracking-[0.3em] text-primary mb-2 uppercase">Explore the Space</p>
          <h1 className="font-bebas text-5xl md:text-7xl text-foreground tracking-wider">VIRTUAL TOUR</h1>
          <p className="text-muted-foreground font-barlow mt-2 max-w-xl mx-auto">
            Three purpose-built rooms in the heart of Lewisham. Explore what each space has to offer.
          </p>
        </motion.div>

        {rooms.map((room, i) => (
          <motion.div
            key={room.name}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className={`grid grid-cols-1 lg:grid-cols-2 gap-8 items-center ${i % 2 === 1 ? "lg:flex-row-reverse" : ""}`}
          >
            <div className={`relative group ${i % 2 === 1 ? "lg:order-2" : ""}`}>
              <img src={room.image} alt={room.name} className={`w-full rounded-lg border-2 ${room.color} object-cover aspect-video`} />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                <Button
                  onClick={() => { setActiveRoom(room); setShowViewer(true); }}
                  className="font-bebas tracking-wider"
                >
                  <View className="w-4 h-4 mr-2" /> ENTER 360° VIEW
                </Button>
              </div>
            </div>
            <div className={i % 2 === 1 ? "lg:order-1" : ""}>
              <h2 className="font-bebas text-3xl md:text-4xl text-foreground tracking-wider mb-1">{room.name.toUpperCase()}</h2>
              {room.subBrand && (
                <p className="text-primary font-mono text-[10px] uppercase tracking-[0.2em] mb-4">{room.subBrand}</p>
              )}
              <p className="text-muted-foreground font-barlow mb-6">{room.description}</p>
              <div className="grid grid-cols-2 gap-3">
                {room.features.map((f) => (
                  <div key={f.label} className="flex items-center gap-2 text-sm">
                    <f.icon className="w-4 h-4 text-primary flex-shrink-0" />
                    <span className="text-muted-foreground font-mono text-xs">{f.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      <Footer />

      {/* 360 Viewer Dialog Placeholder */}
      <Dialog open={showViewer} onOpenChange={setShowViewer}>
        <DialogContent className="max-w-4xl bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bebas tracking-wider text-foreground">
              {activeRoom?.name} — 360° TOUR
            </DialogTitle>
            <DialogDescription className="text-muted-foreground font-barlow">
              Explore the {activeRoom?.name.toLowerCase()} in full 360 degrees.
            </DialogDescription>
          </DialogHeader>
          <div className="w-full aspect-video bg-black rounded-lg flex items-center justify-center relative overflow-hidden group">
            <div className="absolute inset-0 opacity-20 blur-sm">
              {activeRoom && <img src={activeRoom.image} className="w-full h-full object-cover" alt="" />}
            </div>
            <div className="text-center relative z-10 z-20">
              <View className="w-12 h-12 text-primary mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground font-mono text-sm max-w-sm mx-auto">
                [Pannellum / 360° Viewer Component ready for integration once client's panoramic photos are provided]
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Tour;
