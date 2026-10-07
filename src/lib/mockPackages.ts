export interface StudioPackagePricing {
  id: string;
  category: "studio" | "podcast" | "content" | "recording" | "development" | "addon" | "overtime";
  packageName: string;
  description: string;
  durationMinutes: number;
  fullPrice: number;
  depositAmount: number;
  includedServices: string[];
  excludedServices: string[];
  optionalExtras: string[];
  overtimeRate: number;
  bufferMinutes: 0 | 20 | 30 | 60;
  verificationRequired: boolean;
}

export const STUDIO_PACKAGE_PRICING: StudioPackagePricing[] = [
  {
    id: "studio-dry-hire",
    category: "studio",
    packageName: "Studio Dry Hire",
    description: "Room access for trusted artists or self-managed sessions.",
    durationMinutes: 240,
    fullPrice: 100,
    depositAmount: 40,
    includedServices: ["Room access", "Basic setup", "Booked time window"],
    excludedServices: ["Dedicated producer", "Mixing", "Mastering"],
    optionalExtras: ["Producer", "Overtime", "Extra guests"],
    overtimeRate: 30,
    bufferMinutes: 0,
    verificationRequired: false,
  },
  {
    id: "recording-producer",
    category: "recording",
    packageName: "Recording With Producer",
    description: "Studio time with an assigned producer/session owner.",
    durationMinutes: 240,
    fullPrice: 160,
    depositAmount: 60,
    includedServices: ["Room access", "Assigned producer", "Session setup", "Session notes"],
    excludedServices: ["Advanced mix", "Mastering", "Distribution support"],
    optionalExtras: ["Mixing", "Mastering", "Overtime"],
    overtimeRate: 45,
    bufferMinutes: 0,
    verificationRequired: false,
  },
  {
    id: "podcast-session",
    category: "podcast",
    packageName: "Podcast Session",
    description: "Podcast room setup with baseline recording support.",
    durationMinutes: 120,
    fullPrice: 120,
    depositAmount: 40,
    includedServices: ["Podcast setup", "Room access", "Basic file handoff"],
    excludedServices: ["Editing", "Clips", "Distribution"],
    optionalExtras: ["Editing room monitoring", "Same-day edit", "Social clips", "Extra guest"],
    overtimeRate: 40,
    bufferMinutes: 60,
    verificationRequired: false,
  },
  {
    id: "content-room",
    category: "content",
    packageName: "Content Creation Room",
    description: "Lighting/content room booking for video, photo, and social assets.",
    durationMinutes: 120,
    fullPrice: 150,
    depositAmount: 50,
    includedServices: ["Room access", "Lighting baseline", "Content setup"],
    excludedServices: ["Videographer", "Editing", "Ad campaign setup"],
    optionalExtras: ["Camera operator", "Photo edit", "Video edit"],
    overtimeRate: 55,
    bufferMinutes: 30,
    verificationRequired: true,
  },
  {
    id: "artist-development",
    category: "development",
    packageName: "1-to-1 Artist Development",
    description: "Strategy, release planning, content direction, and artist guidance.",
    durationMinutes: 90,
    fullPrice: 90,
    depositAmount: 30,
    includedServices: ["Consultation", "Action notes", "Follow-up direction"],
    excludedServices: ["Production work", "Campaign spend", "Distribution fees"],
    optionalExtras: ["Campaign plan", "Content shoot", "Release support"],
    overtimeRate: 60,
    bufferMinutes: 20,
    verificationRequired: false,
  },
  {
    id: "overtime-standard",
    category: "overtime",
    packageName: "Overtime Extension",
    description: "Paid extension when room and staff availability allow.",
    durationMinutes: 60,
    fullPrice: 45,
    depositAmount: 45,
    includedServices: ["One extra hour", "Continuation of current session"],
    excludedServices: ["New package inclusions", "Unapproved extras"],
    optionalExtras: [],
    overtimeRate: 45,
    bufferMinutes: 0,
    verificationRequired: false,
  },
];

export const getPackagePricing = (id?: string | null) =>
  STUDIO_PACKAGE_PRICING.find((pkg) => pkg.id === id) || STUDIO_PACKAGE_PRICING[0];
