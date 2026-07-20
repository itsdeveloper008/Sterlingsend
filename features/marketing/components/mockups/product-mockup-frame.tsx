import { cn } from "@/lib/utils";
import { MarketingMockupImage } from "@/features/marketing/components/mockups/marketing-mockup-image";

export function ProductMockupFrame({
  src,
  alt,
  width,
  height,
  url = "app.sterlingsend.com",
  className,
  priority = false,
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
  url?: string;
  className?: string;
  priority?: boolean;
}) {
  return (
    <div className={cn("marketing-mockup", className)}>
      <div className="marketing-browser-bar">
        <span className="marketing-browser-dot bg-[#FCA5A5]" />
        <span className="marketing-browser-dot bg-[#FCD34D]" />
        <span className="marketing-browser-dot bg-[#86EFAC]" />
        <div className="mx-auto flex h-7 w-full max-w-xs items-center justify-center rounded-md bg-white px-3 text-[11px] text-[#64748B] ring-1 ring-[#E2E8F0]">
          {url}
        </div>
      </div>
      <MarketingMockupImage
        src={src}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
      />
    </div>
  );
}
