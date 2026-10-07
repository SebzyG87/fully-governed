export const BOOKING_STATUSES = [
  "pending_payment",
  "deposit_paid",
  "confirmed",
  "verification_required",
  "verification_pending",
  "ready",
  "checked_in",
  "in_progress",
  "completed",
  "cancelled",
  "no_show",
  "needs_cleaning",
  "cleaned",
] as const;

export type BookingLifecycleStatus = typeof BOOKING_STATUSES[number];

export const BLOCKING_BOOKING_STATUSES: BookingLifecycleStatus[] = [
  "pending_payment",
  "deposit_paid",
  "confirmed",
  "verification_required",
  "verification_pending",
  "ready",
  "checked_in",
  "in_progress",
  "needs_cleaning",
];

export const BOOKING_STATUS_META: Record<BookingLifecycleStatus, { label: string; tone: string; description: string }> = {
  pending_payment: {
    label: "Pending payment",
    tone: "text-amber-300 bg-amber-500/10 border-amber-500/25",
    description: "Booking request exists but payment has not been completed.",
  },
  deposit_paid: {
    label: "Deposit paid",
    tone: "text-sky-300 bg-sky-500/10 border-sky-500/25",
    description: "Deposit is paid and the session is awaiting final confirmation.",
  },
  confirmed: {
    label: "Confirmed",
    tone: "text-emerald-300 bg-emerald-500/10 border-emerald-500/25",
    description: "Session is confirmed and blocks the room calendar.",
  },
  verification_required: {
    label: "Verification required",
    tone: "text-orange-300 bg-orange-500/10 border-orange-500/25",
    description: "Client or guest verification must be requested before the session.",
  },
  verification_pending: {
    label: "Verification pending",
    tone: "text-orange-300 bg-orange-500/10 border-orange-500/25",
    description: "Verification has been submitted and is waiting for review.",
  },
  ready: {
    label: "Ready",
    tone: "text-lime-300 bg-lime-500/10 border-lime-500/25",
    description: "Everything is cleared and the room/team can prepare.",
  },
  checked_in: {
    label: "Checked in",
    tone: "text-blue-300 bg-blue-500/10 border-blue-500/25",
    description: "Client has arrived and has been checked in.",
  },
  in_progress: {
    label: "In progress",
    tone: "text-primary bg-primary/10 border-primary/25",
    description: "The booked session time is currently running.",
  },
  completed: {
    label: "Completed",
    tone: "text-muted-foreground bg-muted/30 border-border",
    description: "Session is completed and can move to review/invoice follow-up.",
  },
  cancelled: {
    label: "Cancelled",
    tone: "text-destructive bg-destructive/10 border-destructive/25",
    description: "Session has been cancelled.",
  },
  no_show: {
    label: "No-show",
    tone: "text-red-300 bg-red-500/10 border-red-500/25",
    description: "Client did not arrive and the booked session time was still used.",
  },
  needs_cleaning: {
    label: "Needs cleaning",
    tone: "text-purple-300 bg-purple-500/10 border-purple-500/25",
    description: "Session is finished and the room must be turned around.",
  },
  cleaned: {
    label: "Cleaned",
    tone: "text-emerald-300 bg-emerald-500/10 border-emerald-500/25",
    description: "Cleaner has completed room turnaround.",
  },
};

export const normaliseBookingStatus = (status: string | null | undefined): BookingLifecycleStatus => {
  if (status && BOOKING_STATUSES.includes(status as BookingLifecycleStatus)) {
    return status as BookingLifecycleStatus;
  }
  if (status === "complete") return "completed";
  return "confirmed";
};

