import { PageShell, SettingsShell } from "@/components/design-system";

export default function SettingsInvoicesPage() {
  return (
    <PageShell>
      <SettingsShell
        title="Invoices"
        description="Invoice numbering, defaults, and preferences."
      >
        <p className="text-sm text-muted-foreground">
          Invoice settings will be available here.
        </p>
      </SettingsShell>
    </PageShell>
  );
}
