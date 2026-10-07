import type { StudioRole } from "@/lib/studioRoles";

export interface RoleDashboardEntry {
  key: "admin" | "studio_manager" | "session_producer" | "cleaner" | "client_artist";
  label: string;
  route: string;
  description: string;
  visibleTo: StudioRole[];
}

export const ROLE_DASHBOARD_ENTRIES: RoleDashboardEntry[] = [
  {
    key: "admin",
    label: "Admin Panel",
    route: "/dashboard/admin",
    description: "Full administrator command centre for the whole studio operation.",
    visibleTo: ["super_admin"],
  },
  {
    key: "studio_manager",
    label: "Studio Manager",
    route: "/dashboard/studio-manager",
    description: "Rooms, bookings, staff assignments, cleaning, and daily studio control.",
    visibleTo: ["super_admin", "studio_manager"],
  },
  {
    key: "session_producer",
    label: "Session Producer",
    route: "/dashboard/producer",
    description: "Assigned sessions, packages, session notes, timers, and incident logging.",
    visibleTo: ["super_admin", "session_producer"],
  },
  {
    key: "cleaner",
    label: "Cleaner",
    route: "/dashboard/cleaner",
    description: "Room turnaround jobs, checklists, issue reporting, and ready status.",
    visibleTo: ["super_admin", "cleaner"],
  },
  {
    key: "client_artist",
    label: "Client / Artist",
    route: "/dashboard/client",
    description: "Your bookings, package details, session rules, reminders, and support.",
    visibleTo: ["super_admin", "studio_manager", "session_producer", "client_artist"],
  },
];

export const getVisibleDashboardEntries = (role: StudioRole) =>
  ROLE_DASHBOARD_ENTRIES.filter((entry) => entry.visibleTo.includes(role));

export const FUTURE_EMAIL_ROLE_ASSIGNMENT = {
  note: "Owner/admin/staff emails should be configured in Supabase during the backend phase, not hardcoded in frontend source.",
  ownerEmails: [] as string[],
  studioManagerEmails: [] as string[],
  producerEmails: [] as string[],
  cleanerEmails: [] as string[],
};
