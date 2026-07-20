import { cn } from "@/lib/utils";

export function DataSurface({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("valix-table-surface", className)}>{children}</div>
  );
}
