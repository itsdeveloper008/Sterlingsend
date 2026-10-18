import { cn } from "@/lib/utils";

export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-sm)] bg-muted motion-safe:animate-pulse",
        className,
      )}
      {...props}
    />
  );
}
