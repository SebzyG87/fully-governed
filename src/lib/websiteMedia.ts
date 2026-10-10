import heroStudio from "@/assets/hero-studio.jpg";

export interface WebsiteMediaSlot {
  key: string;
  label: string;
  kind: "image" | "panorama";
  fallback: string;
  page: string;
}

export const websiteMediaSlots: WebsiteMediaSlot[] = [
  { key: "home.hero", label: "Homepage hero", page: "Home", kind: "image", fallback: heroStudio },
  { key: "room.recording.cover", label: "Recording Studio cover", page: "Home, Book, Tours", kind: "image", fallback: "/images/rooms/360/recording-room-01.jpeg" },
  { key: "room.recording.panorama.1", label: "Recording Studio 360 image 1", page: "Room gallery", kind: "panorama", fallback: "/images/rooms/360/recording-room-01.jpeg" },
  { key: "room.recording.panorama.2", label: "Recording Studio 360 image 2", page: "Room gallery", kind: "panorama", fallback: "/images/rooms/360/recording-room-02.jpeg" },
  { key: "room.multi-use.cover", label: "Multi-Use Room cover", page: "Home, Book, Tours", kind: "image", fallback: "/images/rooms/360/multi-use-room-01.jpeg" },
  { key: "room.multi-use.panorama.1", label: "Multi-Use Room 360 image 1", page: "Room gallery", kind: "panorama", fallback: "/images/rooms/360/multi-use-room-01.jpeg" },
  { key: "room.multi-use.panorama.2", label: "Multi-Use Room 360 image 2", page: "Room gallery", kind: "panorama", fallback: "/images/rooms/360/multi-use-room-02.jpeg" },
  { key: "room.content.cover", label: "Content Creation Centre cover", page: "Home, Book, Tours, Equipment", kind: "image", fallback: "/images/rooms/360/production-workshop.jpeg" },
  { key: "room.content.panorama.1", label: "Production Workshop 360 image", page: "Room gallery", kind: "panorama", fallback: "/images/rooms/360/production-workshop.jpeg" },
];

export const roomGalleryDefaults = {
  recording: {
    title: "Room 1B · Recording Studio",
    description: "Look around the recording room and explore its studio setup.",
  },
  "multi-use": {
    title: "Room 1A · Multi-Use Room",
    description: "Explore the multi-use room in an interactive 360° view.",
  },
  content: {
    title: "Room 2 · Production Workshop",
    description: "Explore the production workshop and its creative work areas.",
  },
} as const;

export type RoomGalleryKey = keyof typeof roomGalleryDefaults;

export const getRoomMediaSlots = (room: "recording" | "multi-use" | "content") => {
  const roomSlots = websiteMediaSlots.filter((slot) => slot.key.startsWith(`room.${room}.`));
  return {
    cover: roomSlots.find((slot) => slot.key.endsWith(".cover"))!,
    gallery: roomSlots.filter((slot) => slot.kind === "panorama"),
  };
};
