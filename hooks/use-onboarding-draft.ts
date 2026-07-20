"use client";

import { useEffect, useState } from "react";
import {
  defaultOnboardingValues,
  type OnboardingFormData,
} from "@/lib/validations/onboarding";

const DRAFT_KEY = "valix_onboarding_draft";

export function useOnboardingDraft(initialEmail?: string) {
  const [hydrated, setHydrated] = useState(false);
  const [data, setData] = useState<OnboardingFormData>({
    ...defaultOnboardingValues,
    email: initialEmail ?? "",
  });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<OnboardingFormData>;
        setData((current) => ({
          ...current,
          ...parsed,
          email: parsed.email || initialEmail || current.email,
        }));
      } else if (initialEmail) {
        setData((current) => ({ ...current, email: initialEmail }));
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
  }, [data, hydrated]);

  function clearDraft() {
    localStorage.removeItem(DRAFT_KEY);
  }

  function updateField<K extends keyof OnboardingFormData>(
    key: K,
    value: OnboardingFormData[K],
  ) {
    setData((current) => ({ ...current, [key]: value }));
  }

  return { data, setData, updateField, clearDraft, hydrated };
}
