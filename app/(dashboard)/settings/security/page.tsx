import { PageShell, SettingsShell } from "@/components/design-system";

export default function SettingsSecurityPage() {
  return (
    <PageShell>
      <SettingsShell
        title="Security"
        description="Password, sessions, and account security."
      >
        <p className="text-sm text-muted-foreground">
          Security settings will be available here.
        </p>
      </SettingsShell>
    </PageShell>
  );
}
