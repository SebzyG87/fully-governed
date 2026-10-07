import { studioRates } from "@/lib/studioRates";

export const getBookingPrice = (
  roomName: string,
  durationHours: number,
  hasEngineer = false,
  sessionType = "",
): number | null => {
  if (!Number.isFinite(durationHours) || durationHours <= 0) return null;

  const room = roomName.toLowerCase();
  const session = sessionType.toLowerCase();
  let hourlyRate: number;

  if (room.includes("recording studio")) {
    hourlyRate = studioRates.recordingHourly;
  } else if (room.includes("multi-use") && session.includes("podcast")) {
    hourlyRate = studioRates.podcastSelfServiceHourly;
  } else if (room.includes("multi-use")) {
    hourlyRate = studioRates.videoSelfOperatedHourly;
  } else if (room.includes("content creation")) {
    hourlyRate = studioRates.streamRoomHourly;
  } else {
    return null;
  }

  return Number((hourlyRate * durationHours + (hasEngineer ? studioRates.engineerAddOn : 0)).toFixed(2));
};
