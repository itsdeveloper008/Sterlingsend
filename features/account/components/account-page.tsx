"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { FloatingLabelField, FormStatus } from "@/components/ui/form-field";
import { BusinessLogoUploadForm } from "@/features/settings/components/business-logo-upload-form";
import { InvoiceTemplatePicker } from "@/features/settings/components/invoice-template-picker";
import { updateAccountAction } from "@/actions/account.actions";
import { useAuth } from "@/hooks/use-auth";
import { PageHeader, PageShell } from "@/components/design-system";

export function AccountPage({
  businessId,
  businessName,
  email,
  logoUrl,
  templateId,
}: {
  businessId: string;
  businessName: string;
  email: string;
  logoUrl?: string | null;
  templateId: string;
}) {
  const { signOut } = useAuth();
  const [name, setName] = useState(businessName);
  const [accountEmail, setAccountEmail] = useState(email);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await updateAccountAction({
        businessName: name,
        email: accountEmail,
      });
      if (!result.success) {
        setError(result.error);
        toast.error(result.error);
        return;
      }
      toast.success("Account saved");
    });
  }

  return (
    <PageShell className="ss-calm-zone">
      <PageHeader
        title="Account"
        description="Business details, logo, and default template."
      />

      <form onSubmit={onSubmit} className="mx-auto max-w-xl space-y-6">
        <FloatingLabelField
          id="account-business-name"
          label="Business name"
          value={name}
          onChange={setName}
          required
        />
        <FloatingLabelField
          id="account-email"
          label="Email"
          type="email"
          value={accountEmail}
          onChange={setAccountEmail}
          required
        />
        <FormStatus message={error} tone="error" />
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save"}
        </Button>
      </form>

      <div className="mx-auto mt-10 max-w-xl space-y-10">
        <BusinessLogoUploadForm
          businessId={businessId}
          logoUrl={logoUrl}
          businessName={name}
          compact
        />
        <InvoiceTemplatePicker initialTemplateId={templateId} />
        <div className="border-t border-border-subtle pt-6">
          <Button type="button" variant="outline" onClick={() => void signOut()}>
            Log out
          </Button>
        </div>
      </div>
    </PageShell>
  );
}
