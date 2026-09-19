"use client";

import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { Check, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  INVOICE_TEMPLATES,
  listInvoiceTemplatesByCategory,
  type InvoiceTemplateDefinition,
} from "@/pdf/templates/catalog";
import { updateInvoiceTemplateAction } from "@/actions/settings.actions";

export function InvoiceTemplatePicker({
  initialTemplateId,
  compact = false,
  /** When false, selection is session-only (guest builder). */
  persist = true,
  onSelected,
}: {
  initialTemplateId: string;
  compact?: boolean;
  persist?: boolean;
  onSelected?: (template: InvoiceTemplateDefinition) => void;
}) {
  const [selectedId, setSelectedId] = useState(initialTemplateId);
  const [query, setQuery] = useState("");
  const [pending, startTransition] = useTransition();
  const groups = useMemo(() => listInvoiceTemplatesByCategory(), []);

  const filteredGroups = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return groups;
    return groups
      .map((group) => ({
        ...group,
        templates: group.templates.filter(
          (t) =>
            t.name.toLowerCase().includes(q) ||
            t.category.toLowerCase().includes(q) ||
            t.palette.toLowerCase().includes(q),
        ),
      }))
      .filter((group) => group.templates.length > 0);
  }, [groups, query]);

  function selectTemplate(template: InvoiceTemplateDefinition) {
    setSelectedId(template.id);
    onSelected?.(template);

    if (!persist) {
      toast.success(`Template selected: ${template.name}`);
      return;
    }

    startTransition(async () => {
      try {
        const result = await updateInvoiceTemplateAction(template.id);
        if (result.success) {
          toast.success(`Template saved: ${template.name}`);
        }
      } catch {
        toast.error("Could not save template preference");
      }
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            Invoice templates
          </h3>
          <p className="text-xs text-muted-foreground">
            {INVOICE_TEMPLATES.length} designs
            {persist ? " · saved to your account" : " · applies to this invoice"}
          </p>
        </div>
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search templates"
            className="h-10 w-full rounded-full border border-border bg-white pl-9 pr-3 text-sm outline-none focus:border-primary"
          />
        </div>
      </div>

      <div
        className={cn(
          "space-y-6",
          compact ? "max-h-[320px] overflow-y-auto pr-1" : "",
          pending && "opacity-70",
        )}
      >
        {filteredGroups.map((group) => (
          <div key={group.category} className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {group.category}
            </p>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {group.templates.map((template) => {
                const selected = template.id === selectedId;
                return (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => selectTemplate(template)}
                    className={cn(
                      "relative flex items-start gap-3 rounded-xl border p-3 text-left transition",
                      selected
                        ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                        : "border-border bg-white hover:border-primary/40",
                    )}
                  >
                    <span
                      className="mt-0.5 h-10 w-10 shrink-0 rounded-lg"
                      style={{
                        background: `linear-gradient(135deg, ${template.primary}, ${template.accent})`,
                      }}
                      aria-hidden
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium text-foreground">
                        {template.name}
                      </span>
                      <span className="block text-xs text-muted-foreground">
                        {template.palette}
                      </span>
                    </span>
                    {selected ? (
                      <Check className="h-4 w-4 shrink-0 text-primary" />
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
