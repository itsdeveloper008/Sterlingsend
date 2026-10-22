"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { usePointerEffects } from "@/features/marketing/lib/use-pointer-effects";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  INVOICE_LAYOUTS,
  INVOICE_PALETTES,
  INVOICE_TEMPLATE_COUNT,
  INVOICE_TEMPLATES,
  type InvoiceLayoutId,
  type InvoicePaletteId,
} from "@/pdf/templates/catalog";
import { writeSessionTemplateId } from "@/lib/template-preference";
import { updateInvoiceTemplateAction } from "@/actions/settings.actions";
import { useAuth } from "@/hooks/use-auth";
import { routes } from "@/config/routes";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

function templateIdFor(layout: InvoiceLayoutId, palette: InvoicePaletteId) {
  return `${layout}-${palette}`;
}

export function TemplatesGallery({
  mode = "page",
  selectedId,
  onSelect,
}: {
  mode?: "page" | "dialog";
  selectedId?: string;
  onSelect?: (templateId: string) => void;
}) {
  usePointerEffects(mode === "page");
  const router = useRouter();
  const { user } = useAuth();
  const initialPalette =
    (INVOICE_TEMPLATES.find((t) => t.id === selectedId)?.palette as
      | InvoicePaletteId
      | undefined) ?? "teal";
  const [palette, setPalette] = useState<InvoicePaletteId>(initialPalette);
  const [previewLayout, setPreviewLayout] = useState<InvoiceLayoutId | null>(
    null,
  );

  const cards = useMemo(
    () =>
      INVOICE_LAYOUTS.map((layout) => {
        const id = templateIdFor(layout.id, palette);
        const template = INVOICE_TEMPLATES.find((t) => t.id === id);
        return { layout, id, template };
      }),
    [palette],
  );

  const previewIndex = previewLayout
    ? INVOICE_LAYOUTS.findIndex((l) => l.id === previewLayout)
    : -1;
  const previewId =
    previewLayout != null ? templateIdFor(previewLayout, palette) : null;
  const previewTemplate = previewId
    ? INVOICE_TEMPLATES.find((t) => t.id === previewId)
    : null;

  function applyTemplate(templateId: string) {
    writeSessionTemplateId(templateId);
    if (onSelect) {
      onSelect(templateId);
      return;
    }
    router.push(routes.createInvoice);
  }

  async function setDefault(templateId: string) {
    if (!user) return;
    try {
      await updateInvoiceTemplateAction(templateId);
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
          aria-label="Template colour"
        >
          {INVOICE_PALETTES.map((item) => (
            <button
              key={item.id}
              type="button"
              role="radio"
              aria-checked={palette === item.id}
              aria-label={item.name}
              title={item.name}
              className={cn(
                "inline-flex h-10 items-center gap-2 rounded-xl border px-3 text-sm font-semibold",
                palette === item.id
                  ? "border-[var(--brand-700)] bg-[var(--brand-tint)] text-[var(--ink)]"
                  : "border-[var(--border-ui)] text-[var(--secondary-text)]",
              )}
              onClick={() => setPalette(item.id)}
            >
              <span
                className="size-3.5 rounded-full"
                style={{ background: item.primary }}
                aria-hidden
              />
              {item.name}
            </button>
          ))}
        </div>
        <p className="text-sm text-[var(--secondary-text)]">
          {INVOICE_TEMPLATE_COUNT} templates · showing 8 layouts in{" "}
          {INVOICE_PALETTES.find((p) => p.id === palette)?.name}
        </p>
      </div>

      <ul className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-5">
        {cards.map(({ layout, id, template }, index) => (
          <li key={layout.id}>
            <article
              data-ss-tilt={mode === "page" ? "card" : undefined}
              className={cn(
                "group flex h-full flex-col overflow-hidden rounded-2xl border bg-card shadow-[var(--shadow-1)]",
                selectedId === id
                  ? "border-[var(--brand-700)] ring-2 ring-[var(--brand-500)]"
                  : "border-border-subtle",
              )}
            >
              <button
                type="button"
                className="relative aspect-[1/1.414] w-full bg-[var(--surface-muted)] text-left"
                onClick={() => setPreviewLayout(layout.id)}
                aria-label={`Preview ${layout.name}`}
              >
                <Image
                  src={`/templates/${id}.webp`}
                  alt={`${layout.name} template in ${palette}`}
                  width={720}
                  height={1018}
                  sizes="(max-width: 768px) 50vw, 25vw"
                  priority={index < 4}
                  loading={index < 4 ? "eager" : "lazy"}
                  className="h-full w-full object-cover object-top"
                />
              </button>
              <div className="flex flex-1 flex-col gap-3 border-t border-border-subtle p-4">
                <div>
                  <h2 className="text-lg font-semibold text-[var(--ink)]">
                    {layout.name}
                  </h2>
                  <p className="mt-1 line-clamp-2 text-[0.9375rem] text-[var(--body-text)]">
                    {template?.description ?? layout.description}
                  </p>
                </div>
                <Button
                  type="button"
                  className="mt-auto w-full bg-[var(--brand-700)] text-white hover:bg-[var(--primary-hover)]"
                  onClick={() => applyTemplate(id)}
                >
                  Use this template
                </Button>
              </div>
            </article>
          </li>
        ))}
      </ul>

      <Dialog
        open={previewLayout != null}
        onOpenChange={(open) => {
          if (!open) setPreviewLayout(null);
        }}
      >
        <DialogContent className="max-h-[90vh] w-full max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {previewTemplate?.name ?? "Template preview"}
            </DialogTitle>
            <DialogDescription>
              {previewTemplate?.description}
            </DialogDescription>
          </DialogHeader>
          {previewId ? (
            <div className="space-y-4">
              <div className="relative mx-auto aspect-[1/1.414] w-full max-w-md overflow-hidden rounded-xl border border-border-subtle bg-[var(--surface-muted)]">
                <Image
                  src={`/templates/${previewId}.webp`}
                  alt={previewTemplate?.name ?? "Template"}
                  fill
                  className="object-cover object-top"
                  sizes="(max-width: 768px) 90vw, 28rem"
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
                      onClick={() => previewId && void setDefault(previewId)}
                    >
                      Set as default
                    </Button>
                  ) : null}
                  <Button
                    type="button"
                    className="bg-[var(--brand-700)] text-white hover:bg-[var(--primary-hover)]"
                    onClick={() => {
                      if (!previewId) return;
                      applyTemplate(previewId);
                      setPreviewLayout(null);
                    }}
                  >
                    Use this template
                  </Button>
                </div>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
