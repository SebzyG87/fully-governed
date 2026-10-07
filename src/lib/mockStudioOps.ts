import type { BookingLifecycleStatus } from "@/lib/bookingLifecycle";
import type { VerificationStatus } from "@/lib/verification";
import type { RoomSupportRequirement } from "@/lib/studioOpsConfig";

export type RoomStatus =
  | "available"
  | "booked"
  | "in_session"
  | "buffer_time"
  | "cleaning"
  | "maintenance"
  | "locked"
  | "vip_session";

export type SessionTimerState =
  | "not_started"
  | "starting_soon"
  | "in_progress"
  | "ending_soon"
  | "overtime"
  | "completed";

export type TaskStatus = "to_do" | "in_progress" | "blocked" | "complete";
export type TaskPriority = "low" | "medium" | "high" | "urgent";
export type IncidentSeverity = "low" | "medium" | "high" | "critical";
export type IncidentType =
  | "late_arrival"
  | "no_show"
  | "damage"
  | "extra_guests"
  | "payment_issue"
  | "equipment_issue"
  | "behaviour_issue"
  | "cleaning_issue"
  | "other";

export interface StudioRoomStatus {
  id: string;
  roomName: string;
  status: RoomStatus;
  currentClient?: string;
  currentSession?: string;
  assignedProducer?: string;
  nextBooking?: string;
  timeRemaining?: string;
  cleaningStatus?: string;
}

export type OperationalPersonRole = "artist" | "producer" | "client" | "cleaner" | "engineer" | "admin";

export interface AuditEvent {
  id: string;
  actor: string;
  action: string;
  timestamp: string;
  detail: string;
}

export interface OperationalComment {
  id: string;
  author: string;
  timestamp: string;
  body: string;
}

export interface LinkedPerson {
  id: string;
  name: string;
  role: OperationalPersonRole;
}

export interface PaymentRecord {
  id: string;
  linkedSession: string;
  client: string;
  state: string;
  total: string;
  deposit: string;
  balance: string;
  refundState: string;
  reminderHistory: string[];
  notes: string;
  history: AuditEvent[];
}

export interface ReminderRecord {
  id: string;
  title: string;
  linkedSession: string;
  client: string;
  due: string;
  state: string;
  channel: string;
  history: AuditEvent[];
}

export interface OperationalProfile {
  id: string;
  name: string;
  role: OperationalPersonRole;
  status: string;
  tags: string[];
  contact: string;
  sessions: string[];
  notes: string[];
  paymentHistory: string[];
  attendance: string[];
  tasks: string[];
  metadata: Record<string, string>;
  history: AuditEvent[];
}

export interface LiveSession {
  id: string;
  artistName: string;
  artistId?: string;
  clientId?: string;
  roomName: string;
  roomId?: string;
  producer: string;
  producerId?: string;
  engineer?: string;
  engineerId?: string;
  cleaner?: string;
  cleanerId?: string;
  packageName: string;
  paymentStatus: string;
  depositStatus: string;
  status: BookingLifecycleStatus;
  timerState: SessionTimerState;
  startTime: string;
  endTime: string;
  timeRemaining: string;
  nextAction: string;
  noShowWarning?: boolean;
  overtimeRisk?: boolean;
  reminders?: ReminderRecord[];
  notes?: string[];
  attachments?: string[];
  tags?: string[];
  tasks?: StudioTask[];
  comments?: OperationalComment[];
  history?: AuditEvent[];
}

export interface StudioTask {
  id: string;
  title: string;
  assignedTo: string;
  assignedRole: string;
  linkedSession: string;
  dueTime: string;
  priority: TaskPriority;
  status: TaskStatus;
  notes: string;
}

export interface SessionSupportRequirement extends RoomSupportRequirement {
  id: string;
  linkedSession: string;
}

export interface TimelineEvent {
  id: string;
  label: string;
  time: string;
  status: "complete" | "current" | "upcoming";
}

export interface CleaningJob {
  id: string;
  roomName: string;
  linkedSession?: string;
  assignedTo?: string;
  sessionEnded: string;
  cleaningWindow: string;
  priority: TaskPriority;
  checklist: string[];
  issueNotes: string;
  history?: AuditEvent[];
}

