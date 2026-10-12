import { useEffect, useRef, useState } from "react";
import type { Viewer } from "@photo-sphere-viewer/core";
import "@photo-sphere-viewer/core/index.css";

export const PanoramaViewer = ({ src, label, lazy = false }: { src: string; label: string; lazy?: boolean }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let cancelled = false;
    let viewer: Viewer | undefined;
    setStatus("loading");

    const loadViewer = async () => {
      try {
        const { Viewer } = await import("@photo-sphere-viewer/core");
        if (cancelled) return;
        viewer = new Viewer({
          container,
          panorama: src,
          navbar: ["zoom", "fullscreen"],
          defaultZoomLvl: 50,
          keyboard: "fullscreen",
          // Let visitors scroll naturally past the stacked room views.
          touchmoveTwoFingers: lazy,
          mousewheelCtrlKey: lazy,
        });
        viewer.addEventListener("ready", () => { if (!cancelled) setStatus("ready"); });
        viewer.addEventListener("panorama-error", () => { if (!cancelled) setStatus("error"); });
      } catch {
        if (!cancelled) setStatus("error");
      }
    };

    let observer: IntersectionObserver | undefined;
    if (lazy && "IntersectionObserver" in window) {
      observer = new IntersectionObserver((entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          observer?.disconnect();
          void loadViewer();
        }
      }, { rootMargin: "240px" });
      observer.observe(container);
    } else {
      void loadViewer();
    }

    return () => {
      cancelled = true;
      observer?.disconnect();
      viewer?.destroy();
    };
  }, [src, lazy]);

  return (
    <div className="relative">
      <div ref={containerRef} className="h-[min(65vh,640px)] min-h-[320px] w-full" role="img" aria-label={`${label} interactive 360-degree panorama`} />
      {status !== "ready" && (
        <p role="status" className="pointer-events-none absolute inset-0 flex items-center justify-center px-6 text-center text-base text-white/80">
          {status === "error" ? "The 360° view could not load. Please refresh the page to try again." : "Loading 360° view…"}
        </p>
      )}
    </div>
  );
};
