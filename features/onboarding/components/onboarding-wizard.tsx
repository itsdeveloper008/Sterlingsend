"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Building2, CheckCircle2, MapPin, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { OnboardingStepper } from "@/features/onboarding/components/onboarding-stepper";
import { useOnboardingDraft } from "@/hooks/use-onboarding-draft";
import {
  businessAddressSchema,
  businessDetailsSchema,
  invoicePreferencesSchema,
  type OnboardingFormData,
} from "@/lib/validations/onboarding";
import {
  completeOnboarding,
  ensureUserDocument,
} from "@/actions/onboarding.actions";
import { routes } from "@/config/routes";
import { getCurrenciesForSelect, getCurrencyLabel } from "@/config/currencies";
import { ButtonLink } from "@/components/ui/button-link";
import { cn } from "@/lib/utils";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-sm text-destructive">{message}</p>;
}

export function OnboardingWizard({ userEmail }: { userEmail?: string }) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [bootstrapping, setBootstrapping] = useState(true);
  const { data, updateField, clearDraft, hydrated } = useOnboardingDraft(userEmail);

  useEffect(() => {
    async function bootstrap() {
      const result = await ensureUserDocument();
      if (!result.success) {
        toast.error(result.error);
      }
      setBootstrapping(false);
    }
    bootstrap();
  }, []);

  function validateStep(currentStep: number) {
    let schema;
    switch (currentStep) {
      case 2:
        schema = businessDetailsSchema;
        break;
      case 3:
        schema = businessAddressSchema;
        break;
      case 4:
        schema = invoicePreferencesSchema;
        break;
      default:
        return true;
    }

    const result = schema.safeParse(data);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const [key, messages] of Object.entries(
        result.error.flatten().fieldErrors,
      )) {
        if (messages?.[0]) fieldErrors[key] = messages[0];
      }
      setErrors(fieldErrors);
      return false;
    }

    setErrors({});
    return true;
  }

  function goNext() {
    if (step >= 2 && step <= 4 && !validateStep(step)) {
      toast.error("Please fix the highlighted fields");
      return;
    }
    setStep((current) => Math.min(current + 1, 5));
  }

  function goBack() {
    setErrors({});
    setStep((current) => Math.max(current - 1, 1));
  }

  async function handleComplete() {
    if (!validateStep(4)) {
      toast.error("Please fix the highlighted fields");
      return;
    }

    setSubmitting(true);
    const result = await completeOnboarding(data);
    setSubmitting(false);

    if (!result.success) {
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

    clearDraft();
    setStep(5);
    toast.success("Business profile created");
    router.refresh();
  }

  if (!hydrated || bootstrapping) {
    return (
      <Card>
        <CardContent className="flex min-h-[320px] items-center justify-center py-12">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="text-sm text-muted-foreground">Preparing onboarding...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <OnboardingStepper currentStep={step} />

      <Card className="border shadow-sm">
        {step === 1 && (
          <>
            <CardHeader className="text-center sm:text-left">
              <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Sparkles className="h-5 w-5" />
              </div>
              <CardTitle className="text-2xl">Welcome to SterlingSend</CardTitle>
              <CardDescription className="text-base">
                Create your business profile so you can start invoicing clients
                professionally.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
                <p className="font-medium text-foreground">Estimated time: 2 minutes</p>
                <p className="mt-1">
                  We&apos;ll collect your business details, address, and invoice
                  preferences. You can update everything later in Settings.
                </p>
              </div>
              <Button className="w-full sm:w-auto" onClick={goNext}>
                Get started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </>
        )}

        {step === 2 && (
          <>
            <CardHeader>
              <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Building2 className="h-5 w-5" />
              </div>
              <CardTitle>Business details</CardTitle>
              <CardDescription>
                This information appears on your invoices.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="businessName">Business name *</Label>
                <Input
                  id="businessName"
                  value={data.businessName}
                  onChange={(e) => updateField("businessName", e.target.value)}
                  placeholder="Acme Consulting Ltd"
                  aria-invalid={Boolean(errors.businessName)}
                />
                <FieldError message={errors.businessName} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Business email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={data.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  placeholder="hello@yourbusiness.co.uk"
                  aria-invalid={Boolean(errors.email)}
                />
                <FieldError message={errors.email} />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={data.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                    placeholder="+44 7700 900000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={data.website}
                    onChange={(e) => updateField("website", e.target.value)}
                    placeholder="https://yourbusiness.co.uk"
                    aria-invalid={Boolean(errors.website)}
                  />
                  <FieldError message={errors.website} />
                </div>
              </div>
            </CardContent>
          </>
        )}

        {step === 3 && (
          <>
            <CardHeader>
              <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <MapPin className="h-5 w-5" />
              </div>
              <CardTitle>Business address</CardTitle>
              <CardDescription>
                Your registered or trading address for invoices.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="addressLine1">Address line 1 *</Label>
                <Input
                  id="addressLine1"
                  value={data.addressLine1}
                  onChange={(e) => updateField("addressLine1", e.target.value)}
                  aria-invalid={Boolean(errors.addressLine1)}
                />
                <FieldError message={errors.addressLine1} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="addressLine2">Address line 2</Label>
                <Input
                  id="addressLine2"
                  value={data.addressLine2}
                  onChange={(e) => updateField("addressLine2", e.target.value)}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={data.city}
                    onChange={(e) => updateField("city", e.target.value)}
                    aria-invalid={Boolean(errors.city)}
                  />
                  <FieldError message={errors.city} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postcode">Postcode *</Label>
                  <Input
                    id="postcode"
                    value={data.postcode}
                    onChange={(e) => updateField("postcode", e.target.value)}
                    aria-invalid={Boolean(errors.postcode)}
                  />
                  <FieldError message={errors.postcode} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country *</Label>
                <Input
                  id="country"
                  value={data.country}
                  onChange={(e) => updateField("country", e.target.value)}
                  aria-invalid={Boolean(errors.country)}
                />
                <FieldError message={errors.country} />
              </div>
            </CardContent>
          </>
        )}

        {step === 4 && (
          <>
            <CardHeader>
              <CardTitle>Invoice preferences</CardTitle>
              <CardDescription>
                Defaults to save time when creating invoices.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="invoicePrefix">Invoice prefix</Label>
                  <Input
                    id="invoicePrefix"
                    value={data.invoicePrefix}
                    onChange={(e) => updateField("invoicePrefix", e.target.value)}
                    aria-invalid={Boolean(errors.invoicePrefix)}
                  />
                  <FieldError message={errors.invoicePrefix} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="invoiceStartingNumber">Starting number</Label>
                  <Input
                    id="invoiceStartingNumber"
                    type="number"
                    min={1}
                    value={data.invoiceStartingNumber}
                    onChange={(e) =>
                      updateField(
                        "invoiceStartingNumber",
                        Number(e.target.value),
                      )
                    }
                    aria-invalid={Boolean(errors.invoiceStartingNumber)}
                  />
                  <FieldError message={errors.invoiceStartingNumber} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <select
                  id="currency"
                  value={data.currency}
                  onChange={(e) =>
                    updateField(
                      "currency",
                      e.target.value as OnboardingFormData["currency"],
                    )
                  }
                  className={cn(
                    "flex h-9 w-full rounded-lg border border-input bg-background px-3 text-sm",
                    "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 outline-none",
                  )}
                >
                  {getCurrenciesForSelect().map((currency) => (
                    <option key={currency.code} value={currency.code}>
                      {getCurrencyLabel(currency.code)}
                    </option>
                  ))}
                </select>
                <FieldError message={errors.currency} />
              </div>
              <p className="text-xs text-muted-foreground">
                Example invoice number: {data.invoicePrefix}-{data.invoiceStartingNumber}
              </p>
            </CardContent>
          </>
        )}

        {step === 5 && (
          <>
            <CardHeader className="text-center sm:text-left">
              <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary sm:mx-0">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <CardTitle className="text-2xl">You&apos;re all set</CardTitle>
              <CardDescription className="text-base">
                <span className="font-medium text-foreground">
                  {data.businessName}
                </span>{" "}
                is ready to invoice. You can create your first invoice from the
                dashboard.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ButtonLink href={routes.dashboard} className="w-full sm:w-auto">
                Go to dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </ButtonLink>
            </CardContent>
          </>
        )}

        {step > 1 && step < 5 && (
          <div className="flex flex-col-reverse gap-3 border-t px-6 py-4 sm:flex-row sm:justify-between">
            <Button variant="outline" onClick={goBack} disabled={submitting}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            {step < 4 ? (
              <Button onClick={goNext}>
                Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={handleComplete} disabled={submitting}>
                {submitting ? "Saving..." : "Complete setup"}
              </Button>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