export interface IncidentRecord {
  id: string;
  type: IncidentType;
  severity: IncidentSeverity;
  linkedSession: string;
  reportedBy: string;
  timestamp: string;
  notes: string;
}

export interface VerificationRecord {
  id: string;
  clientName: string;
  clientStatus: VerificationStatus;
  guestStatus: VerificationStatus;
  adminApproval: VerificationStatus;
  warning: string;
}

export const ROOM_STATUS_LABELS: Record<RoomStatus, string> = {
  available: "Available",
  booked: "Booked",
  in_session: "In session",
  buffer_time: "Buffer time",
  cleaning: "Cleaning",
  maintenance: "Maintenance",
  locked: "Locked",
  vip_session: "VIP session",
};

export const ROOM_STATUS_TONES: Record<RoomStatus, string> = {
  available: "border-emerald-500/25 bg-emerald-500/10 text-emerald-300",
  booked: "border-sky-500/25 bg-sky-500/10 text-sky-300",
  in_session: "border-primary/30 bg-primary/10 text-primary",
  buffer_time: "border-purple-500/25 bg-purple-500/10 text-purple-300",
  cleaning: "border-cyan-500/25 bg-cyan-500/10 text-cyan-300",
  maintenance: "border-orange-500/25 bg-orange-500/10 text-orange-300",
  locked: "border-red-500/25 bg-red-500/10 text-red-300",
  vip_session: "border-fuchsia-500/25 bg-fuchsia-500/10 text-fuchsia-300",
};

export const MOCK_ROOM_STATUSES: StudioRoomStatus[] = [
  {
    id: "room-a",
    roomName: "Studio 1B",
    status: "in_session",
    currentClient: "A. Carter",
    currentSession: "Recording with producer",
    assignedProducer: "Manny",
    nextBooking: "Content session · 18:00",
    timeRemaining: "42 min",
    cleaningStatus: "Turnaround required after session",
  },
  {
    id: "room-b",
    roomName: "Content Room",
    status: "buffer_time",
    currentClient: "Buffer after podcast booking",
    assignedProducer: "Unassigned",
    nextBooking: "Photo session · 16:30",
    timeRemaining: "18 min",
    cleaningStatus: "Light reset",
  },
  {
    id: "room-c",
    roomName: "Multi-use Room",
    status: "available",
    nextBooking: "No booking in next hour",
    timeRemaining: "Ready",
    cleaningStatus: "Clean",
  },
];

export const MOCK_OPERATIONAL_PROFILES: OperationalProfile[] = [
  {
    id: "artist-a-carter",
    name: "A. Carter",
    role: "artist",
    status: "On site",
    tags: ["returning artist", "late arrival watch", "recording"],
    contact: "a.carter@example.com",
    sessions: ["session-1", "FG-2026-0519-A"],
    notes: ["Prefers Studio 1B vocal chain.", "Usually books producer-supported sessions."],
    paymentHistory: ["FG-PAY-501 deposit paid", "FG-PAY-488 paid in full"],
    attendance: ["Today · checked in 14 minutes late", "12 May · on time"],
    tasks: ["Prepare file handoff notes", "Confirm overtime before extension"],
    metadata: { tier: "Family", risk: "Low", source: "Community referral" },
    history: [
      { id: "hist-artist-1", actor: "Front desk", action: "Check-in noted", timestamp: "Today · 15:14", detail: "Late arrival recorded against active session." },
      { id: "hist-artist-2", actor: "Manny", action: "Preference updated", timestamp: "12 May · 18:20", detail: "Added vocal chain preference to profile notes." },
    ],
  },
  {
    id: "producer-manny",
    name: "Manny",
    role: "producer",
    status: "Assigned",
    tags: ["producer", "studio 1b", "recording"],
    contact: "manny@example.com",
    sessions: ["session-1", "FG-2026-0518-C"],
    notes: ["Handles producer-supported recording and file handoff notes."],
    paymentHistory: ["Producer payout pending for session-1"],
    attendance: ["Today · active in Studio 1B", "18 May · completed 2 sessions"],
    tasks: ["Prepare Studio 1B file handoff notes"],
    metadata: { permissions: "Producer dashboard", currentRoom: "Studio 1B" },
    history: [
      { id: "hist-producer-1", actor: "Studio manager", action: "Assigned session", timestamp: "Today · 14:20", detail: "Assigned to A. Carter recording session." },
    ],
  },
  {
    id: "client-walkin",
    name: "Studio Walk-in",
    role: "client",
    status: "Pending verification",
    tags: ["new client", "content", "verification required"],
    contact: "walkin@example.com",
    sessions: ["session-2"],
    notes: ["Requested short-form setup and extra lighting."],
    paymentHistory: ["FG-PAY-502 deposit paid; balance pending"],
    attendance: ["No prior attendance recorded"],
    tasks: ["Confirm producer assignment", "Send reminder before 18:00"],
    metadata: { tier: "Customer", verification: "ID requested" },
    history: [
      { id: "hist-client-1", actor: "AI receptionist", action: "Reminder queued", timestamp: "Today · 13:00", detail: "SMS reminder queued for 17:15." },
    ],
  },
  {
    id: "cleaner-queue",
    name: "Turnaround Cleaner",
    role: "cleaner",
    status: "Unassigned",
    tags: ["cleaning", "room reset"],
    contact: "operations@example.com",
    sessions: ["cleaning-1", "cleaning-2"],
    notes: ["Assign named cleaner before end of live session."],
    paymentHistory: [],
    attendance: ["No active sign-in"],
    tasks: ["Reset Studio 1B", "Reset Content Room"],
    metadata: { queue: "Turnaround", escalation: "Studio manager" },
    history: [
      { id: "hist-cleaner-1", actor: "System", action: "Cleaning queue created", timestamp: "Today · 15:30", detail: "Content Room reset created after session end." },
    ],
  },
];

