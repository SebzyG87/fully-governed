import { useEffect, useState, type ImgHTMLAttributes } from "react";
import { useWebsiteMedia } from "@/hooks/useWebsiteMedia";

interface WebsiteImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> {
  slotKey: string;
  fallback: string;
}

export const WebsiteImage = ({ slotKey, fallback, onError, ...props }: WebsiteImageProps) => {
  const src = useWebsiteMedia(slotKey, fallback);
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  useEffect(() => setFailedSrc(null), [src]);

  return (
    <img
      {...props}
      src={failedSrc === src ? fallback : src}
      onError={(event) => {
        setFailedSrc(src);
        onError?.(event);
      }}
    />
  );
};
