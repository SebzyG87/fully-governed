import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { format } from "date-fns";
import {
  AlertTriangle,
  CalendarDays,
  CreditCard,
  DoorOpen,
  ListChecks,
  Radio,
  ShieldCheck,
  Timer,
  Users,
  Wrench,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import BookingStatusBadge from "@/components/BookingStatusBadge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import {
  useCleaningTasks,
  useIncidents,
  useVerificationQueue,
  useTodaysRoomStatus,
  useProducerAssignments,
  updateBookingStatus,
} from "@/hooks/useStudioOps";
import { DEFAULT_BUFFER_MINUTES } from "@/lib/bookingBuffers";
import { getStudioRoleLabel, type StudioRole } from "@/lib/studioRoles";
import {
  MOCK_CLEANING_JOBS,
  MOCK_INCIDENTS,
  MOCK_LIVE_SESSIONS,
  MOCK_OPERATIONAL_PROFILES,
  MOCK_PAYMENT_RECORDS,
  MOCK_ROOM_STATUSES,
  MOCK_REMINDER_RECORDS,
  MOCK_SUPPORT_REQUIREMENTS,
  MOCK_TASKS,
  MOCK_TIMELINE,
  MOCK_VERIFICATIONS,
  type CleaningJob,
  type IncidentRecord,
  type LiveSession,
  type PaymentRecord,
  type ReminderRecord,
  type StudioRoomStatus,
  type StudioTask,
  type VerificationRecord,
} from "@/lib/mockStudioOps";
import type { Tables } from "@/integrations/supabase/types";
import { CleaningWorkflowPanel } from "@/components/studio-ops/CleaningWorkflowPanel";
import { IncidentPanel, VerificationPanel } from "@/components/studio-ops/IncidentVerificationPanel";
import { LiveSessionBoard } from "@/components/studio-ops/LiveSessionBoard";
import { PackageVisibilityPanel } from "@/components/studio-ops/PackageVisibilityPanel";
import { RoomStatusBoard } from "@/components/studio-ops/RoomStatusBoard";
import { DemoDataBadge, DemoDataNotice, StudioOpsBadge, StudioOpsCard, StudioOpsEmpty, StudioOpsSection } from "@/components/studio-ops/StudioOpsPrimitives";
import { TaskPanel, TimelinePanel } from "@/components/studio-ops/TaskTimelinePanel";
import { SessionTimerCard } from "@/components/studio-ops/SessionTimerCard";
import { PackagePricingAdminPanel } from "@/components/payments/PackagePricingAdminPanel";
import { PaymentSummaryCard } from "@/components/payments/PaymentSummaryCard";
import { getPackagePricing } from "@/lib/mockPackages";
import { ENABLE_DEMO_DATA, ROOM_BUFFER_RULES, type RoomSupportRequirement } from "@/lib/studioOpsConfig";
import { OperationalDetailDrawer, type OperationalDrawerData } from "@/components/studio-ops/OperationalDetailDrawer";
import { StaffClockPanel } from "@/components/studio-ops/StaffClockPanel";
import { InteractiveTaskPanel } from "@/components/studio-ops/InteractiveTaskPanel";
import { InternalMessagingPanel } from "@/components/studio-ops/InternalMessagingPanel";
import { SecurityRiskPanel } from "@/components/studio-ops/SecurityRiskPanel";
import { ProducerModelPanel } from "@/components/studio-ops/ProducerModelPanel";


// ── Adapters: convert live DB rows to UI component shapes ─────────────────

type CleaningTaskRow = Tables<"fg_cleaning_tasks"> & {
  rooms?: { name: string; color: string } | null;
};

function adaptCleaningTask(task: CleaningTaskRow): CleaningJob {
  const checklist = Array.isArray(task.checklist)
    ? (task.checklist as Array<{ item: string; done?: boolean }>).map((c) => c.item)
    : ["Clean room", "Check equipment", "Lock and mark ready"];
  return {
    id: task.id,
    roomName: task.rooms?.name ?? "Room",
    sessionEnded: task.cleaning_window_start
      ? format(new Date(task.cleaning_window_start), "HH:mm")
      : "Unknown",
    cleaningWindow: task.cleaning_window_end
      ? format(new Date(task.cleaning_window_end), "HH:mm")
      : "TBC",
    priority: task.status === "in_progress" ? "high" : task.status === "blocked" ? "urgent" : "medium",
    checklist,
    issueNotes: task.issue_report ?? task.notes ?? "No issue notes.",
  };
}

type IncidentRow = Tables<"fg_incidents">;

function adaptIncident(incident: IncidentRow): IncidentRecord {
  return {
    id: incident.id,
    type: incident.incident_type as IncidentRecord["type"],
    severity: incident.severity as IncidentRecord["severity"],
    linkedSession: incident.booking_id ?? "No session linked",
    reportedBy: incident.reported_by ?? "Staff",
    timestamp: format(new Date(incident.created_at), "d MMM HH:mm"),
    notes: incident.notes ?? "No notes.",
  };
}

type VerificationRow = Tables<"fg_client_verifications">;

function adaptVerification(v: VerificationRow): VerificationRecord {
  return {
    id: v.id,
    clientName: v.guest_name ?? v.user_id.slice(0, 8) + "...",
    clientStatus: (v.status ?? "not_required") as VerificationRecord["clientStatus"],
    guestStatus: "not_required" as VerificationRecord["guestStatus"],
    adminApproval: (v.admin_status === "approved"
      ? "verified"
      : v.admin_status === "rejected"
        ? "rejected"
        : "not_required") as VerificationRecord["adminApproval"],
    warning: v.rejected_reason ?? "",
  };
}

type RoomStatusRPCRow = {
  room_id: string;
  room_name: string;
  room_slug: string;
  room_color: string;
  current_booking_id: string | null;
  current_booking_status: string | null;
  current_session_type: string | null;
  current_start_time: string | null;
  current_end_time: string | null;
  next_start_time: string | null;
  cleaning_task_status: string | null;
};

function adaptRoomStatus(room: RoomStatusRPCRow): StudioRoomStatus {
  const s = room.current_booking_status;
  let status: StudioRoomStatus["status"] = "available";
  if (s === "in_progress" || s === "checked_in") status = "in_session";
  else if (s === "needs_cleaning") status = "cleaning";
  else if (s === "cleaned") status = "buffer_time";
  else if (s === "confirmed" || s === "ready" || s === "deposit_paid") status = "booked";
  else if (room.cleaning_task_status === "in_progress") status = "cleaning";
  else if (room.cleaning_task_status === "pending" || room.cleaning_task_status === "assigned") status = "buffer_time";

  const nowMs = Date.now();
  const endMs = room.current_end_time ? new Date(room.current_end_time).getTime() : 0;
  const minLeft = endMs > nowMs ? Math.round((endMs - nowMs) / 60000) : 0;

  return {
    id: room.room_id,
    roomName: room.room_name,
    status,
    currentSession: room.current_session_type ?? undefined,
    nextBooking: room.next_start_time
      ? format(new Date(room.next_start_time), "HH:mm")
      : undefined,
    timeRemaining: minLeft > 0 ? `${minLeft} min` : status === "available" ? "Ready" : undefined,
    cleaningStatus: room.cleaning_task_status ?? undefined,
  };
}

