"use client";

import { useEffect, useState } from "react";
import {
  defaultOnboardingValues,
  type OnboardingFormData,
} from "@/lib/validations/onboarding";

const DRAFT_KEY = "ss_onboarding_draft";
const LEGACY_DRAFT_KEY = "valix_onboarding_draft";

export function useOnboardingDraft(
  initialEmail?: string,
  initial?: Partial<OnboardingFormData>,
) {
  const [hydrated, setHydrated] = useState(false);
  const [data, setData] = useState<OnboardingFormData>({
    ...defaultOnboardingValues,
    ...initial,
    email: initial?.email || initialEmail || "",
  });

  useEffect(() => {
    try {
      const raw =
        localStorage.getItem(DRAFT_KEY) ??
        localStorage.getItem(LEGACY_DRAFT_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<OnboardingFormData>;
        setData((current) => ({
          businessName: parsed.businessName || current.businessName,
          email: parsed.email || current.email,
          businessType: parsed.businessType || current.businessType,
          phone: parsed.phone || current.phone,
          city: parsed.city || current.city,
          postcode: parsed.postcode || current.postcode,
        }));
      } else if (initialEmail) {
        setData((current) => ({ ...current, email: current.email || initialEmail }));
      }
    } catch {
      // ignore corrupt draft
    } finally {
      setHydrated(true);
    }
  }, [initialEmail]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(DRAFT_KEY, JSON.stringify(data));
    localStorage.removeItem(LEGACY_DRAFT_KEY);
  }, [data, hydrated]);

  function clearDraft() {
    localStorage.removeItem(DRAFT_KEY);
    localStorage.removeItem(LEGACY_DRAFT_KEY);
  }

  function updateField<K extends keyof OnboardingFormData>(
    key: K,
    value: OnboardingFormData[K],
  ) {
    setData((current) => ({ ...current, [key]: value }));
  }

  return { data, setData, updateField, clearDraft, hydrated };
}
