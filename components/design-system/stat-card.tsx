import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Caption } from "@/components/design-system/typography";

export function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  className,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  trend?: string;
  className?: string;
}) {
  return (
    <Card className={cn("shadow-xs", className)}>
      <CardContent className="flex items-start justify-between gap-4 p-5">
        <div className="space-y-2">
          <Caption className="font-medium normal-case tracking-normal text-muted-foreground">
            {label}
          </Caption>
          <p className="text-2xl font-semibold tracking-tight text-foreground">
            {value}
          </p>
          {trend ? (
            <Caption className="normal-case tracking-normal">{trend}</Caption>
          ) : null}
        </div>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/8 text-primary">
          <Icon className="h-4 w-4" aria-hidden />
        </div>
      </CardContent>
    </Card>
  );
}
