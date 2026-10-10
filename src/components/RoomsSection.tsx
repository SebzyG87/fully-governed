import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { RoomViewButtons } from "@/components/RoomGalleryModal";
import { WebsiteImage } from "@/components/WebsiteImage";
import { studioRates } from "@/lib/studioRates";

interface PriceItem {
  label: string;
  price: string;
}

interface Room {
  id: string;
  name: string;
  subtitle: string;
  colorClass: string;
  borderClass: string;
  glowClass: string;
  image?: string;
  description: string;
  features: string[];
  pricing: PriceItem[];
  sessionTypes: string[];
}

const rooms: Room[] = [
  {
    id: "studio",
    name: "Room 1B",
    subtitle: "Recording Studio",
    colorClass: "room-gold",
    borderClass: "border-room-gold",
    glowClass: "glow-gold",
    image: "/images/rooms/360/recording-room-01.jpeg",
    mediaKey: "recording" as const,
    description:
      "Room 1B — Our flagship music recording space in Lewisham. Ask the studio to confirm equipment and engineer availability for your session.",
    features: [
      "Music recording dry hire",
      "Engineer available as an add-on",
      "Two-hour minimum booking",
      "Four-hour block preferred",
    ],
    pricing: [
      { label: "Music Studio dry hire", price: `£${studioRates.recordingHourly.toFixed(2)}/hr` },
      { label: "Annual rate", price: `£${studioRates.recordingAnnualHourly.toFixed(2)}/hr` },
      { label: "Engineer add-on", price: `£${studioRates.engineerAddOn} flat` },
    ],
    sessionTypes: [
      "Artist Recording + Engineer",
      "Dry Hire",
      "Label Artist",
      "Block Session",
      "Mastering",
      "Beat Session",
    ],
  },
  {
    id: "multi",
    name: "Room 1A",
    subtitle: "Multi-Use Room",
    colorClass: "room-red",
    borderClass: "border-room-red",
    glowClass: "glow-red",
    image: "/images/rooms/360/multi-use-room-01.jpeg",
    mediaKey: "multi-use" as const,
    description:
      "Room 1A — Our editing suite and multi-purpose space. Post-production, video editing, animation, podcast recording, interviews, workshops, listening parties, and private events. Configure it however you need.",
    features: [
      "Audio-only self-service podcast hire",
      "Self-operated video room hire",
      "Podcast production packages",
      "Setup confirmed before booking",
    ],
    pricing: [
      { label: "Podcast audio-only, self-service", price: `£${studioRates.podcastSelfServiceHourly.toFixed(2)}/hr` },
      { label: "Video room, self-operated", price: `£${studioRates.videoSelfOperatedHourly}/hr` },
      { label: "Managed podcast packages", price: `From £${studioRates.managedPodcastPerEpisodeFrom}/episode` },
    ],
    sessionTypes: [
      "Podcast",
      "Interview",
      "Gaming",
      "Meet & Greet",
      "Class",
      "Consultation",
    ],
  },
  {
    id: "content",
    name: "Room 2",
    subtitle: "Content Creation Centre",
    colorClass: "room-purple",
    borderClass: "border-room-purple",
    glowClass: "glow-purple",
    image: "/images/rooms/360/production-workshop.jpeg",
    mediaKey: "content" as const,
    description:
      "Room 2 — Fully Governed Media content creation centre. Book the Stream Room for self-operated production; confirm your required setup with the studio.",
    features: [
      "Stream Room dry hire",
      "Internet radio and production enquiries",
      "Equipment and access confirmed with the studio",
    ],
    pricing: [
      { label: "Stream Room dry hire", price: `£${studioRates.streamRoomHourly}/hr` },
      { label: "Engineer add-on", price: `£${studioRates.engineerAddOn} flat + room hire` },
      { label: "Managed production", price: "Request a quote" },
    ],
    sessionTypes: [
      "Video Shoot",
      "DJ/Boiler Room",
      "Film Set",
      "Photo Shoot",
      "Launch/Release",
      "Boxing Event",
      "Internet Radio",
      "Movie Night",
      "Group Interview",
      "Business Networking",
    ],
  },
];

