import { PageShell, SettingsShell } from "@/components/design-system";

export default function SettingsBusinessPage() {
  return (
    <PageShell>
      <SettingsShell
        title="Business"
        description="Your company name, address, and contact details."
      >
        <p className="text-sm text-muted-foreground">
          Business settings will be available here.
        </p>
      </SettingsShell>
    </PageShell>
  );
}
