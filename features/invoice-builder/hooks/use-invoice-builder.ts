"use client";

import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import {
  createDefaultBuilderInvoice,
  createEmptyBuilderLineItem,
  createLandingDemoInvoice,
} from "@/features/invoice-builder/lib/defaults";
import { clearBuilderInvoice } from "@/features/invoice-builder/lib/storage";
import type {
  BuilderInvoice,
  BuilderInvoiceAction,
} from "@/features/invoice-builder/types";

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
 * Guest/landing invoice state lives in React only.
 * Refresh always starts clean — no localStorage restore.
 */
export function useInvoiceBuilder(options?: { seed?: "empty" | "demo" }) {
  const seed = options?.seed ?? "empty";
  const [invoice, dispatch] = useReducer(
    reducer,
    undefined,
    seed === "demo" ? createLandingDemoInvoice : createDefaultBuilderInvoice,
  );
  const [hydrated, setHydrated] = useState(false);
  const logoObjectUrl = useRef<string | null>(null);

  useEffect(() => {
    // Wipe any previously saved drafts so refresh never shows old client data
    clearBuilderInvoice();
    setHydrated(true);
  }, []);

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
      dispatch({ type: "setLogo", logoDataUrl: undefined });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : undefined;
      dispatch({ type: "setLogo", logoDataUrl: result });
    };
    reader.readAsDataURL(file);
  }, []);

  const resetInvoice = useCallback(() => {
    clearBuilderInvoice();
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
    draftRestored: false,
    dismissDraftNotice: () => undefined,
    dispatch,
    setLogoFromFile,
    resetInvoice,
  };
}
