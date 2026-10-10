import { describe, expect, it } from "vitest";
import { getRoomMediaSlots, websiteMediaSlots } from "@/lib/websiteMedia";

describe("website media slots", () => {
  it("has a cover and 360 gallery image for each of the three rooms", () => {
    for (const room of ["recording", "multi-use", "content"] as const) {
      const media = getRoomMediaSlots(room);
      expect(media.cover.fallback).toMatch(/\.jpeg$/);
      expect(media.gallery.length).toBeGreaterThan(0);
      expect(media.gallery.every((slot) => slot.kind === "panorama")).toBe(true);
    }
  });

  it("uses unique media keys", () => {
    const keys = websiteMediaSlots.map((slot) => slot.key);
    expect(new Set(keys).size).toBe(keys.length);
  });
});
