"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DEPTH_LAYOUT_IDS,
  INVOICE_LAYOUTS,
  INVOICE_TEMPLATE_COUNT,
  type InvoiceLayoutId,
} from "@/pdf/templates/catalog";
import { writeSessionTemplateId } from "@/lib/template-preference";
import {
  ACCENT_PRESETS,
  DEFAULT_ACCENT_HEX,
  writeSessionAccent,
} from "@/lib/invoice-accent";
import {
  updateAccentColorAction,
  updateInvoiceTemplateAction,
} from "@/actions/settings.actions";
import { useAuth } from "@/hooks/use-auth";
import { routes } from "@/config/routes";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { TemplateMiniPreview } from "@/features/templates/components/template-mini-preview";
import "@/features/invoice-builder/styles/invoice-builder.css";
import "@/features/templates/styles/template-preview.css";

function onDepthPointerMove(e: React.PointerEvent<HTMLElement>) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
  const node = e.currentTarget;
  const rect = node.getBoundingClientRect();
  const x = ((e.clientX - rect.left) / rect.width - 0.5) * 10;
  const y = ((e.clientY - rect.top) / rect.height - 0.5) * 10;
  node.style.setProperty("--par-x", `${x.toFixed(1)}px`);
  node.style.setProperty("--par-y", `${y.toFixed(1)}px`);
}

function onDepthPointerLeave(e: React.PointerEvent<HTMLElement>) {
  e.currentTarget.style.setProperty("--par-x", "0px");
  e.currentTarget.style.setProperty("--par-y", "0px");
}

export function TemplatesGallery({
  mode: _mode = "page",
  selectedId,
  onSelect,
}: {
  mode?: "page" | "dialog";
  selectedId?: string;
  onSelect?: (templateId: string) => void;
}) {
  void _mode;
  const router = useRouter();
  const { user } = useAuth();
  const [accent, setAccent] = useState(DEFAULT_ACCENT_HEX);
  const [previewLayout, setPreviewLayout] = useState<InvoiceLayoutId | null>(
    null,
  );

  const cards = useMemo(() => INVOICE_LAYOUTS.map((layout) => layout), []);

  const previewIndex = previewLayout
    ? INVOICE_LAYOUTS.findIndex((l) => l.id === previewLayout)
    : -1;
  const previewMeta = previewLayout
    ? INVOICE_LAYOUTS.find((l) => l.id === previewLayout)
    : null;

  function applyTemplate(layoutId: string) {
    writeSessionTemplateId(layoutId);
    writeSessionAccent(accent);
    if (onSelect) {
      onSelect(layoutId);
      return;
    }
    router.push(routes.createInvoice);
  }

  async function setDefault(layoutId: string) {
    if (!user) return;
    try {
      await updateInvoiceTemplateAction(layoutId);
      await updateAccentColorAction(accent);
      toast.success("Default template saved");
    } catch {
      toast.error("Could not save default template");
    }
  }

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <p className="text-base font-semibold text-[var(--ink)]">Colour</p>
        <div
          className="flex flex-wrap gap-2"
          role="radiogroup"
          aria-label="Preview colour"
        >
          {ACCENT_PRESETS.map((item) => (
            <button
              key={item.id}
              type="button"
              role="radio"
              aria-checked={accent.toUpperCase() === item.hex.toUpperCase()}
              aria-label={item.name}
              title={item.name}
              className={cn(
                "size-6 rounded-full clay",
                accent.toUpperCase() === item.hex.toUpperCase() &&
                  "ring-2 ring-offset-2 ring-[var(--brand-600)]",
              )}
              style={{ background: item.hex }}
              onClick={() => setAccent(item.hex)}
            />
          ))}
        </div>
      </div>

      <ul
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
        style={{ gap: "28px" }}
      >
        {cards.map((layout, index) => {
          const isDepth = DEPTH_LAYOUT_IDS.includes(layout.id);
          return (
          <li key={layout.id}>
            <article
              className={cn(
                "ss-card-lift group relative flex h-full flex-col overflow-hidden rounded-2xl bg-card glass",
                selectedId === layout.id &&
                  "ring-2 ring-[var(--brand-600)] ring-offset-2",
              )}
            >
              {selectedId === layout.id ? (
                <span
                  className="absolute right-3 top-3 z-10 flex h-7 w-7 items-center justify-center clay-teal text-sm text-white"
                  aria-hidden
                >
                  ✓
                </span>
              ) : null}
              <button
                type="button"
                className="tpl-card-stage relative aspect-[1/1.35] w-full overflow-hidden bg-white text-left"
                onClick={() => setPreviewLayout(layout.id)}
                onPointerMove={isDepth ? onDepthPointerMove : undefined}
                onPointerLeave={isDepth ? onDepthPointerLeave : undefined}
                aria-label={`Preview ${layout.name}`}
              >
                <TemplateMiniPreview
                  layoutId={layout.id}
                  accent={accent}
                  className={cn(index > 5 && "tpl-preview--lazy")}
                />
              </button>
              <div className="flex flex-1 flex-col gap-3 border-t border-border-subtle p-4">
                <div>
                  <h2 className="text-lg font-semibold text-[var(--ink)]">
                    {layout.name}
                  </h2>
                  <p className="mt-1 text-[0.9375rem] leading-snug text-[var(--body-text)]">
                    {layout.description}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  className="mt-auto w-full"
                  onClick={() => applyTemplate(layout.id)}
                >
                  Use this template
                </Button>
              </div>
            </article>
          </li>
          );
        })}
      </ul>

      <Dialog
        open={previewLayout != null}
        onOpenChange={(open) => {
          if (!open) setPreviewLayout(null);
        }}
      >
        <DialogContent className="glass-strong flex max-h-[calc(100vh-64px)] w-full max-w-3xl flex-col overflow-hidden p-0">
          <DialogHeader className="sticky top-0 z-10 shrink-0 border-b border-[rgba(15,23,42,.08)] bg-[var(--glass-strong-bg)] px-6 py-4">
            <DialogTitle>{previewMeta?.name ?? "Template preview"}</DialogTitle>
            <DialogDescription>
              {INVOICE_TEMPLATE_COUNT} layouts. Pick a colour, then a layout.
              Your choice applies to the PDF you download and print.
            </DialogDescription>
          </DialogHeader>
          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
          {previewLayout ? (
            <div className="space-y-4">
              <div className="mx-auto w-full max-w-md overflow-hidden rounded-xl border border-border-subtle bg-white">
                <TemplateMiniPreview
                  layoutId={previewLayout}
                  accent={accent}
                />
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    aria-label="Previous layout"
                    disabled={previewIndex <= 0}
                    onClick={() =>
                      setPreviewLayout(INVOICE_LAYOUTS[previewIndex - 1]?.id)
                    }
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    aria-label="Next layout"
                    disabled={previewIndex >= INVOICE_LAYOUTS.length - 1}
                    onClick={() =>
                      setPreviewLayout(INVOICE_LAYOUTS[previewIndex + 1]?.id)
                    }
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {user ? (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        previewLayout && void setDefault(previewLayout)
                      }
                    >
                      Set as default
                    </Button>
                  ) : null}
                  <Button
                    type="button"
                    className="bg-[var(--brand-700)] text-white hover:bg-[var(--primary-hover)]"
                    onClick={() => {
                      applyTemplate(previewLayout);
                      setPreviewLayout(null);
                    }}
                  >
                    Use this template
                  </Button>
                </div>
              </div>
            </div>
          ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