interface BookingRow {
  id: string;
  user_id: string;
  room_id: string;
  start_time: string;
  end_time: string;
  session_type: string;
  status: string;
  notes: string | null;
  num_guests: number | null;
  rooms?: { name: string; color: string } | null;
  profiles?: { full_name: string | null } | null;
}

const useBookings = (role: StudioRole) => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      setLoading(true);
      setLoadError("");

      let query = supabase
        .from("bookings")
        .select("id, user_id, room_id, start_time, end_time, session_type, status, notes, num_guests")
        .order("start_time", { ascending: true })
        .limit(25);

      if (role === "client_artist") {
        query = query.eq("user_id", user.id);
      }

      const { data, error } = await query;
      if (error) {
        setLoadError("Booking records could not be read for this role. Other operational panels may still use live Supabase data or labelled demo fallbacks.");
        setBookings([]);
      } else {
        const rows = (data as unknown as BookingRow[]) || [];
        const userIds = [...new Set(rows.map((booking) => booking.user_id))];
        const roomIds = [...new Set(rows.map((booking) => booking.room_id))];
        const [{ data: profiles, error: profilesError }, { data: rooms, error: roomsError }] = await Promise.all([
          userIds.length
            ? supabase.from("profiles").select("user_id, full_name").in("user_id", userIds)
            : Promise.resolve({ data: [], error: null }),
          roomIds.length
            ? supabase.from("rooms").select("id, name, color").in("id", roomIds)
            : Promise.resolve({ data: [], error: null }),
        ]);
        const names = new Map((profiles || []).map((profile) => [profile.user_id, profile.full_name]));
        const roomMap = new Map((rooms || []).map((room) => [room.id, { name: room.name, color: room.color }]));
        setBookings(rows.map((booking) => ({
          ...booking,
          profiles: profilesError ? null : { full_name: names.get(booking.user_id) || null },
          rooms: roomsError ? null : roomMap.get(booking.room_id) || null,
        })));
      }
      setLoading(false);
    };

    load();
  }, [role, user]);

  return { bookings, loading, loadError };
};

const BookingList = ({ bookings, loading, error, onInspect }: { bookings: BookingRow[]; loading: boolean; error?: string; onInspect?: (booking: BookingRow) => void }) => {
  if (loading) return <StudioOpsEmpty>Loading booking data...</StudioOpsEmpty>;
  if (error) return <StudioOpsEmpty>{error}</StudioOpsEmpty>;
  if (bookings.length === 0) return <StudioOpsEmpty>No matching bookings yet. Live booking records will appear here as soon as they exist for this role.</StudioOpsEmpty>;

  return (
    <div className="space-y-3">
      {bookings.map((booking) => (
        <button key={booking.id} type="button" onClick={() => onInspect?.(booking)} className="w-full text-left">
        <StudioOpsCard className="transition-colors hover:border-primary/40">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="font-bebas text-xl tracking-wide text-foreground">{booking.session_type || "Studio session"}</p>
              <p className="text-sm text-muted-foreground">
                {format(new Date(booking.start_time), "EEE d MMM · HH:mm")} to {format(new Date(booking.end_time), "HH:mm")}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {booking.rooms?.name || "Room not assigned"} · {booking.profiles?.full_name || "Client profile hidden"}
              </p>
            </div>
            <BookingStatusBadge status={booking.status} />
          </div>
          {booking.notes && <p className="mt-3 rounded-xl bg-card/70 p-3 text-xs text-muted-foreground">{booking.notes}</p>}
        </StudioOpsCard>
        </button>
      ))}
    </div>
  );
};

const useDemoFallback = <T,>(liveItems: T[], demoItems: T[]) => {
  const isDemoData = liveItems.length === 0 && ENABLE_DEMO_DATA;
  return {
    items: liveItems.length ? liveItems : isDemoData ? demoItems : [],
    isDemoData,
  };
};

const DashboardMetricStrip = ({ role, onInspect }: { role: StudioRole; onInspect?: (item: OperationalDrawerData) => void }) => {
  const { bookings, loading, loadError } = useBookings(role);
  const now = new Date();
  const today = bookings.filter((booking) => new Date(booking.start_time).toDateString() === now.toDateString());
  const live = bookings.filter((booking) => new Date(booking.start_time) <= now && new Date(booking.end_time) >= now);
  const pending = bookings.filter((booking) => ["pending_payment", "deposit_paid"].includes(booking.status));
  const cleaning = bookings.filter((booking) => ["needs_cleaning", "cleaned"].includes(booking.status));

  const demoMetrics = bookings.length === 0 && ENABLE_DEMO_DATA;
  const cards = [
    { label: "Today", value: today.length, icon: CalendarDays },
    { label: "Pending", value: pending.length, icon: AlertTriangle },
    { label: "Live now", value: live.length || (demoMetrics ? MOCK_LIVE_SESSIONS.filter((session) => session.status === "in_progress").length : 0), icon: Timer },
    { label: "Cleaning", value: cleaning.length || (demoMetrics ? MOCK_CLEANING_JOBS.length : 0), icon: ListChecks },
  ];

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {cards.map((card) => (
          <button
            key={card.label}
            type="button"
            onClick={() => onInspect?.({
              id: `metric-${card.label.toLowerCase()}`,
              kind: "alert",
              title: `${card.label} operations`,
              subtitle: "Metric shelf showing the records that drive this dashboard count.",
              status: loading ? "loading" : "current",
              fields: [
                { label: "Value", value: String(card.value) },
                { label: "Source", value: demoMetrics ? "Labelled demo fallback" : "Live booking query" },
              ],
              history: [
                { id: `hist-${card.label}`, actor: "Dashboard", action: "Metric inspected", timestamp: "Now", detail: `${card.label} metric opened from the command surface.` },
              ],
            })}
            className="w-full text-left"
          >
          <StudioOpsCard className="transition-colors hover:border-primary/40">
            <card.icon className="mb-3 h-5 w-5 text-primary" />
            <p className="font-mono text-3xl text-foreground">{loading ? "..." : card.value}</p>
            <p className="text-xs text-muted-foreground">{card.label}</p>
          </StudioOpsCard>
          </button>
        ))}
      </div>
      {loadError && (
        <div className="rounded-2xl border border-amber-500/25 bg-amber-500/10 p-3 text-xs text-amber-100">
          {loadError}
        </div>
      )}
      {demoMetrics && <DemoDataBadge />}
    </div>
  );
};

