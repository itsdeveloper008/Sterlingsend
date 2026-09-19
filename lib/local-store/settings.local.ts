"use client";

import { DEFAULT_SETTINGS, type BrandingSettings, type Settings } from "@/types";
import { DEFAULT_INVOICE_TEMPLATE_ID, getInvoiceTemplate } from "@/pdf/templates/catalog";
import { LOCAL_BUSINESS_ID, LOCAL_STORE_KEYS } from "@/lib/local-store/keys";
import { readJson, writeJson } from "@/lib/local-store/storage";

export type LocalSettings = Omit<
  Settings,
  "id" | "createdAt" | "updatedAt"
> & {
  id: string;
  createdAt: string;
  updatedAt: string;
};

function nowIso() {
  return new Date().toISOString();
}

function defaultLocalSettings(): LocalSettings {
  const stamp = nowIso();
  return {
    id: LOCAL_BUSINESS_ID,
    businessId: LOCAL_BUSINESS_ID,
    ...DEFAULT_SETTINGS,
    createdAt: stamp,
    updatedAt: stamp,
  };
}

export function getLocalSettings(): LocalSettings {
  const stored = readJson<LocalSettings | null>(LOCAL_STORE_KEYS.settings, null);
  if (!stored) {
    const created = defaultLocalSettings();
    writeJson(LOCAL_STORE_KEYS.settings, created);
    return created;
  }
  return {
    ...defaultLocalSettings(),
    ...stored,
    invoice: { ...DEFAULT_SETTINGS.invoice, ...stored.invoice },
    branding: {
      ...DEFAULT_SETTINGS.branding,
      ...stored.branding,
      templateId:
        stored.branding?.templateId || DEFAULT_INVOICE_TEMPLATE_ID,
    },
    notifications: {
      ...DEFAULT_SETTINGS.notifications,
      ...stored.notifications,
    },
    stripe: { ...DEFAULT_SETTINGS.stripe, ...stored.stripe },
  };
}

export function updateLocalBranding(
  patch: Partial<BrandingSettings>,
): LocalSettings {
  const current = getLocalSettings();
  const template = getInvoiceTemplate(
    patch.templateId ?? current.branding.templateId,
  );
  const next: LocalSettings = {
    ...current,
    branding: {
      ...current.branding,
      ...patch,
      templateId: template.id,
      primaryColor: patch.primaryColor ?? template.primary,
      accentColor: patch.accentColor ?? template.accent,
    },
    updatedAt: nowIso(),
  };
  writeJson(LOCAL_STORE_KEYS.settings, next);
  return next;
}

export function clearLocalSettings() {
  writeJson(LOCAL_STORE_KEYS.settings, defaultLocalSettings());
}

export function peekLocalSettings(): LocalSettings | null {
  return readJson<LocalSettings | null>(LOCAL_STORE_KEYS.settings, null);
}
