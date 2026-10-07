export type StaffTaskTemplate = {
  id: string;
  title: string;
  assignedRole: string;
  taskCategory: "daily_checklist" | "session_preparation" | "session_breakdown" | "producer" | "cleaner" | "staff";
  priority: "low" | "medium" | "high" | "urgent";
  dueLabel: string;
  notes: string;
  checklist: string[];
};

export const STAFF_TASK_TEMPLATES: StaffTaskTemplate[] = [
  {
    id: "daily-opening",
    title: "Daily opening checklist",
    assignedRole: "studio_manager",
    taskCategory: "daily_checklist",
    priority: "high",
    dueLabel: "Start of day",
    notes: "Complete before first client arrives.",
    checklist: ["Check calendar", "Check rooms", "Check toilets", "Check bins", "Check payment/admin inbox", "Check incident log"],
  },
  {
    id: "session-prep",
    title: "Session preparation checklist",
    assignedRole: "staff",
    taskCategory: "session_preparation",
    priority: "high",
    dueLabel: "30 minutes before session",
    notes: "Prepare room and confirm support needs before client arrival.",
    checklist: ["Confirm booking paid", "Confirm room setup", "Check microphones", "Check headphones", "Check cameras/lights", "Confirm engineer/producer assignment"],
  },
  {
    id: "session-breakdown",
    title: "Session breakdown checklist",
    assignedRole: "staff",
    taskCategory: "session_breakdown",
    priority: "high",
    dueLabel: "Immediately after session",
    notes: "Close session, capture issues, and reset the room.",
    checklist: ["Save/handoff files", "Check overtime", "Log client notes", "Report damage", "Reset equipment", "Hand room to cleaner"],
  },
  {
    id: "cleaner-room-reset",
    title: "Cleaner room reset",
    assignedRole: "cleaner",
    taskCategory: "cleaner",
    priority: "medium",
    dueLabel: "Before next booking",
    notes: "Mark complete only when the room is ready to sell again.",
    checklist: ["Remove rubbish", "Wipe surfaces", "Reset furniture", "Check floor", "Restock essentials", "Mark room ready"],
  },
  {
    id: "producer-session-support",
    title: "Producer session support",
    assignedRole: "producer",
    taskCategory: "producer",
    priority: "medium",
    dueLabel: "During session",
    notes: "Use when the client has selected paid producer or engineer support.",
    checklist: ["Confirm creative brief", "Check references", "Support recording", "Export rough bounce", "Log follow-up actions"],
  },
  {
    id: "incident-review",
    title: "Incident or risk review",
    assignedRole: "management",
    taskCategory: "staff",
    priority: "urgent",
    dueLabel: "Same day",
    notes: "Use for damage, behaviour, safety, payment, or ban review workflows.",
    checklist: ["Record facts", "Attach evidence", "Review client history", "Decide action", "Log outcome"],
  },
];
