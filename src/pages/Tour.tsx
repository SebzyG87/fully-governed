import { motion } from "framer-motion";
import { Mic, Camera, Users, Wifi, Monitor, Headphones } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";

const rooms = [
  {
    slug: "recording",
    name: "Recording Studio",
    image: "/images/rooms/360/recording-room-01.jpeg",
    color: "border-room-studio",
    features: [
      { icon: Mic, label: "Music recording room" },
      { icon: Headphones, label: "Engineer available as an add-on" },
      { icon: Monitor, label: "Equipment confirmed before booking" },
      { icon: Wifi, label: "Session setup agreed with the studio" },
    ],
    description: "Room 1B is the Fully Governed music recording room. Contact the studio to confirm the equipment and engineer needed for your session.",
  },
  {
    slug: "multi-use",
    name: "Multi-Use Room",
    image: "/images/rooms/360/multi-use-room-01.jpeg",
    color: "border-room-multi",
    features: [
      { icon: Users, label: "Multi-use room" },
      { icon: Mic, label: "Podcast audio-only hire" },
      { icon: Monitor, label: "Self-operated video room" },
      { icon: Headphones, label: "Production setup confirmed before booking" },
    ],
    description: "Room 1A — Our editing suite and multi-purpose space. Post-production, video editing, animation, podcast recording, interviews, workshops, listening parties, and private events. Configure it however you need.",
  },
  {
    slug: "content-centre",
    name: "Content Creation Centre",
    subBrand: "Fully Governed Media",
    image: "/images/rooms/360/content-room-01.jpeg",
    color: "border-room-content",
    features: [
      { icon: Camera, label: "Stream Room dry hire" },
      { icon: Monitor, label: "Self-operated production" },
      { icon: Mic, label: "Setup confirmed with the studio" },
      { icon: Wifi, label: "Internet radio and content enquiries" },
    ],
    description: "Room 2 is Fully Governed Media's content creation centre. Contact the studio to confirm the equipment and setup available for your session.",
  },
];

const Tour = () => {
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
                <Link to={`/360-tour?room=${room.slug}`} className="inline-flex items-center rounded-sm bg-primary px-4 py-2 font-bebas tracking-wider text-primary-foreground">
                  ENTER 360° VIEW
                </Link>
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

    </div>
  );
};

export default Tour;
