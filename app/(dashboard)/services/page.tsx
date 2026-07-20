import { PageHeader, PageShell } from "@/components/design-system";

export default function ServicesPage() {
  return (
    <PageShell>
      <PageHeader
        title="Saved services"
        description="Reusable products and services for faster invoicing."
      />
      <p className="text-sm text-muted-foreground">
        Saved services will be available here.
      </p>
    </PageShell>
  );
}