const UpcomingBookingsPanel = ({ role, onInspect }: { role: StudioRole; onInspect?: (item: OperationalDrawerData) => void }) => {
  const { bookings, loading, loadError } = useBookings(role);

  return (
    <StudioOpsSection title="Upcoming Bookings" eyebrow="Calendar" icon={CalendarDays}>
      <BookingList
        bookings={bookings.slice(0, 8)}
        loading={loading}
        error={loadError}
        onInspect={(booking) => onInspect?.({
          id: booking.id,
          kind: "booking",
          title: booking.session_type || "Studio session",
          subtitle: `${format(new Date(booking.start_time), "EEE d MMM · HH:mm")} to ${format(new Date(booking.end_time), "HH:mm")}`,
          status: booking.status,
          tags: ["booking", booking.rooms?.name || "room pending"],
          fields: [
            { label: "Room", value: booking.rooms?.name || "Not assigned" },
            { label: "Client", value: booking.profiles?.full_name || "Client profile hidden" },
            { label: "Guests", value: String(booking.num_guests ?? 0) },
            { label: "Notes", value: booking.notes || "No booking notes" },
          ],
          linkedPeople: [{ id: booking.user_id, name: booking.profiles?.full_name || "Client", role: "client" }],
          history: [
            { id: `${booking.id}-created`, actor: "Booking system", action: "Booking loaded", timestamp: "Live query", detail: "Booking opened from the operations dashboard." },
          ],
        })}
      />
    </StudioOpsSection>
  );
};

const StatusControlPanel = ({ activeBookingId }: { activeBookingId?: string }) => {
  const [working, setWorking] = useState<string | null>(null);

  const actions: Array<{ label: string; status: string; tone?: string }> = [
    { label: "Check in", status: "checked_in" },
    { label: "Start session", status: "in_progress" },
    { label: "Needs cleaning", status: "needs_cleaning" },
    { label: "Complete session", status: "completed" },
    { label: "Mark no-show", status: "no_show", tone: "hover:border-red-500/40" },
    { label: "Cancel booking", status: "cancelled", tone: "hover:border-red-500/40" },
  ];

  const handleAction = async (status: string) => {
    if (!activeBookingId) return;
    setWorking(status);
    await updateBookingStatus(activeBookingId, status);
    setWorking(null);
  };

  return (
    <StudioOpsSection title="Session Status Controls" eyebrow="Live controls" icon={Wrench}>
      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
        {actions.map(({ label, status, tone }) => (
          <button
            key={status}
            type="button"
            onClick={() => handleAction(status)}
            disabled={!activeBookingId || working === status}
            className={`rounded-2xl border border-border bg-background/45 p-3 text-left text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground disabled:opacity-40 ${tone ?? ""}`}
          >
            {working === status ? "Updating..." : label}
            {!activeBookingId && (
              <span className="mt-1 block text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Select a booking first</span>
            )}
          </button>
        ))}
      </div>
      {!activeBookingId && (
        <p className="mt-2 text-xs text-muted-foreground">Status controls activate when a booking is selected from today's schedule.</p>
      )}
    </StudioOpsSection>
  );
};

const PaymentOverviewPanel = ({ audience = "admin", onInspect }: { audience?: "admin" | "producer" | "client"; onInspect?: (item: OperationalDrawerData) => void }) => {
  const recording = getPackagePricing("recording-producer");
  const content = getPackagePricing("content-room");

  return (
    <StudioOpsSection title="Payment + Deposit Overview" eyebrow="Payment ready" icon={CreditCard}>
      <div className="grid gap-3 xl:grid-cols-2">
        <PaymentSummaryCard
          title="Current session"
          packageName={recording.packageName}
          bookingReference="FG-PENDING-001"
          total={recording.fullPrice}
          deposit={recording.depositAmount}
          balance={recording.fullPrice - recording.depositAmount}
          status="balance_due"
          audience={audience}
          onInspect={() => onInspect?.(paymentToDrawer(MOCK_PAYMENT_RECORDS[0]))}
        />
        <PaymentSummaryCard
          title="Overtime example"
          packageName={content.packageName}
          bookingReference="FG-OVERTIME-READY"
          total={content.fullPrice + content.overtimeRate}
          deposit={content.depositAmount}
          balance={content.fullPrice + content.overtimeRate - content.depositAmount}
          status="overtime_due"
          audience={audience}
          onInspect={() => onInspect?.(paymentToDrawer(MOCK_PAYMENT_RECORDS[1]))}
        />
      </div>
      {audience !== "client" && (
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {[
            ["Manual status", "Inspect and update operational payment state"],
            ["Refund state", "Track refund/dispute status after Stripe webhooks"],
            ["Payment notes", "Internal notes hidden from clients"],
          ].map(([label, note]) => (
            <StudioOpsCard key={label}>
              <p className="font-bebas text-2xl tracking-wide text-foreground">{label}</p>
              <p className="text-xs text-muted-foreground">{note}</p>
            </StudioOpsCard>
          ))}
        </div>
      )}
    </StudioOpsSection>
  );
};

const StaffAssignmentsPanel = ({ onInspect }: { onInspect?: (item: OperationalDrawerData) => void }) => (
  <StudioOpsSection title="Staff Assignments" eyebrow="Prepared" icon={Users} action={ENABLE_DEMO_DATA ? <DemoDataBadge /> : undefined}>
    <div className="grid gap-3 lg:grid-cols-3">
      {[
        ["Producer", "Manny", "Studio 1B · recording session", "producer-manny"],
        ["Cleaner", "Unassigned", "Content Room · reset window", "cleaner-queue"],
        ["Studio manager", "On duty", "Bookings, verification, incidents", "admin-ops"],
      ].map(([role, person, note, profileId]) => (
        <button key={role} type="button" className="text-left" onClick={() => {
          const profile = MOCK_OPERATIONAL_PROFILES.find((p) => p.id === profileId);
          onInspect?.({
            id: profileId,
            kind: "profile",
            title: person,
            subtitle: note,
            status: profile?.status || "Active",
            tags: profile?.tags || [role.toLowerCase()],
            fields: Object.entries(profile?.metadata || { role, note }).map(([label, value]) => ({ label, value })),
            notes: profile?.notes,
            history: profile?.history,
            relationships: [{ label: "Profile page", value: "Open full profile", href: `/admin/people/${profileId}` }],
          });
        }}>
        <StudioOpsCard className="transition-colors hover:border-primary/40">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-primary">{role}</p>
          <p className="font-bebas text-2xl tracking-wide text-foreground">{person}</p>
          <p className="text-xs text-muted-foreground">{note}</p>
        </StudioOpsCard>
        </button>
      ))}
    </div>
  </StudioOpsSection>
);

