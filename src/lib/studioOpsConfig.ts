export const STUDIO_CONTACT_CONFIG = {
  buildingPhoneLabel: "Building phone number coming soon",
  phoneNumber: "",
  aiPhoneProvider: "Not connected",
  callLogsEnabled: false,
  aiSummariesEnabled: false,
};

export const STUDIO_ADDRESS = {
  name: "Fully Governed",
  line1: "HMEZZ 1B, V22 Building",
  line2: "174-186 Hither Green Lane",
  city: "Hither Green, Lewisham, London",
  postcode: "SE13 6QB",
  country: "United Kingdom",
};

export const ENABLE_DEMO_DATA = import.meta.env.VITE_ENABLE_DEMO_DATA !== "false";

export const DEMO_DATA_LABEL = "Demo Data";

export type SupportRequirementStatus = "required" | "assigned" | "complete";

export interface RoomSupportRequirement {
  mainRoom: string;
  supportRoom: string;
  supportType: "monitoring" | "recording" | "technical support";
  assignedStaff?: string;
  status: SupportRequirementStatus;
  notes: string;
}

export interface RoomBufferRule {
  match: string[];
  label: string;
  bufferMinutes: 0 | 30 | 60;
  supportRequirement?: RoomSupportRequirement;
}

export const ROOM_BUFFER_RULES: RoomBufferRule[] = [
  {
    match: ["recording", "studio 1b", "gold room"],
    label: "Studio / Recording Room",
    bufferMinutes: 0,
  },
  {
    match: ["multi-use", "multi use", "big room", "podcast", "neon suite"],
    label: "Big Room / Podcast / Multi-use Room",
    bufferMinutes: 60,
    supportRequirement: {
      mainRoom: "Podcast Room",
      supportRoom: "Editing Room",
      supportType: "monitoring",
      status: "required",
      notes: "Podcast sessions may need editing-room monitoring, recording support, or technical support.",
    },
  },
  {
    match: ["content creation", "creator hub", "content room"],
    label: "Content Creation Room",
    bufferMinutes: 30,
  },
];

export const normalizeRoomName = (roomName?: string | null) =>
  (roomName ?? "").toLowerCase().replace(/[—–-]/g, " ").replace(/\s+/g, " ").trim();

export const getRoomBufferRule = (roomName?: string | null) => {
  const normalized = normalizeRoomName(roomName);
  return ROOM_BUFFER_RULES.find((rule) => rule.match.some((token) => normalized.includes(token)));
};

export const getPlannedRoomBufferMinutes = (roomName?: string | null) =>
  getRoomBufferRule(roomName)?.bufferMinutes ?? 30;

export const getRoomSupportRequirement = (
  roomName?: string | null,
  sessionType?: string | null
): RoomSupportRequirement | undefined => {
  const combined = normalizeRoomName(`${roomName ?? ""} ${sessionType ?? ""}`);
  const isPodcast = combined.includes("podcast") || combined.includes("multi use") || combined.includes("multi-use") || combined.includes("big room");
  if (!isPodcast) return undefined;
  return ROOM_BUFFER_RULES.find((rule) => rule.supportRequirement)?.supportRequirement;
};
