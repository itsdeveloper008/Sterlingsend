"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { FloatingLabelField, FormStatus } from "@/components/ui/form-field";
import { BusinessLogoUploadForm } from "@/features/settings/components/business-logo-upload-form";
import { InvoiceTemplatePicker } from "@/features/settings/components/invoice-template-picker";
import { updateAccountAction } from "@/actions/account.actions";
import { updateAccentColorAction } from "@/actions/settings.actions";
import { useAuth } from "@/hooks/use-auth";
import { PageHeader, PageShell } from "@/components/design-system";
import {
  ACCENT_PRESETS,
  DEFAULT_ACCENT_HEX,
  normalizeHex,
} from "@/lib/invoice-accent";
import { cn } from "@/lib/utils";

export function AccountPage({
  businessId,
  businessName,
  email,
  logoUrl,
  templateId,
  accentColor,
}: {
  businessId: string;
  businessName: string;
  email: string;
  logoUrl?: string | null;
  templateId: string;
  accentColor?: string;
}) {
  const { signOut } = useAuth();
  const [name, setName] = useState(businessName);
  const [accountEmail, setAccountEmail] = useState(email);
  const [accent, setAccent] = useState(accentColor ?? DEFAULT_ACCENT_HEX);
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
        <div>
          <h2 className="text-base font-semibold text-[#0F172A]">
            Default colour
          </h2>
          <p className="mt-1 text-sm text-[#64748B]">
            Used for new invoices when you are logged in.
          </p>
          <div className="mt-3 flex flex-wrap gap-2" role="listbox" aria-label="Default accent">
            {ACCENT_PRESETS.map((p) => (
              <button
                key={p.id}
                type="button"
                role="option"
                aria-selected={accent.toUpperCase() === p.hex.toUpperCase()}
                aria-label={p.name}
                title={p.name}
                className={cn(
                  "size-6 rounded-md border border-[#E2E8F0]",
                  accent.toUpperCase() === p.hex.toUpperCase() &&
                    "ring-2 ring-offset-2 ring-[#0F766E]",
                )}
                style={{ background: p.hex }}
                onClick={() => {
                  setAccent(p.hex);
                  startTransition(async () => {
                    try {
                      await updateAccentColorAction(p.hex);
                      toast.success("Default colour saved");
                    } catch {
                      toast.error("Could not save colour");
                    }
                  });
                }}
              />
            ))}
          </div>
          <div className="mt-3 flex items-center gap-2">
            <input
              type="color"
              value={normalizeHex(accent) ?? DEFAULT_ACCENT_HEX}
              aria-label="Custom default colour"
              onChange={(e) => {
                const hex = normalizeHex(e.target.value);
                if (!hex) return;
                setAccent(hex);
                startTransition(async () => {
                  try {
                    await updateAccentColorAction(hex);
                    toast.success("Default colour saved");
                  } catch {
                    toast.error("Could not save colour");
                  }
                });
              }}
            />
            <button
              type="button"
              className="text-sm font-semibold text-[#0F766E]"
              onClick={() => {
                setAccent(DEFAULT_ACCENT_HEX);
                startTransition(async () => {
                  try {
                    await updateAccentColorAction(DEFAULT_ACCENT_HEX);
                    toast.success("Reset to default");
                  } catch {
                    toast.error("Could not save colour");
                  }
                });
              }}
            >
              Reset to default
            </button>
          </div>
        </div>
        <div className="border-t border-border-subtle pt-6">
          <Button type="button" variant="outline" onClick={() => void signOut()}>
            Log out
          </Button>
        </div>
      </div>
    </PageShell>
  );
}
