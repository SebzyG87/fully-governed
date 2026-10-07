export const BOOKING_POLICY = {
  depositRequired: true,
  balanceDueHours: 48,
  immediateFullPaymentHours: 48,
  firstRescheduleNoticeHours: 24,
  secondRescheduleRule: "Only approve if the original slot is rebooked or management accepts the loss.",
  refundRule: "Refunds must be reviewed against the signed booking policy, payment status, notice period, and room rebooking outcome.",
  overtimeRule: "Overtime must be approved before the booked end time and charged before the room remains in use.",
} as const;

export type BookingPaymentRequirement = "deposit" | "full";

export const hoursUntil = (dateIso: string, now = new Date()) => {
  const target = new Date(dateIso).getTime();
  return (target - now.getTime()) / (1000 * 60 * 60);
};

export const getBookingPaymentRequirement = (startTimeIso: string, now = new Date()): BookingPaymentRequirement =>
  hoursUntil(startTimeIso, now) <= BOOKING_POLICY.immediateFullPaymentHours ? "full" : "deposit";

export const getBalanceDueAt = (startTimeIso: string) =>
  new Date(new Date(startTimeIso).getTime() - BOOKING_POLICY.balanceDueHours * 60 * 60 * 1000);

export const canRequestFirstReschedule = (startTimeIso: string, now = new Date()) =>
  hoursUntil(startTimeIso, now) >= BOOKING_POLICY.firstRescheduleNoticeHours;

export const getRescheduleGuidance = (startTimeIso: string, amendmentCount = 0, now = new Date()) => {
  if (amendmentCount <= 0) {
    return canRequestFirstReschedule(startTimeIso, now)
      ? "First reschedule allowed if the request is approved by staff."
      : "First reschedule is inside the 24 hour notice window and needs management review.";
  }

  return BOOKING_POLICY.secondRescheduleRule;
};
