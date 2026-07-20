import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { CardHeading, PageDescription } from "@/components/design-system/typography";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 px-6 py-16 text-center",
        className,
      )}
    >
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/8 text-primary">
        <Icon className="h-6 w-6" aria-hidden />
      </div>
      <CardHeading className="text-lg font-semibold">{title}</CardHeading>
      <PageDescription className="mt-2 max-w-sm">{description}</PageDescription>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
