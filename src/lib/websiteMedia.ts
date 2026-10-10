import heroStudio from "@/assets/hero-studio.jpg";

export interface WebsiteMediaSlot {
  key: string;
  label: string;
  kind: "image" | "panorama";
  fallback: string;
}

export const websiteMediaSlots: WebsiteMediaSlot[] = [
  { key: "home.hero", label: "Homepage hero", kind: "image", fallback: heroStudio },
  { key: "room.recording.cover", label: "Recording Studio cover", kind: "image", fallback: "/images/rooms/360/recording-room-01.jpeg" },
  { key: "room.recording.panorama.1", label: "Recording Studio 360 image 1", kind: "panorama", fallback: "/images/rooms/360/recording-room-01.jpeg" },
  { key: "room.recording.panorama.2", label: "Recording Studio 360 image 2", kind: "panorama", fallback: "/images/rooms/360/recording-room-02.jpeg" },
  { key: "room.multi-use.cover", label: "Multi-Use Room cover", kind: "image", fallback: "/images/rooms/360/multi-use-room-01.jpeg" },
  { key: "room.multi-use.panorama.1", label: "Multi-Use Room 360 image 1", kind: "panorama", fallback: "/images/rooms/360/multi-use-room-01.jpeg" },
  { key: "room.multi-use.panorama.2", label: "Multi-Use Room 360 image 2", kind: "panorama", fallback: "/images/rooms/360/multi-use-room-02.jpeg" },
  { key: "room.content.cover", label: "Content Creation Centre cover", kind: "image", fallback: "/images/rooms/360/production-workshop.jpeg" },
  { key: "room.content.panorama.1", label: "Content Creation Centre 360 image", kind: "panorama", fallback: "/images/rooms/360/production-workshop.jpeg" },
];

export const getRoomMediaSlots = (room: "recording" | "multi-use" | "content") => {
  const roomSlots = websiteMediaSlots.filter((slot) => slot.key.startsWith(`room.${room}.`));
  return {
    cover: roomSlots.find((slot) => slot.key.endsWith(".cover"))!,
    gallery: roomSlots.filter((slot) => slot.kind === "panorama"),
  };
};
