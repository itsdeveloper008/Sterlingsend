"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Download, Loader2, MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import { SiteHeader } from "@/components/shell";
import { EditableInvoiceCard } from "@/features/invoice-builder/components/editable-invoice-card";
import { InvoiceSheetScroller } from "@/features/invoice-builder/components/invoice-sheet-scroller";
import {
  InvoiceOptionsPanel,
  type SaveStatus,
} from "@/features/invoice-builder/components/invoice-options-panel";
import dynamic from "next/dynamic";
import { UnsavedChangesGuard } from "@/features/invoice-builder/components/unsaved-changes-guard";
import { useInvoiceBuilder } from "@/features/invoice-builder/hooks/use-invoice-builder";
import { writeSessionTemplateId } from "@/lib/template-preference";
import { writeSessionAccent } from "@/lib/invoice-accent";
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
import type { InvoiceStamp } from "@/features/invoice-builder/lib/stamps";
import type { BuilderInvoice } from "@/features/invoice-builder/types";
import { downloadBuilderInvoicePdf } from "@/pdf/utils/download-builder-with-template";
import "@/features/invoice-builder/styles/invoice-builder.css";

const TemplatePickerDialog = dynamic(
  () =>
    import("@/features/invoice-builder/components/template-picker-dialog").then(
      (m) => ({ default: m.TemplatePickerDialog }),
    ),
  { ssr: false },
);

function downloadPdf(invoice: BuilderInvoice) {
  return downloadBuilderInvoicePdf(invoice);
}

function serializedToBuilder(doc: SerializedInvoice) {
  const base = createDefaultBuilderInvoice();
  const patch = invoiceDocToBuilder(doc);
  return {
    ...base,
    ...patch,
    customer: patch.customer ?? base.customer,
    items: patch.items ?? base.items,
    templateId: patch.templateId ?? base.templateId,
    accent: patch.accent ?? base.accent,
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
  const [downloadConfirm, setDownloadConfirm] = useState(false);
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [isRail, setIsRail] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(
    initialInvoice?.id ?? editId,
  );
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [showOnboardingPrompt, setShowOnboardingPrompt] = useState(false);
  const [showRestoredBanner, setShowRestoredBanner] = useState(false);
  const [stampRepositioning, setStampRepositioning] = useState(false);
  const [stampAnimate, setStampAnimate] = useState(false);
  const saveTimer = useRef<number | null>(null);
  const invoiceRef = useRef(invoice);
  invoiceRef.current = invoice;
  const hydratedEdit = useRef(false);
  const optionsSheetRef = useRef<HTMLDivElement>(null);

  const currencies = getCurrenciesForSelect();
  const isGuest = !authLoading && !user;
  const isLoggedIn = !authLoading && !!user;

  const persist = useCallback(
    async (reason: "manual" | "auto" | "download" | "print") => {
      if (!user) return false;
      const payload = builderToSavePayload(invoiceRef.current);
      // A blank invoice can still be downloaded or printed; it just isn't
      // saved to History until it has a client, so don't surface an error.
      if (!payload.clientName.trim()) {
        setSaveStatus("needs-client");
        if (reason === "manual") toast.info("Add a client name to save this invoice");
        return false;
      }
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
      // Prefill the "from" block from Account, only where the sheet is still empty.
      const defaults = result.businessDefaults;
      if (!defaults) return;
      const current = invoiceRef.current;
      const pick = (typed: string, saved: string) => typed.trim() || saved;
      const paymentEmpty = !Object.values(current.payment).some((v) => v.trim());
      const savedPayment = Object.values(defaults.payment).some((v) => v.trim());
      dispatch({
        type: "patch",
        patch: {
          business: {
            ...current.business,
            name: pick(current.business.name, defaults.name),
            address: pick(current.business.address, defaults.address),
            email: pick(current.business.email, defaults.email),
            phone: pick(current.business.phone, defaults.phone),
            vatNumber: pick(current.business.vatNumber, defaults.vatNumber),
          },
          ...(!current.logoDataUrl && defaults.logoUrl
            ? { logoDataUrl: defaults.logoUrl }
            : {}),
          ...(paymentEmpty && savedPayment
            ? { payment: defaults.payment, showPayment: true }
            : {}),
        },
      });
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

  useEffect(() => {
    function onResize() {
      const w = window.innerWidth;
      setIsRail(w >= 900 && w < 1140);
    }
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    if (!optionsOpen) return;
    const prev = document.activeElement as HTMLElement | null;
    const root = optionsSheetRef.current;
    const focusable = root?.querySelector<HTMLElement>(
      "button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])",
    );
    focusable?.focus();
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOptionsOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      prev?.focus?.();
    };
  }, [optionsOpen]);

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
      setDownloadConfirm(true);
      window.setTimeout(() => setDownloadConfirm(false), 4000);
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

  function handleAccentChange(hex: string | undefined) {
    writeSessionAccent(hex);
    dispatch({ type: "patch", patch: { accent: hex } });
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
      className="builder-currency-select builder-currency-select--compact no-print"
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

  const panelProps = {
    templateId: invoice.templateId,
    accent: invoice.accent,
    onAccentChange: handleAccentChange,
    stamp: invoice.stamp,
    repositioning: stampRepositioning,
    onStampChange: handleStampChange,
    onRepositionToggle: setStampRepositioning,
    onOpenTemplate: () => setPickerOpen(true),
    onPrint: () => void handlePrint(),
    onDownload: () => void handleDownloadPdf(),
    busy,
    downloadConfirm,
    saveStatus,
    isGuest,
    isLoggedIn,
    onLogin: goToLoginFromPrompt,
    onSignup: goToSignupFromPrompt,
    onRetrySave: () => void persist("manual"),
  };

  return (
    <div className="builder-page ss-calm-zone">
      <UnsavedChangesGuard dirty={dirty && !savedId} />
      <SiteHeader />

      <div className="builder-intro no-print">
        <h1>Create an invoice</h1>
        <p>
          Fill it in, pick a template, download the PDF. No signup needed.
        </p>
      </div>

      <div
        className="builder-workspace"
        data-rail={isRail ? "true" : undefined}
      >
        <div className="builder-workspace-sheet">
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

          <div className="builder-stack">
            <div className="builder-stack-layer" aria-hidden />
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
        </div>

        <div className="builder-workspace-panel">
          <InvoiceOptionsPanel {...panelProps} />
        </div>
      </div>

      <div className="builder-mobile-bar no-print">
        <button
          type="button"
          className="inv-panel-btn-outline"
          aria-label="Options"
          aria-expanded={optionsOpen}
          onClick={() => setOptionsOpen(true)}
        >
          <MoreHorizontal className="h-5 w-5" aria-hidden />
          Options
        </button>
        <button
          type="button"
          className="inv-panel-btn-primary"
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

      {optionsOpen ? (
        <div
          className="builder-options-sheet no-print"
          role="dialog"
          aria-modal="true"
          aria-label="Invoice options"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOptionsOpen(false);
          }}
        >
          <div className="builder-options-sheet-panel" ref={optionsSheetRef}>
            <div className="mb-3 flex items-center justify-between">
              <p className="inv-panel-kicker" style={{ margin: 0 }}>
                Options
              </p>
              <button
                type="button"
                className="inv-panel-link"
                onClick={() => setOptionsOpen(false)}
              >
                Close
              </button>
            </div>
            <InvoiceOptionsPanel {...panelProps} />
          </div>
        </div>
      ) : null}

      <TemplatePickerDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        selectedId={invoice.templateId}
        onSelect={handleSelectTemplate}
      />
    </div>
  );
}
