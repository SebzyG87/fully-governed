import { describe, expect, it } from "vitest";
import { getBookingPrice } from "./bookingPricing";

describe("getBookingPrice", () => {
  it("uses the standard music room rate and flat engineer add-on", () => {
    expect(getBookingPrice("Recording Studio", 4)).toBe(50);
    expect(getBookingPrice("Recording Studio", 4, true)).toBe(75);
  });

  it("selects the podcast rate only for podcast bookings", () => {
    expect(getBookingPrice("Multi-Use Room", 2, false, "Podcast")).toBe(99.98);
    expect(getBookingPrice("Multi-Use Room", 2)).toBe(140);
  });

  it("does not turn unsupported rooms into free bookings", () => {
    expect(getBookingPrice("Unknown room", 2)).toBeNull();
    expect(getBookingPrice("Recording Studio", 0)).toBeNull();
  });
});
