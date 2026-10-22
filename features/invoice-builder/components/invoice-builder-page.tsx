"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Check,
  Download,
  Loader2,
  MoreHorizontal,
  Printer,
  Save,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/shell";
import { EditableInvoiceCard } from "@/features/invoice-builder/components/editable-invoice-card";
import { InvoiceSheetScroller } from "@/features/invoice-builder/components/invoice-sheet-scroller";
import dynamic from "next/dynamic";
import { UnsavedChangesGuard } from "@/features/invoice-builder/components/unsaved-changes-guard";
import { useInvoiceBuilder } from "@/features/invoice-builder/hooks/use-invoice-builder";
import { writeSessionTemplateId } from "@/lib/template-preference";
import { getInvoiceTemplate } from "@/pdf/templates/catalog";
import {
  getCurrenciesForSelect,
  getCurrencySymbol,
  isCurrencyCode,
} from "@/config/currencies";
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
import { StampPopover } from "@/features/invoice-builder/components/stamp-popover";
import type { InvoiceStamp } from "@/features/invoice-builder/lib/stamps";
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
    stamp: patch.stamp,
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
  const [busy, setBusy] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [showLoginHint, setShowLoginHint] = useState(true);
  const [savedId, setSavedId] = useState<string | null>(
    initialInvoice?.id ?? editId,
  );
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [showOnboardingPrompt, setShowOnboardingPrompt] = useState(false);
  const [showRestoredBanner, setShowRestoredBanner] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [stampRepositioning, setStampRepositioning] = useState(false);
  const [stampAnimate, setStampAnimate] = useState(false);
  const saveTimer = useRef<number | null>(null);
  const invoiceRef = useRef(invoice);
  invoiceRef.current = invoice;
  const hydratedEdit = useRef(false);

  const template = getInvoiceTemplate(invoice.templateId);
  const currencies = getCurrenciesForSelect();
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

  function handleStampChange(next: InvoiceStamp | undefined) {
    const prevType = invoice.stamp?.type;
    dispatch({ type: "patch", patch: { stamp: next } });
    if (next && next.type !== prevType) {
      setStampAnimate(true);
      window.setTimeout(() => setStampAnimate(false), 220);
    }
    if (!next) setStampRepositioning(false);
  }

  void hydrated;

  const currencySelect = (
    <select
      className="builder-currency-select no-print"
      value={invoice.currency}
      onChange={(event) => {
        const next = event.target.value;
        if (!isCurrencyCode(next)) return;
        dispatch({ type: "patch", patch: { currency: next } });
      }}
      aria-label="Currency"
      disabled={busy}
    >
      {currencies.map((c) => (
        <option key={c.code} value={c.code}>
          {c.code} ({getCurrencySymbol(c.code)})
        </option>
      ))}
    </select>
  );

  const desktopActions = (
    <div className="builder-actions-row no-print">
      <button
        type="button"
        className="builder-btn-secondary"
        onClick={() => setPickerOpen(true)}
        disabled={busy}
      >
        Template: {template.name}
      </button>
      <StampPopover
        stamp={invoice.stamp}
        repositioning={stampRepositioning}
        onStampChange={handleStampChange}
        onRepositionToggle={setStampRepositioning}
        disabled={busy}
        triggerClassName="builder-btn-secondary"
      />
      {isLoggedIn ? (
        <button
          type="button"
          className="builder-btn-secondary"
          onClick={() => void persist("manual")}
          disabled={busy || saveStatus === "saving"}
        >
          {saveStatus === "saving" ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : saveStatus === "saved" ? (
            <Check className="h-4 w-4" aria-hidden strokeWidth={2.5} />
          ) : (
            <Save className="h-4 w-4" aria-hidden />
          )}
          Save
        </button>
      ) : null}
      <button
        type="button"
        className="builder-btn-secondary"
        onClick={() => void handlePrint()}
        disabled={busy}
      >
        <Printer className="h-4 w-4" aria-hidden />
        Print
      </button>
      <button
        type="button"
        className="builder-btn-primary"
        onClick={() => void handleDownloadPdf()}
        disabled={busy}
      >
        {busy ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        ) : (
          <Download className="h-4 w-4" aria-hidden />
        )}
        Download PDF
      </button>
    </div>
  );

  return (
    <div className="builder-page ss-calm-zone">
      <UnsavedChangesGuard dirty={dirty && !savedId} />
      <SiteHeader />

      {showLoginHint && isGuest ? (
        <div className="builder-login-banner no-print" role="status">
          <p>
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
          <button
            type="button"
            className="text-[#475569] underline-offset-2 hover:underline"
            onClick={() => setShowLoginHint(false)}
          >
            Dismiss
          </button>
        </div>
      ) : null}

      <div className="builder-intro no-print">
        <h1>Create an invoice</h1>
        <p>
          Fill it in, pick a template, download the PDF. No signup needed.
        </p>
      </div>

      <div className="builder-sheet-wrap">
        {showRestoredBanner && isLoggedIn ? (
          <p
            className="no-print mb-4 rounded-[14px] border border-[#A7F3D0] bg-[#ECFDF5] px-4 py-3 text-sm text-[#065F46]"
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
            className="no-print mb-4 flex flex-wrap items-center justify-between gap-2 rounded-[14px] border border-[#E2E8F0] bg-white px-4 py-3 text-sm text-[#0F172A]"
            role="status"
          >
            <span>
              Add a logo and confirm your business details when you like.
            </span>
            <span className="flex gap-2">
              <Link
                href={routes.onboarding}
                className="font-semibold text-[#0F766E] underline-offset-2 hover:underline"
              >
                Finish setup
              </Link>
              <button
                type="button"
                className="text-[#475569] underline-offset-2 hover:underline"
                onClick={() => setShowOnboardingPrompt(false)}
              >
                Dismiss
              </button>
            </span>
          </p>
        ) : null}

        {isLoggedIn && saveStatus !== "idle" ? (
          <p
            className="no-print mb-3 text-center text-sm text-[#475569]"
            aria-live="polite"
          >
            {saveStatus === "saving" ? "Saving…" : null}
            {saveStatus === "saved" ? "Saved" : null}
            {saveStatus === "error" ? (
              <>
                Could not save.{" "}
                <button
                  type="button"
                  className="font-semibold text-[#0F766E] underline-offset-2 hover:underline"
                  onClick={() => void persist("manual")}
                >
                  Retry
                </button>
              </>
            ) : null}
          </p>
        ) : null}

        <div className="builder-stack">
          <div
            className="builder-stack-layer builder-stack-layer--2"
            aria-hidden
          />
          <div
            className="builder-stack-layer builder-stack-layer--1"
            aria-hidden
          />
          <div className="builder-stack-sheet">
            <InvoiceSheetScroller>
              <EditableInvoiceCard
                invoice={invoice}
                dispatch={dispatch}
                onLogoFile={setLogoFromFile}
                currencySelect={currencySelect}
                stampRepositioning={stampRepositioning}
                onStampChange={(stamp) => handleStampChange(stamp)}
                onExitStampReposition={() => setStampRepositioning(false)}
                stampAnimate={stampAnimate}
              />
            </InvoiceSheetScroller>
          </div>
        </div>

        {desktopActions}

        {isGuest ? (
          <p className="builder-guest-line no-print">
            Want to keep a history of the invoices you create?{" "}
            <button
              type="button"
              className="builder-guest-line-link"
              onClick={goToLoginFromPrompt}
            >
              Log in
            </button>
          </p>
        ) : null}
      </div>

      <div className="builder-mobile-bar no-print">
        <div className="relative">
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="More actions"
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen((v) => !v)}
          >
            <MoreHorizontal className="h-5 w-5" />
          </Button>
          {mobileMenuOpen ? (
            <div className="builder-mobile-menu">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setPickerOpen(true);
                }}
              >
                Template
              </button>
              <div className="builder-mobile-menu-stamp px-3 py-2">
                <StampPopover
                  stamp={invoice.stamp}
                  repositioning={stampRepositioning}
                  onStampChange={handleStampChange}
                  onRepositionToggle={setStampRepositioning}
                  disabled={busy}
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  void handlePrint();
                }}
              >
                Print
              </button>
              {isLoggedIn ? (
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    void persist("manual");
                  }}
                >
                  Save
                </button>
              ) : null}
            </div>
          ) : null}
        </div>
        <button
          type="button"
          className="builder-btn-primary min-h-12 flex-1"
          onClick={() => void handleDownloadPdf()}
          disabled={busy}
        >
          {busy ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
          ) : (
            <Download className="mr-2 h-4 w-4" aria-hidden />
          )}
          Download PDF
        </button>
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
