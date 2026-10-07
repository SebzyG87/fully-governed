export type EmailAudience = "client" | "admin" | "producer" | "cleaner";

export interface EmailWorkflowTemplate {
  key: string;
  audience: EmailAudience;
  subject: string;
  purpose: string;
  trigger: string;
  bodyNote: string;
}

export const EMAIL_WORKFLOW_TEMPLATES: EmailWorkflowTemplate[] = [
  {
    key: "client_booking_confirmation",
    audience: "client",
    subject: "Your Fully Governed booking is confirmed",
    purpose: "Confirm booking details and expectations.",
    trigger: "Booking moves to confirmed/deposit_paid.",
    bodyNote: "Include room, time, package, balance, address, and arrival instructions.",
  },
  {
    key: "client_payment_confirmation",
    audience: "client",
    subject: "Payment received for your studio session",
    purpose: "Confirm deposit or full payment.",
    trigger: "Stripe payment/deposit succeeds.",
    bodyNote: "Include amount paid, outstanding balance, and refund/cancellation terms.",
  },
  {
    key: "client_session_reminder",
    audience: "client",
    subject: "Reminder: your session is coming up",
    purpose: "Reduce late arrivals and no-shows.",
    trigger: "Configured reminder window before start time.",
    bodyNote: "Include booked time, address, package, and what to bring.",
  },
  {
    key: "client_session_started",
    audience: "client",
    subject: "Your booked session time has started",
    purpose: "Make late/no-show timing and payment usage clear.",
    trigger: "Booking moves to in_progress.",
    bodyNote: "Your booked session time has started. If you are not present, the session time is still running and your deposit/payment is being used.",
  },
  {
    key: "client_session_completed",
    audience: "client",
    subject: "Your Fully Governed session is complete",
    purpose: "Close session, request review, and explain next steps.",
    trigger: "Booking moves to completed.",
    bodyNote: "Include file handoff notes, review link, and future booking CTA.",
  },
  {
    key: "admin_new_booking",
    audience: "admin",
    subject: "New studio booking received",
    purpose: "Alert operations team.",
    trigger: "Booking created.",
    bodyNote: "Include client, room, package, payment state, verification state, and notes.",
  },
  {
    key: "admin_verification_required",
    audience: "admin",
    subject: "Verification required for booking",
    purpose: "Prompt manual review.",
    trigger: "Booking moves to verification_required or verification_pending.",
    bodyNote: "Include uploaded verification status and review controls.",
  },
  {
    key: "producer_assigned_session",
    audience: "producer",
    subject: "You have been assigned a session",
    purpose: "Send producer package details and timing.",
    trigger: "Producer assignment created.",
    bodyNote: "Include client, package, included/excluded services, extras, notes, and overtime rules.",
  },
  {
    key: "cleaner_task_assigned",
    audience: "cleaner",
    subject: "Room cleaning assigned",
    purpose: "Alert cleaner when room needs turnaround.",
    trigger: "Booking moves to needs_cleaning or cleaning task created.",
    bodyNote: "Include room, due time, checklist, and photo requirement if enabled.",
  },
];

