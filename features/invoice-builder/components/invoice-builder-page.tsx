"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Check,
  Download,
  LayoutTemplate,
  Loader2,
  Printer,
  Save,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/design-system/logo";
import { EditableInvoiceCard } from "@/features/invoice-builder/components/editable-invoice-card";
import { InvoiceSheetScroller } from "@/features/invoice-builder/components/invoice-sheet-scroller";
import dynamic from "next/dynamic";
import { UnsavedChangesGuard } from "@/features/invoice-builder/components/unsaved-changes-guard";
import { useInvoiceBuilder } from "@/features/invoice-builder/hooks/use-invoice-builder";
import { writeSessionTemplateId } from "@/lib/template-preference";
import { getInvoiceTemplate } from "@/pdf/templates/catalog";
import { useAuth } from "@/hooks/use-auth";
import { routes } from "@/config/routes";
import {
  builderToSavePayload,
  invoiceDocToBuilder,
} from "@/features/invoice-builder/lib/map-builder-to-invoice";
import {
  clearPendingInvoice,
  readPendingInvoice,
  shouldReturnToBuilderAfterAuth,
  stashPendingInvoice,
} from "@/features/invoice-builder/lib/pending-invoice";
import {
  saveBuilderInvoiceAction,
  suggestNextInvoiceNumberAction,
} from "@/actions/builder-invoice.actions";
import type { SerializedInvoice } from "@/features/invoices/lib/format";
import { createDefaultBuilderInvoice } from "@/features/invoice-builder/lib/defaults";
import { cn } from "@/lib/utils";
import "@/features/invoice-builder/styles/invoice-builder.css";

const TemplatePickerDialog = dynamic(
  () =>
    import("@/features/invoice-builder/components/template-picker-dialog").then(
      (m) => ({ default: m.TemplatePickerDialog }),
    ),
  { ssr: false },
);

async function downloadPdf(invoice: Parameters<
  typeof import("@/pdf/utils/download-builder-with-template").downloadBuilderInvoicePdf
>[0]) {
  const { downloadBuilderInvoicePdf } = await import(
    "@/pdf/utils/download-builder-with-template"
  );
  return downloadBuilderInvoicePdf(invoice);
}

type SaveStatus = "idle" | "saving" | "saved" | "error";

function serializedToBuilder(doc: SerializedInvoice) {
  const base = createDefaultBuilderInvoice();
  const patch = invoiceDocToBuilder(doc);
  return {
    ...base,
    ...patch,
    customer: patch.customer ?? base.customer,
    items: patch.items ?? base.items,
    templateId: patch.templateId ?? base.templateId,
  };
}

