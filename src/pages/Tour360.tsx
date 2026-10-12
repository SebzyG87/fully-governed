import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { PanoramaViewer } from "@/components/PanoramaViewer";
import { useSearchParams } from "react-router-dom";
import { useWebsiteMedia } from "@/hooks/useWebsiteMedia";
import { useRoomGalleryContent, type RoomGalleryContent } from "@/hooks/useRoomGalleryContent";
import { roomGalleryDefaults, type RoomGalleryKey } from "@/lib/websiteMedia";

type GalleryRoom = { slug: RoomGalleryKey | "podcast"; image: string; mediaKey: string };

const podcastContent: RoomGalleryContent = {
  title: "Podcast Room",
  description: "Explore the podcast room, with its sofa seating and recording setup.",
};

const rooms: GalleryRoom[] = [
  { slug: "recording", image: "/images/rooms/360/recording-room-01.jpeg", mediaKey: "room.recording.panorama.1" },
  { slug: "multi-use", image: "/images/rooms/360/multi-use-room-01.jpeg", mediaKey: "room.multi-use.panorama.1" },
  { slug: "content", image: "/images/rooms/360/production-workshop.jpeg", mediaKey: "room.content.panorama.1" },
  { slug: "podcast", image: "/images/rooms/360/podcast-room-01.jpeg", mediaKey: "room.podcast.panorama.1" },
];

function ManagedRoomGallery({ room }: { room: GalleryRoom & { slug: RoomGalleryKey } }) {
  const content = useRoomGalleryContent(room.slug);
  return <RoomGallery room={room} content={content} />;
}

function RoomGallery({ room, content }: { room: GalleryRoom; content: RoomGalleryContent }) {
  const image = useWebsiteMedia(room.mediaKey, room.image);

  return (
    <section id={room.slug} aria-labelledby={`${room.slug}-title`} className="scroll-mt-20 border-b border-border py-8 sm:py-12">
      <div className="container">
        <h2 id={`${room.slug}-title`} className="font-bebas text-3xl tracking-wide text-foreground sm:text-4xl">{content.title}</h2>
        <p className="mt-2 max-w-3xl text-base text-muted-foreground">{content.description}</p>
        <h3 className="mt-6 font-bebas text-2xl tracking-wide text-foreground">INTERACTIVE 360° VIEW</h3>
        <p className="mb-3 mt-1 text-base text-muted-foreground">Drag to look around. On a phone, swipe across the image to explore the room.</p>
        <div className="overflow-hidden rounded-sm border border-border bg-black">
          <PanoramaViewer src={image} label={content.title} />
        </div>
        <figure className="mt-8">
          <figcaption className="mb-3">
            <h3 className="font-bebas text-2xl tracking-wide text-foreground">FLAT PHOTO VIEW</h3>
            <p className="mt-1 text-base text-muted-foreground">The same room image shown flat, so you can see the whole panorama at once.</p>
          </figcaption>
          <img src={image} alt={`${content.title} — full panorama displayed as a flat photo`} loading="lazy" decoding="async" width={2048} height={1024} className="block h-auto w-full rounded-sm border border-border" />
        </figure>
      </div>
    </section>
  );
}

export default function Tour360() {
  const [searchParams] = useSearchParams();
  const linkedRoom = searchParams.get("room");

  useEffect(() => {
    // Keep existing booking and room-page links pointing to the requested room.
    const initialHash = window.location.hash;
    const targetRoom = initialHash.slice(1) || linkedRoom;
    if (!targetRoom || !rooms.some((room) => room.slug === targetRoom)) return;

    let cancelled = false;
    let frame = 0;
    // Wait for fonts so the room heading stays below the fixed navigation.
    void Promise.resolve(document.fonts?.ready).then(() => {
      frame = requestAnimationFrame(() => {
        if (!cancelled && window.location.hash === initialHash) {
          document.getElementById(targetRoom)?.scrollIntoView({ block: "start" });
        }
      });
    });
    return () => { cancelled = true; cancelAnimationFrame(frame); };
  }, [linkedRoom]);

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navbar />
      <main className="pt-16">
        <header className="border-b border-border bg-card/40">
          <div className="container py-8 sm:py-10">
            <p className="font-mono text-sm uppercase text-primary">Fully Governed Studios</p>
            <h1 className="mt-2 font-bebas text-4xl tracking-wide text-foreground sm:text-5xl">EXPLORE OUR FOUR ROOMS</h1>
            <p className="mt-3 max-w-3xl text-lg text-muted-foreground">Scroll to see every room, with an interactive 360° view and a flat photo underneath. Or jump straight to a room below.</p>
            <nav aria-label="Jump to a room" className="mt-6 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
              {rooms.map((room) => (
                <a key={room.slug} href={`#${room.slug}`} className="flex min-h-16 items-center justify-between gap-3 rounded-sm border-2 border-primary bg-primary/10 px-4 py-3 font-bebas text-xl tracking-wide text-foreground hover:bg-primary hover:text-primary-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">
                  {room.slug === "podcast" ? podcastContent.title : roomGalleryDefaults[room.slug].title}
                  <span aria-hidden="true">↓</span>
                </a>
              ))}
            </nav>
          </div>
        </header>
        {rooms.map((room) => room.slug === "podcast"
          ? <RoomGallery key={room.slug} room={room} content={podcastContent} />
          : <ManagedRoomGallery key={room.slug} room={{ ...room, slug: room.slug }} />
        )}
      </main>
      <Footer />
    </div>
  );
}