export const MOCK_LIVE_SESSIONS: LiveSession[] = [
  {
    id: "session-1",
    artistName: "A. Carter",
    artistId: "artist-a-carter",
    clientId: "artist-a-carter",
    roomName: "Studio 1B",
    roomId: "room-a",
    producer: "Manny",
    producerId: "producer-manny",
    engineer: "Tee",
    engineerId: "engineer-tee",
    cleaner: "Turnaround Cleaner",
    cleanerId: "cleaner-queue",
    packageName: "Recording With Producer",
    paymentStatus: "Deposit paid",
    depositStatus: "£40 deposit secured",
    status: "in_progress",
    timerState: "ending_soon",
    startTime: "15:00",
    endTime: "17:00",
    timeRemaining: "42 min",
    nextAction: "Warn client before overtime",
    overtimeRisk: true,
    reminders: [
      { id: "reminder-1", title: "Session starts soon", linkedSession: "session-1", client: "A. Carter", due: "Today · 14:00", state: "sent", channel: "SMS + email", history: [{ id: "reminder-h1", actor: "System", action: "Sent reminder", timestamp: "Today · 14:00", detail: "One-hour session reminder sent." }] },
    ],
    notes: ["Client arrived 14 minutes late.", "Confirm extension payment before overtime."],
    attachments: ["vocal-chain-photo.jpg", "signed-studio-policy.pdf"],
    tags: ["live", "overtime risk", "producer-supported"],
    comments: [
      { id: "comment-1", author: "Front desk", timestamp: "Today · 15:14", body: "Late arrival logged. Keep session timer from booked start." },
    ],
    history: [
      { id: "hist-session-1", actor: "Front desk", action: "Checked in", timestamp: "Today · 15:14", detail: "Status changed from confirmed to checked_in." },
      { id: "hist-session-2", actor: "Manny", action: "Started session", timestamp: "Today · 15:18", detail: "Session marked in_progress." },
      { id: "hist-session-3", actor: "System", action: "Overtime warning", timestamp: "Today · 16:30", detail: "30 minute warning shown to producer." },
    ],
  },
  {
    id: "session-2",
    artistName: "Studio Walk-in",
    artistId: "client-walkin",
    clientId: "client-walkin",
    roomName: "Content Room",
    roomId: "room-b",
    producer: "Pending assignment",
    packageName: "Content Session",
    paymentStatus: "Pending balance",
    depositStatus: "Deposit paid",
    status: "confirmed",
    timerState: "starting_soon",
    startTime: "18:00",
    endTime: "19:30",
    timeRemaining: "Starts soon",
    nextAction: "Confirm producer assignment",
    noShowWarning: true,
    reminders: [
      { id: "reminder-2", title: "Balance due before handoff", linkedSession: "session-2", client: "Studio Walk-in", due: "Today · 17:15", state: "queued", channel: "SMS", history: [{ id: "reminder-h2", actor: "Studio manager", action: "Queued reminder", timestamp: "Today · 13:00", detail: "Payment reminder queued before arrival." }] },
    ],
    notes: ["New client; verify ID before late session confirmation.", "Extra lighting requested."],
    attachments: ["lighting-reference.png"],
    tags: ["new client", "balance due", "verification"],
    comments: [
      { id: "comment-2", author: "Studio manager", timestamp: "Today · 13:05", body: "Needs producer assignment before client arrival." },
    ],
    history: [
      { id: "hist-session-4", actor: "AI receptionist", action: "Booking created", timestamp: "Today · 10:05", detail: "Content session entered from enquiry." },
      { id: "hist-session-5", actor: "Client", action: "Deposit paid", timestamp: "Today · 10:07", detail: "Deposit recorded against booking." },
    ],
  },
];