const RoomCard = ({ room, index }: { room: Room; index: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6, delay: index * 0.15 }}
    className={`bg-card rounded-lg border ${room.borderClass} ${room.glowClass} overflow-hidden`}
  >
      {/* Room photo and gallery controls */}
    <div className={`relative ${room.image ? "h-64" : "min-h-32"} overflow-hidden`}>
      <WebsiteImage slotKey={`room.${room.mediaKey}.cover`} fallback={room.image} alt={`${room.subtitle} at Fully Governed`} className="h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
      <div className="absolute bottom-4 left-4">
        <p className={`font-mono text-xs tracking-widest ${room.colorClass} uppercase`}>
          {room.name}
        </p>
        <h3 className="font-bebas text-3xl text-foreground">{room.subtitle}</h3>
        {room.id === "content" && (
          <p className="text-primary font-mono text-[10px] uppercase tracking-[0.2em] mt-0.5">Fully Governed Media</p>
        )}
      </div>
    </div>

    {/* Content */}
    <div className="p-6">
      <p className="font-barlow text-sm text-muted-foreground mb-6 leading-relaxed">
        {room.description}
      </p>

      {/* Features */}
      <div className="mb-6">
        <h4 className="font-bebas text-lg text-foreground mb-3 tracking-wider">FEATURES</h4>
        <div className="flex flex-wrap gap-2">
          {room.features.map((f) => (
            <span
              key={f}
              className="font-mono text-xs bg-secondary text-secondary-foreground px-3 py-1 rounded-sm"
            >
              {f}
            </span>
          ))}
        </div>
      </div>

      {/* Pricing */}
      <div className="mb-6">
        <h4 className="font-bebas text-lg text-foreground mb-3 tracking-wider">PRICING</h4>
        <div className="space-y-2">
          {room.pricing.map((p) => (
            <div key={p.label} className="flex justify-between items-center">
              <span className="font-barlow text-sm text-muted-foreground">{p.label}</span>
              <span className={`font-mono text-sm font-bold ${room.colorClass}`}>{p.price}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Session types */}
      <div>
        <h4 className="font-bebas text-lg text-foreground mb-3 tracking-wider">SESSION TYPES</h4>
        <div className="flex flex-wrap gap-2">
          {room.sessionTypes.map((s) => (
            <span
              key={s}
              className={`font-barlow text-xs border ${room.borderClass} px-3 py-1 rounded-sm text-muted-foreground`}
            >
              {s}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-4">
        <RoomViewButtons roomName={room.subtitle} roomKey={room.mediaKey} showTourLink={false} galleryButtonLabel="VIEW 360° ROOM GALLERY" />
      </div>

      {/* Book CTA */}
      <div className="mt-4">
        <Link
          to="/book"
          className={`block text-center font-bebas text-lg tracking-wider py-3 rounded-sm border ${room.borderClass} ${room.colorClass} hover:shadow-[0_0_16px_hsl(var(--interactive))] hover:border-interactive hover:text-interactive transition-all animate-subtle-glow`}
        >
          BOOK THIS ROOM
        </Link>
      </div>
    </div>
  </motion.div>
);

const RoomsSection = () => {
  return (
    <section id="rooms" className="py-24 bg-background">
      <div className="container px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="font-mono text-xs tracking-[0.3em] text-primary mb-2 uppercase">
            Three Premium Spaces
          </p>
          <h2 className="font-bebas text-5xl md:text-7xl text-foreground tracking-wider">
            OUR ROOMS
          </h2>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <a href="#rooms" className="inline-flex min-h-11 items-center border border-border px-4 font-bebas tracking-wider text-foreground hover:border-primary hover:text-primary">BROWSE ROOM PHOTOS</a>
            <Link to="/360-tour?room=recording" className="inline-flex min-h-11 items-center bg-primary px-4 font-bebas tracking-wider text-primary-foreground hover:bg-primary/90">OPEN 360° ROOM TOUR</Link>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8" id="pricing">
          {rooms.map((room, i) => (
            <RoomCard key={room.id} room={room} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default RoomsSection;
