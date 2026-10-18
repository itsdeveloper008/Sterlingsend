"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Building2 } from "lucide-react";
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
import { BusinessLogoUploadForm } from "@/features/settings/components/business-logo-upload-form";
import { useOnboardingDraft } from "@/hooks/use-onboarding-draft";
import { onboardingSchema } from "@/lib/validations/onboarding";
import {
  completeOnboarding,
  ensureUserDocument,
} from "@/actions/onboarding.actions";
import { updateBusinessLogoAction } from "@/actions/business.actions";
import { uploadBusinessLogo } from "@/firebase/storage";
import { routes } from "@/config/routes";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-sm text-destructive">{message}</p>;
}

export function OnboardingWizard({ userEmail }: { userEmail?: string }) {
  const router = useRouter();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [bootstrapping, setBootstrapping] = useState(true);
  const [logoFile, setLogoFile] = useState<File | null>(null);
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
        const downloadUrl = await uploadBusinessLogo(result.businessId, logoFile);
        const logoResult = await updateBusinessLogoAction(downloadUrl);
        if (!logoResult.success) {
          toast.error(logoResult.error || "Profile saved, but logo upload failed");
        }
      } catch (error) {
        console.error("[onboarding-logo]", error);
        toast.error("Profile saved, but logo upload failed");
      }
    }

    clearDraft();
    toast.success("Business profile created");
    router.push(routes.invoicesNew);
    router.refresh();
  }

  if (!hydrated || bootstrapping) {
    return (
      <Card>
        <CardContent className="flex min-h-[320px] items-center justify-center py-12">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="text-sm text-muted-foreground">
              Preparing onboarding...
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border shadow-sm">
      <CardHeader>
        <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Building2 className="h-5 w-5" />
        </div>
        <CardTitle className="text-2xl">Set up your business</CardTitle>
        <CardDescription className="text-base">
          Just a name, email, and optional logo  -  then you can create invoices.
          You can add more details later in Settings.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={(event) => void handleSubmit(event)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="businessName">Business name *</Label>
            <Input
              id="businessName"
              value={data.businessName}
              onChange={(e) => updateField("businessName", e.target.value)}
              placeholder="Acme Consulting Ltd"
              aria-invalid={Boolean(errors.businessName)}
              autoComplete="organization"
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
              autoComplete="email"
            />
            <FieldError message={errors.email} />
          </div>

          <div className="space-y-2">
            <Label>Logo</Label>
            <BusinessLogoUploadForm
              deferred
              compact
              businessName={data.businessName}
              onDeferredFileChange={setLogoFile}
            />
          </div>

          <Button type="submit" className="w-full sm:w-auto" disabled={submitting}>
            {submitting ? "Saving..." : "Continue to invoices"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
