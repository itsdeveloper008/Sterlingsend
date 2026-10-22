"use client";

import { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  INVOICE_LAYOUTS,
  INVOICE_PALETTES,
  INVOICE_TEMPLATES,
  type InvoiceLayoutId,
  type InvoicePaletteId,
} from "@/pdf/templates/catalog";
import { cn } from "@/lib/utils";

export function TemplatePickerDialog({
  open,
  onOpenChange,
  selectedId,
  onSelect,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedId: string;
  onSelect: (templateId: string) => void;
}) {
  const [layout, setLayout] = useState<InvoiceLayoutId | "all">("all");
  const [palette, setPalette] = useState<InvoicePaletteId | "all">("all");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return INVOICE_TEMPLATES.filter((t) => {
      if (layout !== "all" && t.layout !== layout) return false;
      if (palette !== "all" && t.palette !== palette) return false;
      if (!q) return true;
      return (
        t.name.toLowerCase().includes(q) ||
        t.layout.includes(q) ||
        t.palette.includes(q)
      );
    });
  }, [layout, palette, query]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] w-full max-w-3xl flex-col gap-4 overflow-hidden sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Choose a template</DialogTitle>
          <DialogDescription>
            Applies to the PDF you download and print. {filtered.length} of{" "}
            {INVOICE_TEMPLATES.length} shown.
          </DialogDescription>
        </DialogHeader>
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by layout or colour"
          aria-label="Search templates"
        />
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant={layout === "all" ? "default" : "outline"}
            onClick={() => setLayout("all")}
          >
            All layouts
          </Button>
          {INVOICE_LAYOUTS.map((item) => (
            <Button
              key={item.id}
              type="button"
              size="sm"
              variant={layout === item.id ? "default" : "outline"}
              onClick={() => setLayout(item.id)}
            >
              {item.name}
            </Button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant={palette === "all" ? "default" : "outline"}
            onClick={() => setPalette("all")}
          >
            All colours
          </Button>
          {INVOICE_PALETTES.map((item) => (
            <button
              key={item.id}
              type="button"
              className={cn(
                "inline-flex h-8 items-center gap-2 rounded-[var(--radius-md)] border px-2 text-xs font-medium",
                palette === item.id
                  ? "border-[var(--brand-700)] bg-[var(--brand-tint)]"
                  : "border-border",
              )}
              onClick={() => setPalette(item.id)}
            >
              <span
                className="size-3 rounded-full"
                style={{ background: item.primary }}
                aria-hidden
              />
              {item.name}
            </button>
          ))}
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {filtered.map((template) => (
              <li key={template.id}>
                <button
                  type="button"
                  className={cn(
                    "w-full overflow-hidden rounded-[var(--radius-md)] border text-left transition",
                    selectedId === template.id
                      ? "border-[var(--brand-700)] ring-2 ring-[var(--brand-500)]"
                      : "border-border-subtle hover-fine:hover:border-[var(--brand-600)]",
                  )}
                  onClick={() => {
                    onSelect(template.id);
                    onOpenChange(false);
                  }}
                >
                  <div
                    className="aspect-[3/4] p-3"
                    style={{
                      background: `linear-gradient(160deg, ${template.accent}22, ${template.primary}18)`,
                    }}
                  >
                    <div className="h-full rounded-md border border-white/80 bg-white p-2">
                      <div
                        className="h-1.5 w-10 rounded-sm"
                        style={{ background: template.primary }}
                      />
                      <div className="mt-2 h-1.5 w-2/3 rounded-sm bg-slate-200" />
                      <div className="mt-1 h-1.5 w-1/2 rounded-sm bg-slate-100" />
                    </div>
                  </div>
                  <div className="border-t border-border-subtle px-2 py-1.5 text-xs font-medium">
                    {template.name}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  );
}
