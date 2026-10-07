import { addMinutes, isBefore, isEqual } from "date-fns";
import type { BookingLifecycleStatus } from "@/lib/bookingLifecycle";
import { BLOCKING_BOOKING_STATUSES } from "@/lib/bookingLifecycle";
import { getPlannedRoomBufferMinutes } from "@/lib/studioOpsConfig";

export const BUFFER_OPTIONS_MINUTES = [0, 20, 30, 60] as const;
export type BufferMinutes = typeof BUFFER_OPTIONS_MINUTES[number];

export const DEFAULT_BUFFER_MINUTES: BufferMinutes = 60;

export { getPlannedRoomBufferMinutes };

export interface BookingWindow {
  start_time: string;
  end_time: string;
  status?: string | null;
}

export const getBufferedEndTime = (endTime: Date | string, bufferMinutes: number = DEFAULT_BUFFER_MINUTES) =>
  addMinutes(typeof endTime === "string" ? new Date(endTime) : endTime, bufferMinutes);

export const isBlockingStatus = (status: string | null | undefined) =>
  BLOCKING_BOOKING_STATUSES.includes((status || "confirmed") as BookingLifecycleStatus);

export const bookingOverlapsBufferedWindow = (
  candidateStart: Date,
  candidateEnd: Date,
  booking: BookingWindow,
  bufferMinutes: number = DEFAULT_BUFFER_MINUTES
) => {
  if (!isBlockingStatus(booking.status)) return false;
  const bookingStart = new Date(booking.start_time);
  const bookingEndWithBuffer = getBufferedEndTime(booking.end_time, bufferMinutes);
  return isBefore(candidateStart, bookingEndWithBuffer) && isBefore(bookingStart, candidateEnd);
};

export const getNextAvailableAfterBuffer = (bookingEnd: Date | string, bufferMinutes: number = DEFAULT_BUFFER_MINUTES) =>
  getBufferedEndTime(bookingEnd, bufferMinutes);

export const canStartAfterBufferedBooking = (
  candidateStart: Date,
  bookingEnd: Date | string,
  bufferMinutes: number = DEFAULT_BUFFER_MINUTES
) => {
  const nextAvailable = getNextAvailableAfterBuffer(bookingEnd, bufferMinutes);
  return isEqual(candidateStart, nextAvailable) || !isBefore(candidateStart, nextAvailable);
};
