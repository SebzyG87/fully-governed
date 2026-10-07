import { useRef, useState } from "react";
import { RotateCcw, ZoomIn, ZoomOut, Maximize2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";

const PANORAMAS = [
  {
    slug: "podcast-room",
    label: "Podcast / Multi-use Room",
    image: "/tours/studio/podcast-room-preview.jpg",
    note: "Preview panorama. Production rollout should replace this with tiled multiresolution assets.",
  },
];

export default function Tour360() {
  const [activeSlug, setActiveSlug] = useState(PANORAMAS[0].slug);
  const [x, setX] = useState(50);
  const [y, setY] = useState(48);
  const [zoom, setZoom] = useState(150);
  const dragRef = useRef<{ x: number; y: number; startX: number; startY: number } | null>(null);
  const active = PANORAMAS.find((item) => item.slug === activeSlug) ?? PANORAMAS[0];

  const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

  const resetView = () => {
    setX(50);
    setY(48);
    setZoom(150);
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navbar />
      <main className="pt-16">
        <section className="border-b border-border bg-card/40">
          <div className="container flex flex-col gap-4 py-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.25em] text-primary">360 studio tour</p>
              <h1 className="font-bebas text-4xl tracking-wide text-foreground">EXPLORE THE ROOMS</h1>
            </div>
            <div className="flex flex-wrap gap-2">
              {PANORAMAS.map((pano) => (
                <Button
                  key={pano.slug}
                  type="button"
                  variant={pano.slug === activeSlug ? "default" : "outline"}
                  className="font-bebas tracking-wide"
                  onClick={() => {
                    setActiveSlug(pano.slug);
                    resetView();
                  }}
                >
                  {pano.label}
                </Button>
              ))}
            </div>
          </div>
        </section>

        <section className="relative h-[calc(100vh-8rem)] min-h-[34rem] overflow-hidden bg-black">
          <div
            role="img"
            aria-label={`${active.label} 360 preview`}
            className="h-full w-full cursor-grab select-none bg-cover bg-center active:cursor-grabbing"
            style={{
              backgroundImage: `url(${active.image})`,
              backgroundPosition: `${x}% ${y}%`,
              backgroundSize: `${zoom}% auto`,
            }}
            onPointerDown={(event) => {
              event.currentTarget.setPointerCapture(event.pointerId);
              dragRef.current = { x: event.clientX, y: event.clientY, startX: x, startY: y };
            }}
            onPointerMove={(event) => {
              if (!dragRef.current) return;
              const dx = event.clientX - dragRef.current.x;
              const dy = event.clientY - dragRef.current.y;
              setX((((dragRef.current.startX - dx * 0.08) % 100) + 100) % 100);
              setY(clamp(dragRef.current.startY + dy * 0.08, 25, 75));
            }}
            onPointerUp={() => { dragRef.current = null; }}
            onPointerCancel={() => { dragRef.current = null; }}
          />

          <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/70 to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/80 to-transparent" />

          <div className="absolute left-4 right-4 top-4 flex flex-col gap-3 sm:left-6 sm:right-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="rounded-md border border-white/15 bg-black/45 p-3 backdrop-blur">
              <h2 className="font-bebas text-2xl tracking-wide text-white">{active.label}</h2>
              <p className="text-xs text-white/70">{active.note}</p>
            </div>
            <div className="flex gap-2">
              <Button type="button" size="icon" variant="outline" className="bg-black/45 text-white" onClick={() => setZoom((value) => clamp(value + 20, 120, 240))} aria-label="Zoom in">
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button type="button" size="icon" variant="outline" className="bg-black/45 text-white" onClick={() => setZoom((value) => clamp(value - 20, 120, 240))} aria-label="Zoom out">
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button type="button" size="icon" variant="outline" className="bg-black/45 text-white" onClick={resetView} aria-label="Reset view">
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button type="button" size="icon" variant="outline" className="bg-black/45 text-white" onClick={() => document.documentElement.requestFullscreen?.()} aria-label="Fullscreen">
                <Maximize2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="absolute bottom-5 left-1/2 w-[min(32rem,calc(100%-2rem))] -translate-x-1/2 rounded-md border border-white/15 bg-black/55 p-3 text-center text-xs text-white/75 backdrop-blur">
            Drag to look around. Use zoom controls for detail. Production 360 should use tiled delivery for faster mobile loading.
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
