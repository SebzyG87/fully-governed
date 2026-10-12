import { useEffect, useRef } from "react";
import { Viewer } from "@photo-sphere-viewer/core";
import "@photo-sphere-viewer/core/index.css";

export const PanoramaViewer = ({ src, label }: { src: string; label: string }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const viewer = new Viewer({
      container: containerRef.current,
      panorama: src,
      navbar: ["zoom", "fullscreen"],
      defaultZoomLvl: 50,
      keyboard: "always",
    });

    return () => viewer.destroy();
  }, [src]);

  return <div ref={containerRef} className="h-[min(72vh,760px)] min-h-[360px] w-full" role="img" aria-label={`${label} interactive 360-degree panorama`} />;
};
