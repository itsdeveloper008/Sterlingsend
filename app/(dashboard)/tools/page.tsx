import { PageHeader, PageShell } from "@/components/design-system";
import { ToolsCatalog } from "@/features/pdf-tools";

export default function ToolsPage() {
  return (
    <PageShell>
      <PageHeader
        title="PDF Tools"
        description="Merge, split, compress, convert, protect, and more — right in your browser."
      />
      <ToolsCatalog />
    </PageShell>
  );
}