export const MOCK_TASKS: StudioTask[] = [
  {
    id: "task-1",
    title: "Confirm producer for 18:00 content session",
    assignedTo: "Studio manager",
    assignedRole: "studio_manager",
    linkedSession: "Content Room · 18:00",
    dueTime: "Today · 16:45",
    priority: "high",
    status: "to_do",
    notes: "Client requested short-form setup and extra lighting.",
  },
  {
    id: "task-2",
    title: "Prepare Studio 1B file handoff notes",
    assignedTo: "Manny",
    assignedRole: "session_producer",
    linkedSession: "A. Carter recording session",
    dueTime: "Before completion",
    priority: "medium",
    status: "in_progress",
    notes: "Capture final take list and follow-up mix request.",
  },
  {
    id: "task-3",
    title: "Monitor podcast session from Editing Room",
    assignedTo: "Studio manager",
    assignedRole: "studio_manager",
    linkedSession: "Podcast buffer",
    dueTime: "Today · 16:10",
    priority: "high",
    status: "to_do",
    notes: "Editing Room should be available for monitoring, recording support, or technical help.",
  },
];

export const MOCK_SUPPORT_REQUIREMENTS: SessionSupportRequirement[] = [
  {
    id: "support-1",
    linkedSession: "Podcast Room · 16:00",
    mainRoom: "Podcast Room",
    supportRoom: "Editing Room",
    supportType: "monitoring",
    assignedStaff: "Optional",
    status: "required",
    notes: "Monitor levels and recording status from the editing room; assign producer/tech if the client requests live support.",
  },
];

export const MOCK_TIMELINE: TimelineEvent[] = [
  { id: "tl-1", label: "Booking confirmed", time: "10:05", status: "complete" },
  { id: "tl-2", label: "Deposit paid", time: "10:07", status: "complete" },
  { id: "tl-3", label: "Reminder sent", time: "13:00", status: "complete" },
  { id: "tl-4", label: "Session started", time: "15:00", status: "current" },
  { id: "tl-5", label: "Cleaning assigned", time: "17:00", status: "upcoming" },
  { id: "tl-6", label: "Completed", time: "17:15", status: "upcoming" },
];

export const MOCK_CLEANING_JOBS: CleaningJob[] = [
  {
    id: "cleaning-1",
    roomName: "Studio 1B",
    linkedSession: "session-1",
    assignedTo: "Turnaround Cleaner",
    sessionEnded: "17:00",
    cleaningWindow: "17:00-18:00",
    priority: "high",
    checklist: ["Remove rubbish", "Reset furniture", "Check microphones", "Check lights", "Report damage", "Mark room ready"],
    issueNotes: "Check mic stand in corner before next booking.",
    history: [
      { id: "hist-cleaning-1", actor: "System", action: "Created cleaning task", timestamp: "Today · 16:30", detail: "Turnaround scheduled from live Studio 1B session." },
      { id: "hist-cleaning-2", actor: "Front desk", action: "Flagged equipment check", timestamp: "Today · 16:42", detail: "Mic stand check added before room ready." },
    ],
  },
  {
    id: "cleaning-2",
    roomName: "Content Room",
    linkedSession: "session-2",
    assignedTo: "Unassigned",
    sessionEnded: "15:30",
    cleaningWindow: "15:30-16:30",
    priority: "medium",
    checklist: ["Reset tripod area", "Wipe surfaces", "Check lights", "Remove props", "Mark room ready"],
    issueNotes: "Client left props on side table.",
    history: [
      { id: "hist-cleaning-3", actor: "Cleaner", action: "Issue noted", timestamp: "Today · 15:50", detail: "Props left on side table." },
    ],
  },
];

