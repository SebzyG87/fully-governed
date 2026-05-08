import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import roomStudioImg from "@/assets/hero-studio.jpg";
import roomMultiImg from "@/assets/room-multi.jpg";
import roomContentImg from "@/assets/room-content.jpg";
import { RoomViewButtons } from "@/components/RoomGalleryModal";

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
  image: string;
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
    image: roomStudioImg,
    description:
      "Room 1B — Our flagship recording space. Black and gold aesthetic with cloud ceiling, full acoustic treatment, MLV soundproofing, and red royal seating. Equipped with Neumann TLM 103, Apollo Twin, and KRK studio monitors. Professional and premium from the moment you walk in.",
    features: [
      "Soundproofed vocal booth",
      "In-house engineers & producers",
      "Streaming equipment",
      "Video-recorded sessions",
      "Beats, stems & mix/master",
    ],
    pricing: [
      { label: "Artist + Engineer", price: "£30/hr" },
      { label: "Dry Hire (no engineer)", price: "£15/hr" },
      { label: "Label Artist + Engineer", price: "£20/hr" },
      { label: "Block 4hr Session", price: "£100" },
      { label: "Full Day", price: "£250" },
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
    image: roomMultiImg,
    description:
      "Room 1A — Our editing suite and multi-purpose space. Post-production, video editing, animation, podcast recording, interviews, workshops, listening parties, and private events. Configure it however you need.",
    features: [
      "AI camera for live streaming",
      'Xbox Series X + retro gaming',
      '65" TV + Fire Stick',
      "Coffee machine & kitchen area",
      "High-end comfy seating",
      "Board games, dominos, cards",
      "Free Wi-Fi",
    ],
    pricing: [
      { label: "Podcast/Interview Room", price: "£60/hr" },
      { label: "Block 4hr Promotional", price: "£200" },
      { label: "Full Day", price: "£450" },
      { label: "In-House Rate", price: "POA" },
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
    image: roomContentImg,
    description:
      "Room 2 — Fully Governed Media content creation centre. Green screen, 4K camera, lighting rigs, streaming setup, photography, TikTok and YouTube content. Everything for professional digital content.",
    features: [
      "Green room + white room rail system",
      "Gimbal mounted cameras",
      "DJ standalone system + speakers",
      "Radio broadcasting rig",
      "PS5 + latest games",
      '75" TV + bar area',
      "Mini pool table",
      "LED light strips & sofa bed",
      "24hr access + private entrance",
      "On-site caretaker/handyman",
    ],
    pricing: [
      { label: "Content Room Hire", price: "£75/hr" },
      { label: "Creator Dry Hire", price: "£40/hr" },
      { label: "In-House Project Rate", price: "POA" },
      { label: "Full Day / Events", price: "POA" },
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
    {/* Image */}
    <div className="relative h-64 overflow-hidden">
      <img
        src={room.image}
        alt={`${room.subtitle} at Fully Governed`}
        className="w-full h-full object-cover"
      />
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

      {/* Gallery + 3D view buttons */}
      <RoomViewButtons roomName={room.subtitle} />

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
