import type { Enums } from "@/integrations/supabase/types";

export type LegacyRole = Enums<"app_role"> | null | undefined;

export type StudioRole =
  | "super_admin"
  | "studio_manager"
  | "session_producer"
  | "cleaner"
  | "client_artist";

export type Permission =
  | "view_all_bookings"
  | "manage_bookings"
  | "view_assigned_sessions"
  | "view_cleaning_tasks"
  | "manage_users"
  | "manage_payments"
  | "manage_settings";

const ROLE_PERMISSIONS: Record<StudioRole, Permission[]> = {
  super_admin: [
    "view_all_bookings",
    "manage_bookings",
    "view_assigned_sessions",
    "view_cleaning_tasks",
    "manage_users",
    "manage_payments",
    "manage_settings",
  ],
  studio_manager: [
    "view_all_bookings",
    "manage_bookings",
    "view_assigned_sessions",
    "view_cleaning_tasks",
    "manage_users",
    "manage_payments",
  ],
  session_producer: ["view_assigned_sessions"],
  cleaner: ["view_cleaning_tasks"],
  client_artist: [],
};

export const mapLegacyRoleToStudioRole = (role: LegacyRole): StudioRole => {
  if (role === "creator_admin") return "super_admin";
  if (role === "family") return "studio_manager";
  return "client_artist";
};

export const getStudioRoleLabel = (role: StudioRole) => {
  const labels: Record<StudioRole, string> = {
    super_admin: "Super Admin",
    studio_manager: "Studio Manager",
    session_producer: "Session Producer",
    cleaner: "Cleaner",
    client_artist: "Client / Artist",
  };
  return labels[role];
};

export const hasPermission = (role: StudioRole | LegacyRole, permission: Permission) => {
  const studioRole = typeof role === "string" && role.includes("_")
    ? (role as StudioRole)
    : mapLegacyRoleToStudioRole(role as LegacyRole);
  return ROLE_PERMISSIONS[studioRole]?.includes(permission) ?? false;
};

export const canViewAllBookings = (role: StudioRole | LegacyRole) => hasPermission(role, "view_all_bookings");
export const canManageBookings = (role: StudioRole | LegacyRole) => hasPermission(role, "manage_bookings");
export const canViewAssignedSessions = (role: StudioRole | LegacyRole) => hasPermission(role, "view_assigned_sessions");
export const canViewCleaningTasks = (role: StudioRole | LegacyRole) => hasPermission(role, "view_cleaning_tasks");
export const canManageUsers = (role: StudioRole | LegacyRole) => hasPermission(role, "manage_users");
export const canManagePayments = (role: StudioRole | LegacyRole) => hasPermission(role, "manage_payments");
export const canManageSettings = (role: StudioRole | LegacyRole) => hasPermission(role, "manage_settings");

