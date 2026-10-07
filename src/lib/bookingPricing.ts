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
    hourlyRate = 12.5;
  } else if (room.includes("multi-use") && session.includes("podcast")) {
    hourlyRate = 49.99;
  } else if (room.includes("multi-use")) {
    hourlyRate = 70;
  } else if (room.includes("content creation")) {
    hourlyRate = 45;
  } else {
    return null;
  }

  return Number((hourlyRate * durationHours + (hasEngineer ? 25 : 0)).toFixed(2));
};
