"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export function CustomerSearch({
  value,
  onChange,
  placeholder = "Search by name, email, company, or phone...",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="relative w-full max-w-md">
      <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="pl-9"
        aria-label="Search customers"
      />
    </div>
  );
}
