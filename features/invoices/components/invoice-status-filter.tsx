"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { HistoryDisplayStatus } from "@/features/invoices/lib/display-status";

export function InvoiceStatusFilter({
  value,
  onChange,
}: {
  value: HistoryDisplayStatus | "all";
  onChange: (value: HistoryDisplayStatus | "all") => void;
}) {
  return (
    <Select
      value={value}
      onValueChange={(next) =>
        onChange(next as HistoryDisplayStatus | "all")
      }
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All statuses</SelectItem>
        <SelectItem value="unpaid">Unpaid</SelectItem>
        <SelectItem value="paid">Paid</SelectItem>
        <SelectItem value="overdue">Overdue</SelectItem>
      </SelectContent>
    </Select>
  );
}