export function InvoiceBuilderPage({
  editId = null,
  initialInvoice = null,
}: {
  editId?: string | null;
  initialInvoice?: SerializedInvoice | null;
}) {
  const { user, loading: authLoading } = useAuth();
  const skipClearOnMount = Boolean(initialInvoice);
  const { invoice, hydrated, dirty, dispatch, setLogoFromFile } =
    useInvoiceBuilder({ skipClearOnMount });
  const cardRef = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [showLoginHint, setShowLoginHint] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(
    initialInvoice?.id ?? editId,
  );
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [showOnboardingPrompt, setShowOnboardingPrompt] = useState(false);
  const [showRestoredBanner, setShowRestoredBanner] = useState(false);
  const saveTimer = useRef<number | null>(null);
  const invoiceRef = useRef(invoice);
  invoiceRef.current = invoice;
  const hydratedEdit = useRef(false);

  const template = getInvoiceTemplate(invoice.templateId);
  const isGuest = !authLoading && !user;
  const isLoggedIn = !authLoading && !!user;

  const persist = useCallback(
    async (reason: "manual" | "auto" | "download" | "print") => {
      if (!user) return false;
      const payload = builderToSavePayload(invoiceRef.current);
      setSaveStatus("saving");
      const result = await saveBuilderInvoiceAction(savedId, payload);
      if (!result.success) {
        setSaveStatus("error");
        if (reason === "manual" || reason === "download" || reason === "print") {
          toast.error(result.error);
        }
        return false;
      }
      setSavedId(result.data.id);
      dispatch({
        type: "patch",
        patch: { invoiceNumber: result.data.invoiceNumber },
      });
      setSaveStatus("saved");
      if (result.suggestedOnboarding) {
        setShowOnboardingPrompt(true);
      }
      return true;
    },
    [dispatch, savedId, user],
  );

  useEffect(() => {
    if (hydratedEdit.current || !initialInvoice) return;
    hydratedEdit.current = true;
    dispatch({ type: "hydrate", invoice: serializedToBuilder(initialInvoice) });
  }, [initialInvoice, dispatch]);

  useEffect(() => {
    if (authLoading || !user) return;
    if (!shouldReturnToBuilderAfterAuth()) return;
    const pending = readPendingInvoice();
    clearPendingInvoice();
    if (!pending) return;
    dispatch({ type: "hydrate", invoice: pending });
    setShowRestoredBanner(true);
  }, [authLoading, user, dispatch]);

  useEffect(() => {
    if (authLoading || !user || editId || savedId || initialInvoice) return;
    let cancelled = false;
    void (async () => {
      const result = await suggestNextInvoiceNumberAction();
      if (cancelled || !result.success) return;
      if (invoiceRef.current.invoiceNumber === "INV-001") {
        dispatch({
          type: "patch",
          patch: { invoiceNumber: result.invoiceNumber },
        });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [authLoading, user, editId, savedId, initialInvoice, dispatch]);

  useEffect(() => {
    if (!isLoggedIn || !savedId || !dirty) return;
    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => {
      void persist("auto");
    }, 1500);
    return () => {
      if (saveTimer.current) window.clearTimeout(saveTimer.current);
    };
  }, [invoice, dirty, isLoggedIn, savedId, persist]);

  function goToLoginFromPrompt() {
    stashPendingInvoice(invoice);
    window.location.assign(
      `${routes.login}?redirect=${encodeURIComponent(routes.createInvoice)}`,
    );
  }

  function goToSignupFromPrompt() {
    stashPendingInvoice(invoice);
    window.location.assign(
      `${routes.signup}?redirect=${encodeURIComponent(routes.createInvoice)}`,
    );
  }

  async function handleDownloadPdf() {
    try {
      setBusy(true);
      if (isLoggedIn) {
        await persist("download");
      }
      await downloadPdf(invoiceRef.current);
      toast.success("PDF downloaded");
      if (isGuest) setShowLoginHint(true);
    } catch (error) {
      console.error("[builder-pdf]", error);
      toast.error("Failed to generate PDF");
    } finally {
      setBusy(false);
    }
  }

  async function handlePrint() {
    if (isLoggedIn) {
      await persist("print");
    }
    window.print();
  }

  function handleSelectTemplate(templateId: string) {
    writeSessionTemplateId(templateId);
    dispatch({ type: "patch", patch: { templateId } });
  }

  void hydrated;

  return (
    <div className="builder-page">
      <UnsavedChangesGuard dirty={dirty && !savedId} />
      <div className="builder-action-bar no-print">
        <div className="mx-auto flex max-w-[1100px] items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Logo href={routes.home} size={48} />
          <div className="flex flex-wrap items-center justify-end gap-2">
            {isLoggedIn ? (
              <span
                className="mr-1 flex min-w-[5.5rem] items-center gap-1.5 text-xs text-muted-foreground"
                aria-live="polite"
              >
                {saveStatus === "saving" ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Saving
                  </>
                ) : null}
                {saveStatus === "saved" ? (
                  <>
                    <Check
                      className="h-3.5 w-3.5 text-[var(--brand-700)] motion-safe:animate-[ss-check-pop_0.35s_ease]"
                      strokeWidth={2.5}
                    />
                    Saved
                  </>
                ) : null}
                {saveStatus === "error" ? (
                  <>
                    Could not save
                    <button
                      type="button"
                      className="font-semibold text-[var(--brand-700)] underline-offset-2 hover:underline"
                      onClick={() => void persist("manual")}
                    >
                      Retry
                    </button>
                  </>
                ) : null}
              </span>
            ) : null}
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
            {isLoggedIn ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => void persist("manual")}
                disabled={busy || saveStatus === "saving"}
              >
                <Save className="mr-2 h-4 w-4" />
                Save
              </Button>
            ) : null}
            <Button
              type="button"
              variant="outline"
              onClick={() => void handlePrint()}
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
        {showRestoredBanner && isLoggedIn ? (
          <p
            className="no-print rounded-[var(--radius-md)] border border-[var(--brand-soft)] bg-[var(--brand-tint)] px-4 py-3 text-sm text-[var(--brand-700)]"
            role="status"
          >
            Your draft is back.{" "}
            <button
              type="button"
              className="font-semibold underline-offset-2 hover:underline"
              onClick={() => void persist("manual")}
            >
              Save to history
            </button>
          </p>
        ) : null}

        {showOnboardingPrompt ? (
          <p
            className="no-print flex flex-wrap items-center justify-between gap-2 rounded-[var(--radius-md)] border border-border-subtle bg-card px-4 py-3 text-sm text-foreground"
            role="status"
          >
            <span>
              Add a logo and confirm your business details when you like.
            </span>
            <span className="flex gap-2">
              <Link
                href={routes.onboarding}
                className="font-semibold text-[var(--brand-700)] underline-offset-2 hover:underline"
              >
                Finish setup
              </Link>
              <button
                type="button"
                className="text-muted-foreground underline-offset-2 hover:underline"
                onClick={() => setShowOnboardingPrompt(false)}
              >
                Dismiss
              </button>
            </span>
          </p>
        ) : null}

        {showLoginHint && isGuest ? (
          <p
            className="no-print rounded-[var(--radius-md)] border border-[var(--brand-soft)] bg-[var(--brand-tint)] px-4 py-3 text-sm text-[var(--brand-700)]"
            role="status"
          >
            Log in to save this invoice to your history.{" "}
            <button
              type="button"
              className="font-semibold underline-offset-2 hover:underline"
              onClick={goToLoginFromPrompt}
            >
              Log in
            </button>
            {" · "}
            <button
              type="button"
              className="font-semibold underline-offset-2 hover:underline"
              onClick={goToSignupFromPrompt}
            >
              Sign up
            </button>
          </p>
        ) : null}

        <InvoiceSheetScroller>
          <EditableInvoiceCard
            invoice={invoice}
            dispatch={dispatch}
            onLogoFile={setLogoFromFile}
          />
        </InvoiceSheetScroller>

        {isGuest ? (
          <p className="builder-login-hint no-print mt-6">
            Want to keep a history of invoices you create?{" "}
            <button
              type="button"
              className={cn("font-semibold underline-offset-2 hover:underline")}
              onClick={goToLoginFromPrompt}
            >
              Log in
            </button>
          </p>
        ) : null}
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
