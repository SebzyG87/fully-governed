import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { PanoramaViewer } from "@/components/PanoramaViewer";
import { useSearchParams } from "react-router-dom";
import { useWebsiteMedia } from "@/hooks/useWebsiteMedia";

const panoramas = [
  { slug: "recording", label: "Room 1B · Recording Studio", image: "/images/rooms/360/recording-room-01.jpeg", mediaKey: "room.recording.panorama.1" },
  { slug: "multi-use", label: "Room 1A · Multi-Use Room", image: "/images/rooms/360/multi-use-room-01.jpeg", mediaKey: "room.multi-use.panorama.1" },
  { slug: "content", label: "Room 2 · Content Creation Centre", image: "/images/rooms/360/production-workshop.jpeg", mediaKey: "room.content.panorama.1" },
];

export default function Tour360() {
  const [searchParams, setSearchParams] = useSearchParams();
  const active = panoramas.find((item) => item.slug === searchParams.get("room")) ?? panoramas[0];
  const activeImage = useWebsiteMedia(active.mediaKey, active.image);

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navbar />
      <main className="pt-16">
        <header className="border-b border-border bg-card/40">
          <div className="container flex flex-col gap-4 py-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="font-mono text-xs uppercase text-primary">Fully Governed Studios</p>
              <h1 className="font-bebas text-4xl text-foreground">360° ROOM TOUR</h1>
            </div>
            <nav aria-label="Choose a room" className="flex flex-wrap gap-2">
              {panoramas.map((room) => (
                <button
                  key={room.slug}
                  type="button"
                  aria-pressed={room.slug === active.slug}
                  onClick={() => setSearchParams({ room: room.slug })}
                  className={`border px-3 py-2 font-bebas text-sm ${room.slug === active.slug ? "border-primary bg-primary text-primary-foreground" : "border-border text-foreground hover:border-primary"}`}
                >
                  {room.label}
                </button>
              ))}
            </nav>
          </div>
        </header>
        <section aria-label={`${active.label} interactive panorama`} className="w-full bg-black">
          <PanoramaViewer key={active.slug} src={activeImage} label={active.label} />
        </section>
      </main>
      <Footer />
    </div>
  );
}
