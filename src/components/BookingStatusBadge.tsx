import { BOOKING_STATUS_META, normaliseBookingStatus } from "@/lib/bookingLifecycle";
import { cn } from "@/lib/utils";

const BookingStatusBadge = ({ status, className }: { status?: string | null; className?: string }) => {
  const normalised = normaliseBookingStatus(status);
  const meta = BOOKING_STATUS_META[normalised];

  return (
    <span className={cn("inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-mono", meta.tone, className)}>
      {meta.label}
    </span>
  );
};

export default BookingStatusBadge;

