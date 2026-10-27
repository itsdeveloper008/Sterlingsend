import Image from "next/image";
import { existsSync } from "node:fs";
import path from "node:path";
import { cn } from "@/lib/utils";

const PUBLIC = path.join(process.cwd(), "public", "images");

function hasFile(name: string) {
  try {
    return existsSync(path.join(PUBLIC, name));
  } catch {
    return false;
  }
}

/** Clay/glass invoice illustration when the photo file is missing. */
function InvoiceIllustration({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "glass relative flex h-full w-full items-center justify-center overflow-hidden rounded-2xl",
        className,
      )}
      aria-hidden
    >
      <div className="clay absolute inset-6 opacity-80" />
      <div className="relative z-[1] w-[58%] max-w-[220px] rounded-xl bg-white p-3 shadow-[0_12px_28px_rgba(15,23,42,.1)]">
        <div className="mb-2 h-1.5 w-10 rounded-full bg-[var(--brand-600)]" />
        <div className="mb-3 h-2 w-16 rounded bg-[#E2E8F0]" />
        <div className="space-y-1.5">
          <div className="h-1.5 w-full rounded bg-[#F1F5F9]" />
          <div className="h-1.5 w-[85%] rounded bg-[#F1F5F9]" />
          <div className="h-1.5 w-[70%] rounded bg-[#F1F5F9]" />
        </div>
        <div className="mt-3 ml-auto h-6 w-16 rounded-lg bg-[var(--mint-100)]" />
      </div>
    </div>
  );
}

type Props = {
  /** Filename under public/images/ */
  file: string;
  alt: string;
  /** Aspect ratio as CSS, e.g. "4 / 3" */
  aspect: string;
  className?: string;
  priority?: boolean;
};

/**
 * Atmosphere photo slot. Uses next/image when the file exists; otherwise a
 * clay/glass invoice illustration (never a broken icon or empty box).
 * Server component — file existence checked on disk.
 */
export function AtmosphereImage({
  file,
  alt,
  aspect,
  className,
  priority = false,
}: Props) {
  const present = hasFile(file);
  return (
    <div
      className={cn("relative w-full overflow-hidden rounded-2xl", className)}
      style={{ aspectRatio: aspect }}
    >
      {present ? (
        <Image
          src={`/images/${file}`}
          alt={alt}
          fill
          sizes="(max-width: 768px) 100vw, 560px"
          className="object-cover"
          priority={priority}
          loading={priority ? undefined : "lazy"}
          placeholder="blur"
          blurDataURL="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjYiPjxyZWN0IHdpZHRoPSI4IiBoZWlnaHQ9IjYiIGZpbGw9IiNlY2ZkZjUiLz48L3N2Zz4="
        />
      ) : (
        <InvoiceIllustration className="absolute inset-0" />
      )}
    </div>
  );
}
