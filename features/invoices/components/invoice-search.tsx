"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export function InvoiceSearch({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="relative max-w-md">
      <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search by invoice number or customer..."
        className="pl-9"
      />
    </div>
  );
}
