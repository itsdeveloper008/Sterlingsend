import { cn } from "@/lib/utils";

export function SkipLink({
  href = "#main",
  className,
}: {
  href?: string;
  className?: string;
}) {
  return (
    <a
      href={href}
      className={cn(
        "sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100]",
        "focus:rounded-[var(--radius-md)] focus:bg-[var(--brand-700)] focus:px-4 focus:py-2",
        "focus:text-sm focus:font-semibold focus:text-white focus:outline-none",
        "focus:shadow-[var(--shadow-3)]",
        className,
      )}
    >
      Skip to content
    </a>
  );
}
