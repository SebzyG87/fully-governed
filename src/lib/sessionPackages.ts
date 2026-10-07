export interface SessionPackage {
  id: string;
  name: string;
  description: string;
  includedServices: string[];
  excludedServices: string[];
  overtimeRule: string;
  adminNotes: string;
}

export interface SessionExtra {
  id: string;
  name: string;
  priceLabel: string;
  requiresApproval?: boolean;
}

export const SESSION_PACKAGES: SessionPackage[] = [
  {
    id: "dry-hire",
    name: "Dry Hire",
    description: "Room access only. Client brings or self-manages their session workflow.",
    includedServices: ["Room access", "Basic setup", "Booked time window"],
    excludedServices: ["Dedicated producer", "Mixing/mastering", "Filming", "Post-session edits"],
    overtimeRule: "Overtime must be approved and paid before extending the session.",
    adminNotes: "Useful for trusted clients or self-contained crews.",
  },
  {
    id: "recording-with-producer",
    name: "Recording With Producer",
    description: "Studio time with assigned producer/session owner support.",
    includedServices: ["Room access", "Assigned producer", "Basic session setup", "Session notes"],
    excludedServices: ["Advanced mixing", "Mastering", "Music video edits", "Distribution support"],
    overtimeRule: "Producer extension requires payment approval and producer availability.",
    adminNotes: "Producer should keep notes on takes, files, and follow-up actions.",
  },
  {
    id: "content-session",
    name: "Content Session",
    description: "Content room/session package for video, podcast, photos, or social assets.",
    includedServices: ["Room access", "Content setup", "Lighting baseline", "File handoff notes"],
    excludedServices: ["Same-day editing", "Voiceover cleanup", "Ad campaign setup"],
    overtimeRule: "Content sessions move into overtime once booked time ends.",
    adminNotes: "Confirm deliverables before session starts.",
  },
];

export const SESSION_EXTRAS: SessionExtra[] = [
  { id: "same-day-edit", name: "Same-day edit", priceLabel: "POA", requiresApproval: true },
  { id: "mixing", name: "Mixing", priceLabel: "Quoted separately", requiresApproval: true },
  { id: "mastering", name: "Mastering", priceLabel: "Quoted separately", requiresApproval: true },
  { id: "extra-guest", name: "Additional guest", priceLabel: "Admin approval" },
  { id: "overtime", name: "Overtime", priceLabel: "Charged before extension", requiresApproval: true },
];

export const getSessionPackage = (id?: string | null) =>
  SESSION_PACKAGES.find((pkg) => pkg.id === id) || SESSION_PACKAGES[0];