export const MOCK_PAYMENT_RECORDS: PaymentRecord[] = [
  {
    id: "payment-1",
    linkedSession: "session-1",
    client: "A. Carter",
    state: "Deposit paid · balance due if overtime starts",
    total: "£120",
    deposit: "£40",
    balance: "£80",
    refundState: "No refund requested",
    reminderHistory: ["Deposit receipt sent Today · 10:07", "Overtime payment warning shown Today · 16:30"],
    notes: "Admin can update status when manual bank transfer or Stripe webhook confirms payment.",
    history: [
      { id: "hist-pay-1", actor: "System", action: "Deposit recorded", timestamp: "Today · 10:07", detail: "Payment state moved to deposit_paid." },
      { id: "hist-pay-2", actor: "Manny", action: "Overtime risk flagged", timestamp: "Today · 16:30", detail: "Balance reminder required before extension." },
    ],
  },
  {
    id: "payment-2",
    linkedSession: "session-2",
    client: "Studio Walk-in",
    state: "Balance due before file handoff",
    total: "£95",
    deposit: "£30",
    balance: "£65",
    refundState: "No refund requested",
    reminderHistory: ["Payment reminder queued Today · 17:15"],
    notes: "New client. Do not release files until balance is marked paid.",
    history: [
      { id: "hist-pay-3", actor: "Client", action: "Deposit paid", timestamp: "Today · 10:07", detail: "Deposit received for content session." },
    ],
  },
];

export const MOCK_REMINDER_RECORDS: ReminderRecord[] = [
  {
    id: "reminder-ops-1",
    title: "Confirm producer assignment",
    linkedSession: "session-2",
    client: "Studio Walk-in",
    due: "Today · 16:45",
    state: "open",
    channel: "Internal task",
    history: [
      { id: "hist-rem-1", actor: "Studio manager", action: "Created reminder", timestamp: "Today · 13:05", detail: "Producer still unassigned for 18:00 content booking." },
    ],
  },
  {
    id: "reminder-ops-2",
    title: "Send balance reminder",
    linkedSession: "session-2",
    client: "Studio Walk-in",
    due: "Today · 17:15",
    state: "queued",
    channel: "SMS",
    history: [
      { id: "hist-rem-2", actor: "AI receptionist", action: "Queued reminder", timestamp: "Today · 13:00", detail: "Balance reminder queued before arrival." },
    ],
  },
];

export const MOCK_INCIDENTS: IncidentRecord[] = [
  {
    id: "incident-1",
    type: "late_arrival",
    severity: "medium",
    linkedSession: "A. Carter recording session",
    reportedBy: "Front desk",
    timestamp: "Today · 15:14",
    notes: "Client arrived 14 minutes late. Session timer continued from booked start.",
  },
  {
    id: "incident-2",
    type: "equipment_issue",
    severity: "low",
    linkedSession: "Content Room podcast",
    reportedBy: "Cleaner",
    timestamp: "Today · 15:50",
    notes: "One XLR cable needs replacing before next content booking.",
  },
];

export const MOCK_VERIFICATIONS: VerificationRecord[] = [
  {
    id: "verify-1",
    clientName: "New late-night client",
    clientStatus: "required",
    guestStatus: "not_required",
    adminApproval: "pending",
    warning: "Unknown client. ID verification should be requested before confirmation.",
  },
  {
    id: "verify-2",
    clientName: "Returning artist",
    clientStatus: "verified",
    guestStatus: "not_required",
    adminApproval: "verified",
    warning: "No action needed.",
  },
];
