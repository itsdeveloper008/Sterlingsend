import { Badge } from "@/components/ui/badge";
import { INVOICE_STATUSES, type InvoiceStatus } from "@/types";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<InvoiceStatus, string> = {
  [INVOICE_STATUSES.DRAFT]: "bg-muted text-muted-foreground",
  [INVOICE_STATUSES.SENT]: "bg-sky-50 text-sky-700 border-sky-200",
  [INVOICE_STATUSES.VIEWED]: "bg-amber-50 text-amber-800 border-amber-200",
  [INVOICE_STATUSES.PAID]: "bg-emerald-50 text-emerald-700 border-emerald-200",
  [INVOICE_STATUSES.OVERDUE]: "bg-red-50 text-red-700 border-red-200",
  [INVOICE_STATUSES.CANCELLED]: "bg-muted text-muted-foreground line-through",
};

const STATUS_LABELS: Record<InvoiceStatus, string> = {
  [INVOICE_STATUSES.DRAFT]: "Draft",
  [INVOICE_STATUSES.SENT]: "Sent",
  [INVOICE_STATUSES.VIEWED]: "Viewed",
  [INVOICE_STATUSES.PAID]: "Paid",
  [INVOICE_STATUSES.OVERDUE]: "Overdue",
  [INVOICE_STATUSES.CANCELLED]: "Cancelled",
};

export function InvoiceStatusBadge({
  status,
  className,
}: {
  status: InvoiceStatus;
  className?: string;
}) {
  return (
    <Badge
      variant="outline"
      className={cn("capitalize font-medium", STATUS_STYLES[status], className)}
    >
      {STATUS_LABELS[status]}
    </Badge>
  );
}
