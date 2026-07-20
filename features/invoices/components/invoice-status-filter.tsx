"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ALL_INVOICE_STATUSES } from "@/lib/invoice/status-transitions";
import type { InvoiceStatus } from "@/types";

export function InvoiceStatusFilter({
  value,
  onChange,
}: {
  value: InvoiceStatus | "all";
  onChange: (value: InvoiceStatus | "all") => void;
}) {
  return (
    <Select
      value={value}
      onValueChange={(next) => onChange(next as InvoiceStatus | "all")}
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All statuses</SelectItem>
        {ALL_INVOICE_STATUSES.map((status) => (
          <SelectItem key={status} value={status}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
