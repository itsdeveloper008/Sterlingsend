import Image from "next/image";
import { cn } from "@/lib/utils";

/** Presentational marketing screenshot - not connected to app state. */
export function MarketingMockupImage({
  src,
  alt,
  width,
  height,
  priority = false,
  className,
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
  priority?: boolean;
  className?: string;
}) {
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      priority={priority}
      className={cn("h-auto w-full", className)}
    />
  );
}
