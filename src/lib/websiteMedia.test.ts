import { describe, expect, it } from "vitest";
import { getRoomMediaSlots, roomGalleryDefaults, websiteMediaSlots } from "@/lib/websiteMedia";

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

  it("keeps the gallery-only name for room 2 separate from the site room name", () => {
    expect(roomGalleryDefaults.content.title).toBe("Room 2 · Production Workshop");
    expect(websiteMediaSlots.find((slot) => slot.key === "room.content.cover")?.label).toContain("Content Creation Centre");
  });

  it("documents the site pages that use each managed photo", () => {
    expect(websiteMediaSlots.every((slot) => slot.page.length > 0)).toBe(true);
  });
});
