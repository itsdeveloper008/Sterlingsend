"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  INVOICE_LAYOUTS,
  INVOICE_PALETTES,
  INVOICE_TEMPLATES,
  type InvoiceLayoutId,
  type InvoicePaletteId,
} from "@/pdf/templates/catalog";
import { writeSessionTemplateId } from "@/lib/template-preference";
import { routes } from "@/config/routes";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function TemplatesGallery() {
  const router = useRouter();
  const [layout, setLayout] = useState<InvoiceLayoutId | "all">("all");
  const [palette, setPalette] = useState<InvoicePaletteId | "all">("all");

  const filtered = useMemo(() => {
    return INVOICE_TEMPLATES.filter((t) => {
      if (layout !== "all" && t.layout !== layout) return false;
      if (palette !== "all" && t.palette !== palette) return false;
      return true;
    });
  }, [layout, palette]);

  function applyTemplate(templateId: string) {
    writeSessionTemplateId(templateId);
    router.push(routes.createInvoice);
  }

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <p className="text-sm font-medium text-foreground">Layout</p>
        <div
          className="flex flex-wrap gap-2"
          role="group"
          aria-label="Filter by layout"
        >
          <Segment
            active={layout === "all"}
            onClick={() => setLayout("all")}
            label="All"
          />
          {INVOICE_LAYOUTS.map((item) => (
            <Segment
              key={item.id}
              active={layout === item.id}
              onClick={() => setLayout(item.id)}
              label={item.name}
            />
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-sm font-medium text-foreground">Colour</p>
        <div
          className="flex flex-wrap gap-2"
          role="group"
          aria-label="Filter by colour"
        >
          <Segment
            active={palette === "all"}
            onClick={() => setPalette("all")}
            label="All"
          />
          {INVOICE_PALETTES.map((item) => (
            <button
              key={item.id}
              type="button"
              className={cn(
                "inline-flex h-9 items-center gap-2 rounded-[var(--radius-md)] border px-3 text-xs font-medium",
                palette === item.id
                  ? "border-[var(--brand-700)] bg-[var(--brand-tint)] text-foreground"
                  : "border-border text-muted-foreground",
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
      </div>

      <p className="text-sm text-muted-foreground" aria-live="polite">
        Showing {filtered.length} of {INVOICE_TEMPLATES.length} templates
      </p>

      <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {filtered.map((template) => (
          <li key={template.id}>
            <article
              className="ss-card-tilt ss-card-spotlight group overflow-hidden rounded-[var(--radius-lg)] border border-border-subtle bg-card"
              onPointerMove={(event) => {
                const node = event.currentTarget;
                const rect = node.getBoundingClientRect();
                node.style.setProperty(
                  "--ss-spot-x",
                  `${((event.clientX - rect.left) / rect.width) * 100}%`,
                );
                node.style.setProperty(
                  "--ss-spot-y",
                  `${((event.clientY - rect.top) / rect.height) * 100}%`,
                );
              }}
            >
              <div className="relative aspect-[3/4] bg-muted">
                <Image
                  src={`/templates/${template.id}.webp`}
                  alt={`${template.name} invoice template preview`}
                  width={480}
                  height={640}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="space-y-3 border-t border-border-subtle p-3">
                <div>
                  <h2 className="text-sm font-semibold text-foreground">
                    {template.name}
                  </h2>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {template.description}
                  </p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  className="w-full"
                  onClick={() => applyTemplate(template.id)}
                >
                  Use this template
                </Button>
              </div>
            </article>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Segment({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-[var(--radius-md)] px-3 py-1.5 text-xs font-medium transition",
        active
          ? "bg-[var(--brand-700)] text-white"
          : "bg-muted text-muted-foreground hover-fine:hover:text-foreground",
      )}
    >
      {label}
    </button>
  );
}
