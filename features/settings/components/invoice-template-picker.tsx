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
import type { WorkspaceSource } from "@/lib/workspace/resolve-source";
import { workspaceSaveTemplate } from "@/lib/workspace/client-api";

export function InvoiceTemplatePicker({
  source = "cloud",
  initialTemplateId,
  compact = false,
  onSelected,
}: {
  source?: WorkspaceSource;
  initialTemplateId: string;
  compact?: boolean;
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
    startTransition(async () => {
      try {
        const result = await workspaceSaveTemplate(source, template.id);
        if (result.success) {
          toast.success(
            source === "local"
              ? `Template saved in this browser: ${template.name}`
              : `Template saved: ${template.name}`,
          );
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
            {INVOICE_TEMPLATES.length} designs ·{" "}
            {source === "local"
              ? "saved in this browser"
              : "saved to your account"}
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

      <div className={cn("space-y-6", compact && "max-h-[28rem] overflow-y-auto pr-1")}>
        {filteredGroups.map((group) => (
          <div key={group.category}>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {group.category}
            </p>
            <div
              className={cn(
                "grid gap-3",
                compact
                  ? "grid-cols-2 sm:grid-cols-3"
                  : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4",
              )}
            >
              {group.templates.map((template) => {
                const selected = template.id === selectedId;
                return (
                  <button
                    key={template.id}
                    type="button"
                    disabled={pending}
                    onClick={() => selectTemplate(template)}
                    className={cn(
                      "group relative overflow-hidden rounded-2xl border bg-white p-3 text-left transition",
                      selected
                        ? "border-teal-500 ring-2 ring-teal-500/30"
                        : "border-border hover:border-teal-300 hover:shadow-md",
                      pending && "opacity-70",
                    )}
                  >
                    <div
                      className="mb-3 h-16 overflow-hidden rounded-xl border border-black/5"
                      style={{ background: "#fff" }}
                    >
                      <div
                        className="h-2 w-full"
                        style={{
                          background: `linear-gradient(90deg, ${template.primary}, ${template.accent})`,
                        }}
                      />
                      <div className="space-y-1.5 p-2">
                        <div
                          className="h-2 w-1/2 rounded"
                          style={{ background: template.primary, opacity: 0.85 }}
                        />
                        <div className="h-1.5 w-full rounded bg-slate-100" />
                        <div className="h-1.5 w-4/5 rounded bg-slate-100" />
                        <div className="ml-auto h-3 w-1/3 rounded" style={{ background: `${template.accent}33` }} />
                      </div>
                    </div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-foreground">
                          {template.name}
                        </p>
                        <p className="truncate text-[11px] text-muted-foreground">
                          {template.description}
                        </p>
                      </div>
                      {selected ? (
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal-600 text-white">
                          <Check className="h-3 w-3" />
                        </span>
                      ) : null}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
        {filteredGroups.length === 0 ? (
          <p className="text-sm text-muted-foreground">No templates match your search.</p>
        ) : null}
      </div>
    </div>
  );
}