const BufferRulesPanel = ({ onInspect }: { onInspect?: (item: OperationalDrawerData) => void }) => (
  <StudioOpsSection title="Room Buffer Rules" eyebrow="Availability" icon={DoorOpen}>
    <div className="space-y-3 text-sm text-muted-foreground">
      <p>Default room buffer remains <span className="text-primary">{DEFAULT_BUFFER_MINUTES} minutes</span> only as a database fallback. Planned room-specific rules are:</p>
      <div className="grid gap-2 sm:grid-cols-3">
        {ROOM_BUFFER_RULES.map((rule) => (
          <button key={rule.label} type="button" className="text-left" onClick={() => onInspect?.({
            id: `buffer-${rule.label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
            kind: "room",
            title: rule.label,
            subtitle: `${rule.bufferMinutes} minute buffer`,
            status: "configured",
            tags: ["availability", "buffer rule"],
            fields: [
              { label: "Buffer", value: `${rule.bufferMinutes} minutes` },
              { label: "Support room", value: rule.supportRequirement?.supportRoom || "None" },
              { label: "Support type", value: rule.supportRequirement?.supportType || "None" },
              { label: "Assigned staff", value: rule.supportRequirement?.assignedStaff || "Optional" },
            ],
            notes: [rule.supportRequirement?.notes || "No linked support requirement for this room type."],
            history: [
              { id: `${rule.label}-buffer-history`, actor: "Studio operations", action: "Buffer rule reviewed", timestamp: "Now", detail: `${rule.label} availability rule inspected from dashboard.` },
            ],
          })}>
          <StudioOpsCard className="transition-colors hover:border-primary/40">
            <p className="font-bebas text-xl tracking-wide text-foreground">{rule.label}</p>
            <p className="font-mono text-sm text-primary">{rule.bufferMinutes} minute buffer</p>
            {rule.supportRequirement && <p className="mt-2 text-xs text-muted-foreground">Linked support: {rule.supportRequirement.supportRoom} · {rule.supportRequirement.supportType}</p>}
          </StudioOpsCard>
          </button>
        ))}
      </div>
      <p>Availability logic accepts 0, 20, 30, and 60 minute buffers, including back-to-back recording-room sessions.</p>
      <StudioOpsBadge tone="border-emerald-500/25 bg-emerald-500/10 text-emerald-300">Operational rule configured</StudioOpsBadge>
    </div>
  </StudioOpsSection>
);

const SupportRequirementsPanel = ({
  requirements,
  isDemoData = false,
  onInspect,
}: {
  requirements: RoomSupportRequirement[];
  isDemoData?: boolean;
  onInspect?: (item: OperationalDrawerData) => void;
}) => (
  <StudioOpsSection title="Linked Room Support" eyebrow="Podcast support" icon={Radio} action={isDemoData ? <DemoDataBadge /> : undefined}>
    {requirements.length === 0 ? (
      <StudioOpsEmpty>No linked support requirements yet. Podcast/editing-room support will appear here when bookings require it.</StudioOpsEmpty>
    ) : (
      <div className="grid gap-3 xl:grid-cols-2">
        {requirements.map((requirement) => (
          <button key={`${requirement.mainRoom}-${requirement.supportRoom}-${requirement.supportType}`} type="button" className="text-left" onClick={() => onInspect?.(supportToDrawer(requirement))}>
          <StudioOpsCard className="space-y-3 transition-colors hover:border-primary/40">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="font-bebas text-2xl tracking-wide text-foreground">{requirement.mainRoom}</p>
                <p className="text-xs text-muted-foreground">Support room: {requirement.supportRoom}</p>
              </div>
              <StudioOpsBadge tone="border-amber-500/25 bg-amber-500/10 text-amber-200">{requirement.status}</StudioOpsBadge>
            </div>
            <div className="grid gap-2 text-xs text-muted-foreground sm:grid-cols-2">
              <p>Support type: <span className="text-foreground">{requirement.supportType}</span></p>
              <p>Assigned staff: <span className="text-foreground">{requirement.assignedStaff || "Optional"}</span></p>
            </div>
            <p className="rounded-xl bg-card/70 p-3 text-xs text-muted-foreground">{requirement.notes}</p>
          </StudioOpsCard>
          </button>
        ))}
      </div>
    )}
  </StudioOpsSection>
);

const ReminderOperationsPanel = ({ onInspect }: { onInspect?: (item: OperationalDrawerData) => void }) => (
  <StudioOpsSection title="Reminders + Follow-ups" eyebrow="Action queue" icon={AlertTriangle} action={ENABLE_DEMO_DATA ? <DemoDataBadge /> : undefined}>
    <div className="space-y-3">
      {MOCK_REMINDER_RECORDS.map((reminder) => (
        <button key={reminder.id} type="button" onClick={() => onInspect?.(reminderToDrawer(reminder))} className="w-full text-left">
          <StudioOpsCard className="transition-colors hover:border-primary/40">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="font-bebas text-xl tracking-wide text-foreground">{reminder.title}</p>
                <p className="text-xs text-muted-foreground">{reminder.client} · {reminder.linkedSession} · {reminder.due}</p>
              </div>
              <StudioOpsBadge tone="border-amber-500/25 bg-amber-500/10 text-amber-200">{reminder.state}</StudioOpsBadge>
            </div>
          </StudioOpsCard>
        </button>
      ))}
    </div>
  </StudioOpsSection>
);

const CommunityOperationsPanel = ({ onInspect }: { onInspect?: (item: OperationalDrawerData) => void }) => (
  <StudioOpsSection title="People + Community Records" eyebrow="Profiles" icon={Users} action={ENABLE_DEMO_DATA ? <DemoDataBadge /> : undefined}>
    <div className="grid gap-3 md:grid-cols-2">
      {MOCK_OPERATIONAL_PROFILES.map((profile) => (
        <button
          key={profile.id}
          type="button"
          className="text-left"
          onClick={() => onInspect?.({
            id: profile.id,
            kind: "profile",
            title: profile.name,
            subtitle: `${profile.role} · ${profile.contact}`,
            status: profile.status,
            tags: profile.tags,
            fields: [
              { label: "Sessions", value: profile.sessions.join(", ") },
              { label: "Payment history", value: profile.paymentHistory.join(", ") || "None" },
              { label: "Attendance", value: profile.attendance.join(", ") },
              ...Object.entries(profile.metadata).map(([label, value]) => ({ label, value })),
            ],
            notes: profile.notes,
            history: profile.history,
            relationships: [{ label: "Full profile", value: "Open operational page", href: `/admin/people/${profile.id}` }],
          })}
        >
          <StudioOpsCard className="space-y-3 transition-colors hover:border-primary/40">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-primary">{profile.role}</p>
              <p className="font-bebas text-2xl tracking-wide text-foreground">{profile.name}</p>
              <p className="text-xs text-muted-foreground">{profile.status}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {profile.tags.slice(0, 3).map((tag) => <StudioOpsBadge key={tag}>{tag}</StudioOpsBadge>)}
            </div>
          </StudioOpsCard>
        </button>
      ))}
    </div>
  </StudioOpsSection>
);

const sessionToDrawer = (session: LiveSession): OperationalDrawerData => ({
  id: session.id,
  kind: "session",
  title: session.artistName,
  subtitle: `${session.roomName} · ${session.startTime}-${session.endTime} · ${session.packageName}`,
  status: session.status,
  tags: session.tags,
  fields: [
    { label: "Artist", value: session.artistName },
    { label: "Producer", value: session.producer },
    { label: "Engineer", value: session.engineer || "Not assigned" },
    { label: "Cleaner", value: session.cleaner || "Not assigned" },
    { label: "Payment", value: session.paymentStatus },
    { label: "Deposit", value: session.depositStatus },
    { label: "Timer", value: session.timeRemaining },
    { label: "Next action", value: session.nextAction },
    { label: "Attachments", value: session.attachments?.join(", ") || "None" },
  ],
  linkedPeople: [
    { id: session.artistId || session.clientId || "client", name: session.artistName, role: "artist" },
    { id: session.producerId || "producer", name: session.producer, role: "producer" },
    { id: session.cleanerId || "cleaner-queue", name: session.cleaner || "Cleaner queue", role: "cleaner" },
  ],
  notes: session.notes,
  tasks: session.tasks?.length ? session.tasks : MOCK_TASKS.filter((task) => task.linkedSession.toLowerCase().includes(session.artistName.toLowerCase().split(" ")[0]) || task.linkedSession.toLowerCase().includes(session.roomName.toLowerCase().split(" ")[0])),
  comments: session.comments,
  history: session.history,
  relationships: [
    { label: "Room", value: session.roomName, href: "/dashboard/admin" },
    { label: "Payment record", value: MOCK_PAYMENT_RECORDS.find((payment) => payment.linkedSession === session.id)?.id || "Pending" },
    { label: "Reminder count", value: String(session.reminders?.length ?? 0) },
  ],
});

const roomToDrawer = (room: StudioRoomStatus): OperationalDrawerData => ({
  id: room.id,
  kind: "room",
  title: room.roomName,
  subtitle: room.currentSession || room.currentClient || "No active session",
  status: room.status,
  tags: ["room status", room.cleaningStatus || "clean"],
  fields: [
    { label: "Current client", value: room.currentClient || "None" },
    { label: "Current session", value: room.currentSession || "None" },
    { label: "Producer", value: room.assignedProducer || "Not assigned" },
    { label: "Next booking", value: room.nextBooking || "No booking queued" },
    { label: "Timer", value: room.timeRemaining || "Time unavailable" },
    { label: "Cleaning state", value: room.cleaningStatus || "No cleaning note" },
  ],
  history: [
    { id: `${room.id}-status`, actor: "Room board", action: "Room inspected", timestamp: "Now", detail: `${room.roomName} opened from live room status.` },
  ],
});

const cleaningToDrawer = (job: CleaningJob): OperationalDrawerData => ({
  id: job.id,
  kind: "cleaning",
  title: `${job.roomName} turnover`,
  subtitle: `Ended ${job.sessionEnded} · clean ${job.cleaningWindow}`,
  status: "assigned",
  tags: [job.priority, "cleaning", job.assignedTo || "unassigned"],
  fields: [
    { label: "Room", value: job.roomName },
    { label: "Assigned to", value: job.assignedTo || "Unassigned" },
    { label: "Linked session", value: job.linkedSession || "Not linked" },
    { label: "Issue notes", value: job.issueNotes },
  ],
  notes: [job.issueNotes],
  tasks: job.checklist.map((item, index) => ({
    id: `${job.id}-${index}`,
    title: item,
    assignedTo: job.assignedTo || "Cleaner queue",
    assignedRole: "cleaner",
    linkedSession: job.linkedSession || job.roomName,
    dueTime: job.cleaningWindow,
    priority: job.priority,
    status: "to_do",
    notes: "Turnaround checklist item.",
  })),
  history: job.history,
});

const taskToDrawer = (task: StudioTask): OperationalDrawerData => ({
  id: task.id,
  kind: "task",
  title: task.title,
  subtitle: `${task.linkedSession} · due ${task.dueTime}`,
  status: task.status,
  tags: [task.priority, task.assignedRole],
  fields: [
    { label: "Assigned to", value: task.assignedTo },
    { label: "Role", value: task.assignedRole },
    { label: "Priority", value: task.priority },
    { label: "Notes", value: task.notes },
  ],
  tasks: [task],
  history: [
    { id: `${task.id}-created`, actor: "Studio manager", action: "Task queued", timestamp: task.dueTime, detail: task.notes },
  ],
});

const paymentToDrawer = (payment: PaymentRecord): OperationalDrawerData => ({
  id: payment.id,
  kind: "payment",
  title: `${payment.client} payment`,
  subtitle: `${payment.linkedSession} · ${payment.state}`,
  status: payment.state,
  tags: ["payment", "deposit", "balance"],
  fields: [
    { label: "Total", value: payment.total },
    { label: "Deposit", value: payment.deposit },
    { label: "Balance", value: payment.balance },
    { label: "Refund state", value: payment.refundState },
    { label: "Notes", value: payment.notes },
  ],
  notes: payment.reminderHistory,
  history: payment.history,
});

const reminderToDrawer = (reminder: ReminderRecord): OperationalDrawerData => ({
  id: reminder.id,
  kind: "reminder",
  title: reminder.title,
  subtitle: `${reminder.client} · ${reminder.due}`,
  status: reminder.state,
  tags: ["reminder", reminder.channel],
  fields: [
    { label: "Linked session", value: reminder.linkedSession },
    { label: "Client", value: reminder.client },
    { label: "Channel", value: reminder.channel },
    { label: "Due", value: reminder.due },
  ],
  history: reminder.history,
});

const supportToDrawer = (requirement: RoomSupportRequirement): OperationalDrawerData => ({
  id: `support-${requirement.mainRoom.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
  kind: "task",
  title: `${requirement.mainRoom} support`,
  subtitle: `${requirement.supportRoom} · ${requirement.supportType}`,
  status: requirement.status,
  tags: ["linked support", requirement.supportType, requirement.supportRoom],
  fields: [
    { label: "Main room", value: requirement.mainRoom },
    { label: "Support room", value: requirement.supportRoom },
    { label: "Support type", value: requirement.supportType },
    { label: "Assigned staff", value: requirement.assignedStaff || "Optional" },
    { label: "Notes", value: requirement.notes },
  ],
  tasks: [
    {
      id: `task-${requirement.mainRoom}`,
      title: `Prepare ${requirement.supportRoom} for ${requirement.supportType}`,
      assignedTo: requirement.assignedStaff || "Studio manager",
      assignedRole: "studio_manager",
      linkedSession: requirement.mainRoom,
      dueTime: "Before session start",
      priority: "high",
      status: requirement.status === "complete" ? "complete" : requirement.status === "assigned" ? "in_progress" : "to_do",
      notes: requirement.notes,
    },
  ],
  history: [
    { id: `hist-support-${requirement.mainRoom}`, actor: "Studio operations", action: "Support requirement created", timestamp: "Planning", detail: `${requirement.supportRoom} marked as linked support for ${requirement.mainRoom}.` },
  ],
});

const incidentToDrawer = (incident: IncidentRecord): OperationalDrawerData => ({
  id: incident.id,
  kind: "alert",
  title: incident.type.replace("_", " "),
  subtitle: `${incident.linkedSession} · ${incident.timestamp}`,
  status: incident.severity,
  tags: ["incident", incident.type, incident.severity],
  fields: [
    { label: "Linked session", value: incident.linkedSession },
    { label: "Reported by", value: incident.reportedBy },
    { label: "Severity", value: incident.severity },
    { label: "Notes", value: incident.notes },
  ],
  notes: [incident.notes],
  history: [
    { id: `${incident.id}-reported`, actor: incident.reportedBy, action: "Incident reported", timestamp: incident.timestamp, detail: incident.notes },
  ],
});

const verificationToDrawer = (record: VerificationRecord): OperationalDrawerData => ({
  id: record.id,
  kind: "profile",
  title: record.clientName,
  subtitle: "Verification and access review",
  status: record.adminApproval,
  tags: ["verification", record.clientStatus],
  fields: [
    { label: "Client verification", value: record.clientStatus },
    { label: "Guest verification", value: record.guestStatus },
    { label: "Admin approval", value: record.adminApproval },
    { label: "Warning", value: record.warning },
  ],
  notes: [record.warning],
  history: [
    { id: `${record.id}-verification`, actor: "Studio manager", action: "Verification reviewed", timestamp: "Today", detail: record.warning || "Verification record inspected." },
  ],
});

interface LiveDashboardData {
  cleaningJobs: CleaningJob[];
  incidents: IncidentRecord[];
  verifications: VerificationRecord[];
  roomStatuses: StudioRoomStatus[];
  hasLiveData: boolean;
}

const AdminDashboard = ({ live, onInspect }: { live: LiveDashboardData; onInspect: (item: OperationalDrawerData) => void }) => {
  const roomStatuses = useDemoFallback(live.roomStatuses, MOCK_ROOM_STATUSES);
  const cleaningJobs = useDemoFallback(live.cleaningJobs, MOCK_CLEANING_JOBS);
  const verifications = useDemoFallback(live.verifications, MOCK_VERIFICATIONS);
  const incidents = useDemoFallback(live.incidents, MOCK_INCIDENTS);
  return (
    <div className="space-y-6">
      {ENABLE_DEMO_DATA && !live.hasLiveData && <DemoDataNotice />}
      <DashboardMetricStrip role="super_admin" onInspect={onInspect} />
      <RoomStatusBoard rooms={roomStatuses.items} isDemoData={roomStatuses.isDemoData} onInspect={(room) => onInspect(roomToDrawer(room))} />
      <LiveSessionBoard sessions={ENABLE_DEMO_DATA ? MOCK_LIVE_SESSIONS : []} isDemoData={ENABLE_DEMO_DATA} onInspect={(session) => onInspect(sessionToDrawer(session))} />
      <SupportRequirementsPanel requirements={ENABLE_DEMO_DATA ? MOCK_SUPPORT_REQUIREMENTS : []} isDemoData={ENABLE_DEMO_DATA} onInspect={onInspect} />
      <StaffClockPanel staffRole="super_admin" />
      <div className="grid gap-5 xl:grid-cols-2">
        <UpcomingBookingsPanel role="super_admin" onInspect={onInspect} />
        <StaffAssignmentsPanel onInspect={onInspect} />
      </div>
      <div className="grid gap-5 xl:grid-cols-2">
        <CleaningWorkflowPanel jobs={cleaningJobs.items} isDemoData={cleaningJobs.isDemoData} onInspect={(job) => onInspect(cleaningToDrawer(job))} />
        <InteractiveTaskPanel staffRole="super_admin" />
      </div>
      <InternalMessagingPanel staffRole="super_admin" currentUserName="Admin Manager" />
      <SecurityRiskPanel staffRole="super_admin" />
      <ProducerModelPanel />
      <div className="grid gap-5 xl:grid-cols-2">
        <VerificationPanel records={verifications.items} isDemoData={verifications.isDemoData} onInspect={(record) => onInspect(verificationToDrawer(record))} />
        <IncidentPanel incidents={incidents.items} isDemoData={incidents.isDemoData} onInspect={(incident) => onInspect(incidentToDrawer(incident))} />
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <ReminderOperationsPanel onInspect={onInspect} />
        <CommunityOperationsPanel onInspect={onInspect} />
      </div>
      <PaymentOverviewPanel onInspect={onInspect} />
      <PackagePricingAdminPanel onInspect={(packageId) => {
        const pkg = getPackagePricing(packageId);
        onInspect({
          id: packageId,
          kind: "package",
          title: pkg.packageName,
          subtitle: pkg.description,
          status: "editable",
          tags: [pkg.category, pkg.verificationRequired ? "ID check" : "standard"],
          fields: [
            { label: "Duration", value: `${pkg.durationMinutes} minutes` },
            { label: "Full price", value: `£${pkg.fullPrice}` },
            { label: "Deposit", value: `£${pkg.depositAmount}` },
            { label: "Overtime", value: `£${pkg.overtimeRate}/hr` },
            { label: "Included", value: pkg.includedServices.join(", ") },
            { label: "Excluded", value: pkg.excludedServices.join(", ") },
          ],
          history: [{ id: `${packageId}-price`, actor: "Pricing admin", action: "Package inspected", timestamp: "Now", detail: "Package opened from admin operations dashboard." }],
        });
      }} />
      <TimelinePanel events={ENABLE_DEMO_DATA ? MOCK_TIMELINE : []} isDemoData={ENABLE_DEMO_DATA} />
    </div>
  );
};

const StudioManagerDashboard = ({ live, onInspect }: { live: LiveDashboardData; onInspect: (item: OperationalDrawerData) => void }) => {
  const roomStatuses = useDemoFallback(live.roomStatuses, MOCK_ROOM_STATUSES);
  const cleaningJobs = useDemoFallback(live.cleaningJobs, MOCK_CLEANING_JOBS);
  const verifications = useDemoFallback(live.verifications, MOCK_VERIFICATIONS);
  return (
    <div className="space-y-6">
      {ENABLE_DEMO_DATA && !live.hasLiveData && <DemoDataNotice />}
      <DashboardMetricStrip role="studio_manager" onInspect={onInspect} />
      <RoomStatusBoard rooms={roomStatuses.items} isDemoData={roomStatuses.isDemoData} onInspect={(room) => onInspect(roomToDrawer(room))} />
      <LiveSessionBoard sessions={ENABLE_DEMO_DATA ? MOCK_LIVE_SESSIONS : []} isDemoData={ENABLE_DEMO_DATA} onInspect={(session) => onInspect(sessionToDrawer(session))} />
      <SupportRequirementsPanel requirements={ENABLE_DEMO_DATA ? MOCK_SUPPORT_REQUIREMENTS : []} isDemoData={ENABLE_DEMO_DATA} onInspect={onInspect} />
      <StaffClockPanel staffRole="studio_manager" />
      <StatusControlPanel />
      <div className="grid gap-5 xl:grid-cols-2">
        <StaffAssignmentsPanel onInspect={onInspect} />
        <CleaningWorkflowPanel jobs={cleaningJobs.items} isDemoData={cleaningJobs.isDemoData} onInspect={(job) => onInspect(cleaningToDrawer(job))} />
      </div>
      <InternalMessagingPanel staffRole="studio_manager" currentUserName="Studio Manager" />
      <div className="grid gap-5 xl:grid-cols-2">
        <InteractiveTaskPanel staffRole="studio_manager" />
        <BufferRulesPanel onInspect={onInspect} />
      </div>
      <SecurityRiskPanel staffRole="studio_manager" />
      <ProducerModelPanel />
      <VerificationPanel records={verifications.items} isDemoData={verifications.isDemoData} onInspect={(record) => onInspect(verificationToDrawer(record))} />

      <ReminderOperationsPanel onInspect={onInspect} />
      <PaymentOverviewPanel onInspect={onInspect} />
      <PackagePricingAdminPanel onInspect={(packageId) => {
        const pkg = getPackagePricing(packageId);
        onInspect({
          id: packageId,
          kind: "package",
          title: pkg.packageName,
          subtitle: pkg.description,
          status: "editable",
          tags: [pkg.category],
          fields: [
            { label: "Duration", value: `${pkg.durationMinutes} minutes` },
            { label: "Full price", value: `£${pkg.fullPrice}` },
            { label: "Deposit", value: `£${pkg.depositAmount}` },
            { label: "Buffer", value: `${pkg.bufferMinutes} minutes` },
          ],
          history: [{ id: `${packageId}-manager`, actor: "Studio manager", action: "Package inspected", timestamp: "Now", detail: "Package opened from studio manager dashboard." }],
        });
      }} />
    </div>
  );
};

const ProducerDashboard = ({ userId, onInspect }: { userId?: string; onInspect: (item: OperationalDrawerData) => void }) => {
  const { assignments } = useProducerAssignments(userId);
  const assignedBookingId = assignments[0]?.booking_id;
  const displaySessions = ENABLE_DEMO_DATA ? MOCK_LIVE_SESSIONS : [];

  return (
    <div className="space-y-6">
      <StaffClockPanel staffRole="session_producer" />
      <StudioOpsSection title="Assigned Sessions" eyebrow="Producer view" icon={Radio}>
        {assignments.length === 0 && displaySessions.length === 0 ? (
          <StudioOpsEmpty>No sessions assigned yet. Sessions assigned to you will appear here.</StudioOpsEmpty>
        ) : (
          <div className="grid gap-3 xl:grid-cols-2">
            {displaySessions.map((session) => (
              <SessionTimerCard key={session.id} session={session} onInspect={(selected) => onInspect(sessionToDrawer(selected))} />
            ))}
          </div>
        )}
      </StudioOpsSection>
    <SupportRequirementsPanel requirements={ENABLE_DEMO_DATA ? MOCK_SUPPORT_REQUIREMENTS : []} isDemoData={ENABLE_DEMO_DATA} onInspect={onInspect} />
    <PackageVisibilityPanel audience="producer" packageId="recording-with-producer" />
    <PaymentOverviewPanel audience="producer" onInspect={onInspect} />
    <StatusControlPanel activeBookingId={assignedBookingId} />
      <div className="grid gap-5 xl:grid-cols-2">
        <InteractiveTaskPanel staffRole="session_producer" />
      </div>
      <InternalMessagingPanel staffRole="session_producer" currentUserName="Session Producer" />
      <StudioOpsSection title="Internal Notes" eyebrow="Private session memory" icon={ShieldCheck}>

        <textarea
          className="min-h-32 w-full rounded-2xl border border-border bg-background/60 p-4 text-sm text-foreground outline-none focus:border-primary/50"
          placeholder="Producer notes, takes, client preferences, file handoff notes..."
        />
        <p className="mt-3 text-xs text-muted-foreground">Notes save to <code className="text-xs bg-card/70 px-1 rounded">fg_session_notes</code> when a session is selected.</p>
      </StudioOpsSection>
    </div>
  );
};

const CleanerDashboard = ({ live, userId, onInspect }: { live: LiveDashboardData; userId?: string; onInspect: (item: OperationalDrawerData) => void }) => {
  const { tasks } = useCleaningTasks(userId);
  const myJobs = tasks.length
    ? tasks.map(adaptCleaningTask)
    : live.cleaningJobs.filter((job) => ["cleaning", "buffer_time"].includes(
        live.roomStatuses.find((r) => r.roomName === job.roomName)?.status ?? ""
      ));
  const myIncidents = live.incidents.filter(
    (i) => i.type === "equipment_issue" || i.type === "cleaning_issue"
  );
  const relevantRooms = live.roomStatuses.length
    ? live.roomStatuses.filter((r) => ["cleaning", "buffer_time", "in_session"].includes(r.status))
    : ENABLE_DEMO_DATA ? MOCK_ROOM_STATUSES.filter((r) => ["cleaning", "buffer_time", "in_session"].includes(r.status)) : [];

  return (
    <div className="space-y-6">
      <StaffClockPanel staffRole="cleaner" />
      <RoomStatusBoard rooms={relevantRooms} isDemoData={!live.roomStatuses.length && ENABLE_DEMO_DATA} onInspect={(room) => onInspect(roomToDrawer(room))} />
      <CleaningWorkflowPanel jobs={myJobs.length ? myJobs : ENABLE_DEMO_DATA ? MOCK_CLEANING_JOBS : []} isDemoData={!myJobs.length && ENABLE_DEMO_DATA} onInspect={(job) => onInspect(cleaningToDrawer(job))} />
      <InteractiveTaskPanel staffRole="cleaner" />
      <InternalMessagingPanel staffRole="cleaner" currentUserName="Cleaning Staff" />
      <IncidentPanel
        incidents={myIncidents.length ? myIncidents : ENABLE_DEMO_DATA ? MOCK_INCIDENTS.filter((i) => i.type === "equipment_issue" || i.type === "cleaning_issue") : []}
        isDemoData={!myIncidents.length && ENABLE_DEMO_DATA}
        onInspect={(incident) => onInspect(incidentToDrawer(incident))}
      />
    </div>

  );
};

const ClientDashboard = ({ onInspect }: { onInspect: (item: OperationalDrawerData) => void }) => (
  <div className="space-y-6">
    <div className="grid gap-5 xl:grid-cols-2">
      <UpcomingBookingsPanel role="client_artist" onInspect={onInspect} />
      <StudioOpsSection title="Session Confirmation" eyebrow="Client" icon={CalendarDays}>
        <div className="space-y-3 text-sm text-muted-foreground">
          <p>Your booking dashboard shows confirmed times, payment and deposit status, reminders, and package boundaries.</p>
          <p className="rounded-xl border border-amber-500/25 bg-amber-500/10 p-3 text-amber-100">
            Late arrival policy: session time starts at the booked time and still runs if you are not present.
          </p>
          <Button asChild className="font-bebas tracking-wider">
            <Link to="/book">Book another session</Link>
          </Button>
        </div>
      </StudioOpsSection>
    </div>
    <PackageVisibilityPanel audience="client" packageId="recording-with-producer" />
    <PaymentOverviewPanel audience="client" onInspect={onInspect} />
    <InternalMessagingPanel staffRole="client_artist" currentUserName="Artist Client" />
    <StudioOpsSection title="Contact + Support" eyebrow="Help" icon={CreditCard}>
      <div className="grid gap-3 sm:grid-cols-2">
        <StudioOpsCard>
          <p className="font-bebas text-2xl tracking-wide text-foreground">Booking support</p>
          <p className="text-sm text-muted-foreground">Use the support area for session changes, extras, or package questions.</p>
        </StudioOpsCard>
        <StudioOpsCard>
          <p className="font-bebas text-2xl tracking-wide text-foreground">Payment status</p>
          <p className="text-sm text-muted-foreground">Deposit and balance status connects to your booking record.</p>
        </StudioOpsCard>
      </div>
    </StudioOpsSection>
  </div>
);

const DashboardContent = ({ type, live, userId, onInspect }: { type: StudioRole; live: LiveDashboardData; userId?: string; onInspect: (item: OperationalDrawerData) => void }) => {
  if (type === "session_producer") return <ProducerDashboard userId={userId} onInspect={onInspect} />;
  if (type === "cleaner") return <CleanerDashboard live={live} userId={userId} onInspect={onInspect} />;
  if (type === "client_artist") return <ClientDashboard onInspect={onInspect} />;
  if (type === "studio_manager") return <StudioManagerDashboard live={live} onInspect={onInspect} />;
  return <AdminDashboard live={live} onInspect={onInspect} />;
};

const StudioOpsDashboard = ({ type }: { type: StudioRole }) => {
  const { studioRole, user } = useAuth();
  const location = useLocation();
  const [selectedItem, setSelectedItem] = useState<OperationalDrawerData | null>(null);

  useEffect(() => {
    if (type !== "client_artist" || !user) return;
    const params = new URLSearchParams(location.search);
    const bookingId = params.get("booking");
    if (params.get("payment") !== "cancelled" || !bookingId) return;

    void (async () => {
      const { error } = await supabase
        .from("bookings")
        .update({ status: "cancelled", payment_status: "failed", cancelled_at: new Date().toISOString() })
        .eq("id", bookingId)
        .eq("user_id", user.id)
        .eq("status", "pending_payment");

      if (error) {
        console.error("Could not release cancelled checkout booking:", error);
        return;
      }
      window.location.replace(location.pathname);
    })();
  }, [location.pathname, location.search, type, user?.id]);

  // Fetch live operational data
  const { tasks: cleaningTaskRows } = useCleaningTasks();
  const { incidents: incidentRows } = useIncidents();
  const { verifications: verificationRows } = useVerificationQueue();
  const { rooms: roomStatusRows } = useTodaysRoomStatus();

  const live: LiveDashboardData = useMemo(() => ({
    cleaningJobs: cleaningTaskRows.map(adaptCleaningTask),
    incidents: incidentRows.map(adaptIncident),
    verifications: verificationRows.map(adaptVerification),
    roomStatuses: roomStatusRows.map(adaptRoomStatus),
    hasLiveData: cleaningTaskRows.length > 0 || incidentRows.length > 0 || roomStatusRows.length > 0,
  }), [cleaningTaskRows, incidentRows, verificationRows, roomStatusRows]);

  const subtitle = useMemo(() => {
    if (type === "super_admin") return "Full studio command view across rooms, sessions, staff, incidents, verification, email workflows, and AI admin readiness.";
    if (type === "studio_manager") return "Daily operational control for rooms, bookings, producers, cleaning, verification, and task flow.";
    if (type === "session_producer") return "Assigned-session workspace with package boundaries, timers, notes, incidents, and overtime warnings.";
    if (type === "cleaner") return "Focused room-turnaround queue with checklists, issue reporting, and readiness controls.";
    return "Client booking, payment, package, policy, reminder, and support workspace.";
  }, [type]);

  return (
    <div className="fg-page-shell">
      <Navbar />
      <div className="grain-overlay" />
      <main className="container space-y-8 pt-24 pb-28 lg:pb-14">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <p className="mb-2 font-mono text-xs uppercase tracking-[0.3em] text-primary">{getStudioRoleLabel(type)}</p>
          <h1 className="font-bebas text-4xl tracking-wider text-foreground md:text-6xl">Studio Operating Dashboard</h1>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">{subtitle}</p>
          <p className="mt-3 text-xs text-muted-foreground">
            Active role: <span className="text-primary">{getStudioRoleLabel(studioRole)}</span>
            {live.hasLiveData && <span className="ml-3 text-emerald-400">· Operational data connected</span>}
          </p>
        </motion.div>

        <DashboardContent type={type} live={live} userId={user?.id} onInspect={setSelectedItem} />
      </main>
      <OperationalDetailDrawer
        item={selectedItem}
        open={Boolean(selectedItem)}
        onOpenChange={(open) => {
          if (!open) setSelectedItem(null);
        }}
        canEdit={type !== "client_artist"}
        onSaveUpdate={async ({ item, status }) => {
          if (item.kind !== "booking") return;
          const error = await updateBookingStatus(item.id, status);
          return error?.message;
        }}
      />
    </div>
  );
};

export default StudioOpsDashboard;
