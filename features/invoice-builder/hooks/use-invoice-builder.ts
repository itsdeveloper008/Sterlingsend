"use client";

import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import {
  createDefaultBuilderInvoice,
  createEmptyBuilderLineItem,
  createLandingDemoInvoice,
} from "@/features/invoice-builder/lib/defaults";
import {
  clearBuilderInvoice,
  loadBuilderInvoice,
  saveBuilderInvoice,
} from "@/features/invoice-builder/lib/storage";
import type {
  BuilderInvoice,
  BuilderInvoiceAction,
} from "@/features/invoice-builder/types";
import { readSessionTemplateId } from "@/lib/template-preference";
import { readSessionAccent } from "@/lib/invoice-accent";
import { resolveTemplateRef } from "@/pdf/templates/catalog";

function reducer(state: BuilderInvoice, action: BuilderInvoiceAction): BuilderInvoice {
  switch (action.type) {
    case "hydrate":
      return action.invoice;
    case "patch":
      return { ...state, ...action.patch };
    case "patchBusiness":
      return {
        ...state,
        business: { ...state.business, ...action.patch },
      };
    case "patchCustomer":
      return {
        ...state,
        customer: { ...state.customer, ...action.patch },
      };
    case "patchPayment":
      return {
        ...state,
        payment: { ...state.payment, ...action.patch },
      };
    case "patchItem":
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.id ? { ...item, ...action.patch } : item,
        ),
      };
    case "addItem":
      return {
        ...state,
        items: [...state.items, createEmptyBuilderLineItem()],
      };
    case "removeItem":
      if (state.items.length <= 1) return state;
      return {
        ...state,
        items: state.items.filter((item) => item.id !== action.id),
      };
    case "setLogo":
      return { ...state, logoDataUrl: action.logoDataUrl };
    default:
      return state;
  }
}

/**
 * Guest/landing invoice state. Restores from localStorage when present so
 * fields persist across reload; logged-in saves go through the service layer.
 */
export function useInvoiceBuilder(options?: {
  seed?: "empty" | "demo";
  /** When true, skip wiping storage / template patch (edit or pending restore). */
  skipClearOnMount?: boolean;
  /**
   * When false, never apply sessionStorage ss_template (home hero must stay
   * classic-teal). Default true for /create-invoice.
   */
  applySessionTemplate?: boolean;
  /** When false, do not restore or persist guest drafts (home hero). Default true. */
  persistGuestDraft?: boolean;
}) {
  const seed = options?.seed ?? "empty";
  const skipClearOnMount = options?.skipClearOnMount ?? false;
  const applySessionTemplate = options?.applySessionTemplate ?? true;
  const persistGuestDraft = options?.persistGuestDraft ?? true;
  const [invoice, dispatch] = useReducer(
    reducer,
    undefined,
    seed === "demo" ? createLandingDemoInvoice : createDefaultBuilderInvoice,
  );
  // Start true so first paint can render the sheet (LCP). Session template
  // is applied after mount without blanking the UI.
  const [hydrated] = useState(true);
  const [dirty, setDirty] = useState(false);
  const logoObjectUrl = useRef<string | null>(null);
  const saveTimer = useRef<number | null>(null);
  const restoredRef = useRef(false);

  useEffect(() => {
    if (skipClearOnMount) return;
    if (!persistGuestDraft) {
      clearBuilderInvoice();
      return;
    }
    if (restoredRef.current) return;
    restoredRef.current = true;

    const sessionPatch: Partial<BuilderInvoice> = {};
    if (applySessionTemplate) {
      const sessionId = readSessionTemplateId();
      if (sessionId) {
        const resolved = resolveTemplateRef(sessionId);
        const sessionAccent = readSessionAccent();
        sessionPatch.templateId = resolved.layoutId;
        sessionPatch.accent = sessionAccent ?? resolved.legacyAccent;
      }
    }

    const saved = loadBuilderInvoice();
    if (saved) {
      dispatch({
        type: "hydrate",
        invoice: { ...saved, ...sessionPatch },
      });
      return;
    }

    if (Object.keys(sessionPatch).length > 0) {
      dispatch({ type: "patch", patch: sessionPatch });
    }
  }, [skipClearOnMount, applySessionTemplate, persistGuestDraft]);

  const dispatchTracked = useCallback((action: BuilderInvoiceAction) => {
    if (action.type !== "hydrate") setDirty(true);
    dispatch(action);
  }, []);

  useEffect(() => {
    if (!persistGuestDraft || skipClearOnMount || !dirty) return;
    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => {
      saveBuilderInvoice(invoice);
    }, 400);
    return () => {
      if (saveTimer.current) window.clearTimeout(saveTimer.current);
    };
  }, [invoice, dirty, persistGuestDraft, skipClearOnMount]);

  useEffect(() => {
    return () => {
      if (logoObjectUrl.current) {
        URL.revokeObjectURL(logoObjectUrl.current);
      }
    };
  }, []);

  const setLogoFromFile = useCallback((file: File | null) => {
    if (logoObjectUrl.current) {
      URL.revokeObjectURL(logoObjectUrl.current);
      logoObjectUrl.current = null;
    }

    if (!file) {
      dispatchTracked({ type: "setLogo", logoDataUrl: undefined });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : undefined;
      dispatchTracked({ type: "setLogo", logoDataUrl: result });
    };
    reader.readAsDataURL(file);
  }, [dispatchTracked]);

  const resetInvoice = useCallback(() => {
    clearBuilderInvoice();
    setDirty(false);
    dispatch({
      type: "hydrate",
      invoice:
        seed === "demo"
          ? createLandingDemoInvoice()
          : createDefaultBuilderInvoice(),
    });
  }, [seed]);

  return {
    invoice,
    hydrated,
    dirty,
    draftRestored: false,
    dismissDraftNotice: () => undefined,
    dispatch: dispatchTracked,
    setLogoFromFile,
    resetInvoice,
  };
}
