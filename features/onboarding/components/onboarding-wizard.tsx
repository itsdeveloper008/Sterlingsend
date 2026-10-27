"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  FloatingLabelField,
  FloatingLabelSelect,
  FormStatus,
} from "@/components/ui/form-field";
import { BUSINESS_TYPES } from "@/lib/business-types";
import { BusinessLogoUploadForm } from "@/features/settings/components/business-logo-upload-form";
import { useOnboardingDraft } from "@/hooks/use-onboarding-draft";
import { onboardingSchema } from "@/lib/validations/onboarding";
import {
  completeOnboarding,
  ensureUserDocument,
  skipOnboardingAction,
} from "@/actions/onboarding.actions";
import { updateBusinessLogoAction } from "@/actions/business.actions";
import { logoFileToDataUrl } from "@/lib/logo-data-url";
import { routes } from "@/config/routes";

const SKIP_KEY = "ss_onboarding_skipped";

export function wasOnboardingSkipped(): boolean {
  try {
    return localStorage.getItem(SKIP_KEY) === "1";
  } catch {
    return false;
  }
}

export function markOnboardingSkipped(): void {
  try {
    localStorage.setItem(SKIP_KEY, "1");
  } catch {
    // ignore
  }
}

export function OnboardingWizard({ userEmail }: { userEmail?: string }) {
  const router = useRouter();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [bootstrapping, setBootstrapping] = useState(true);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [success, setSuccess] = useState(false);
  const { data, updateField, clearDraft, hydrated } =
    useOnboardingDraft(userEmail);

  useEffect(() => {
    async function bootstrap() {
      const result = await ensureUserDocument();
      if (!result.success) {
        toast.error(result.error);
      }
      setBootstrapping(false);
    }
    void bootstrap();
  }, []);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const parsed = onboardingSchema.safeParse(data);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const [key, messages] of Object.entries(
        parsed.error.flatten().fieldErrors,
      )) {
        if (messages?.[0]) fieldErrors[key] = messages[0];
      }
      setErrors(fieldErrors);
      toast.error("Please fix the highlighted fields");
      return;
    }

    setErrors({});
    setSubmitting(true);

    const result = await completeOnboarding(parsed.data);
    if (!result.success) {
      setSubmitting(false);
      if (result.fieldErrors) {
        const fieldErrors: Record<string, string> = {};
        for (const [key, messages] of Object.entries(result.fieldErrors)) {
          if (messages?.[0]) fieldErrors[key] = messages[0];
        }
        setErrors(fieldErrors);
      }
      toast.error(result.error);
      return;
    }

    if (logoFile) {
      try {
        const logoDataUrl = await logoFileToDataUrl(logoFile);
        const logoResult = await updateBusinessLogoAction(logoDataUrl);
        if (!logoResult.success) {
          toast.error(logoResult.error || "Profile saved, but logo upload failed");
        }
      } catch (error) {
        console.error("[onboarding-logo]", error);
        toast.error("Profile saved, but logo upload failed");
      }
    }

    clearDraft();
    try {
      localStorage.removeItem(SKIP_KEY);
    } catch {
      // ignore
    }
    setSuccess(true);
    toast.success("Business profile created");
    window.setTimeout(() => {
      router.push(routes.createInvoice);
      router.refresh();
    }, 400);
  }

  async function handleSkip() {
    setSubmitting(true);
    const result = await skipOnboardingAction();
    if (!result.success) {
      setSubmitting(false);
      toast.error(result.error);
      return;
    }
    markOnboardingSkipped();
    clearDraft();
    toast.message("You can finish setup anytime from Account");
    router.push(routes.createInvoice);
    router.refresh();
  }

  if (!hydrated || bootstrapping) {
    return (
      <div className="flex min-h-[320px] items-center justify-center rounded-[var(--radius-lg)] border border-border-subtle bg-card py-12">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--brand-700)] border-t-transparent" />
          <p className="text-sm text-muted-foreground">Preparing setup…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="ss-calm-zone mx-auto w-full max-w-lg rounded-[var(--radius-lg)] border border-border-subtle bg-card p-6 sm:p-8">
      <h1 className="type-h2 text-foreground">Set up your business</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        One step: your business details and an optional logo. You can skip
        and finish later from Account.
      </p>

      <form
        onSubmit={(event) => void handleSubmit(event)}
        className="mt-8 space-y-5"
      >
        <FloatingLabelField
          id="businessName"
          label="Business name"
          value={data.businessName}
          onChange={(value) => updateField("businessName", value)}
          error={errors.businessName}
          autoComplete="organization"
          required
        />
        <FloatingLabelField
          id="email"
          label="Business email"
          type="email"
          value={data.email}
          onChange={(value) => updateField("email", value)}
          error={errors.email}
          autoComplete="email"
          required
        />
        <FloatingLabelSelect
          id="businessType"
          label="Type of business"
          value={data.businessType}
          onChange={(value) =>
            updateField(
              "businessType",
              value as (typeof data)["businessType"],
            )
          }
          options={BUSINESS_TYPES}
          error={errors.businessType}
          required
        />
        <FloatingLabelField
          id="phone"
          label="Phone number"
          type="tel"
          value={data.phone}
          onChange={(value) => updateField("phone", value)}
          error={errors.phone}
          autoComplete="tel"
          required
        />

        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">Logo</p>
          <BusinessLogoUploadForm
            deferred
            compact
            businessName={data.businessName}
            onDeferredFileChange={setLogoFile}
          />
        </div>

        <FormStatus
          message={success ? "Profile saved. Opening the builder…" : null}
          tone="success"
        />

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <Button type="submit" disabled={submitting || success}>
            {submitting ? "Saving…" : "Continue"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={handleSkip}
            disabled={submitting || success}
          >
            Skip
          </Button>
        </div>
      </form>
    </div>
  );
}
