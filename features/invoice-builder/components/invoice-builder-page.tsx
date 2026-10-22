"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Download, LayoutTemplate, Loader2, Printer } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/design-system/logo";
import { Skeleton } from "@/components/ui/skeleton";
import { EditableInvoiceCard } from "@/features/invoice-builder/components/editable-invoice-card";
import { InvoiceSheetScroller } from "@/features/invoice-builder/components/invoice-sheet-scroller";
import { TemplatePickerDialog } from "@/features/invoice-builder/components/template-picker-dialog";
import { UnsavedChangesGuard } from "@/features/invoice-builder/components/unsaved-changes-guard";
import { useInvoiceBuilder } from "@/features/invoice-builder/hooks/use-invoice-builder";
import { downloadBuilderInvoicePdf } from "@/pdf/utils/download-builder-with-template";
import { writeSessionTemplateId } from "@/lib/template-preference";
import { getInvoiceTemplate } from "@/pdf/templates/catalog";
import { useAuth } from "@/hooks/use-auth";
import { routes } from "@/config/routes";
import "@/features/invoice-builder/styles/invoice-builder.css";

export function InvoiceBuilderPage() {
  const { user, loading: authLoading } = useAuth();
  const { invoice, hydrated, dirty, dispatch, setLogoFromFile } =
    useInvoiceBuilder();
  const cardRef = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [showLoginHint, setShowLoginHint] = useState(false);

  const template = getInvoiceTemplate(invoice.templateId);
  const isGuest = !authLoading && !user;

  async function handleDownloadPdf() {
    try {
      setBusy(true);
      await downloadBuilderInvoicePdf(invoice);
      toast.success("PDF downloaded");
      if (isGuest) setShowLoginHint(true);
    } catch (error) {
      console.error("[builder-pdf]", error);
      toast.error("Failed to generate PDF");
    } finally {
      setBusy(false);
    }
  }

  function handlePrint() {
    window.print();
  }

  function handleSelectTemplate(templateId: string) {
    writeSessionTemplateId(templateId);
    dispatch({ type: "patch", patch: { templateId } });
  }

  if (!hydrated) {
    return (
      <div className="builder-page">
        <div className="mx-auto max-w-[1100px] space-y-4 px-4 py-10">
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-[720px] w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="builder-page">
      <UnsavedChangesGuard dirty={dirty} />
      <div className="builder-action-bar no-print">
        <div className="mx-auto flex max-w-[1100px] items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Logo href={routes.home} size={48} />
          <div className="flex flex-wrap items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setPickerOpen(true)}
              disabled={busy}
            >
              <LayoutTemplate className="mr-2 h-4 w-4" />
              Template
              <span className="ml-1 hidden text-muted-foreground sm:inline">
                ({template.name})
              </span>
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handlePrint}
              disabled={busy}
            >
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
            <Button
              type="button"
              onClick={() => void handleDownloadPdf()}
              disabled={busy}
              className="bg-[#14B8A6] hover:bg-[#0D9488]"
            >
              {busy ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              Download PDF
            </Button>
          </div>
        </div>
      </div>

      <div
        className="builder-sheet mx-auto max-w-[1100px] space-y-6 px-4 py-8 sm:px-6 sm:py-10"
        ref={cardRef}
      >
        {showLoginHint && isGuest ? (
          <p
            className="no-print rounded-[var(--radius-md)] border border-[var(--brand-soft)] bg-[var(--brand-tint)] px-4 py-3 text-sm text-[var(--brand-700)]"
            role="status"
          >
            Log in to save this invoice to your history.{" "}
            <Link href={routes.login} className="font-semibold underline-offset-2 hover:underline">
              Log in
            </Link>
          </p>
        ) : null}

        <InvoiceSheetScroller>
          <EditableInvoiceCard
            invoice={invoice}
            dispatch={dispatch}
            onLogoFile={setLogoFromFile}
          />
        </InvoiceSheetScroller>

        <p className="builder-login-hint no-print mt-6">
          Want to keep a history of invoices you create?{" "}
          <Link href={routes.login}>Log in</Link>
        </p>
      </div>

      <TemplatePickerDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        selectedId={invoice.templateId}
        onSelect={handleSelectTemplate}
      />
    </div>
  );
}
