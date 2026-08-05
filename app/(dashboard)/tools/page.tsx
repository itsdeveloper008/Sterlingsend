import { PageHeader, PageShell } from "@/components/design-system";
import { ToolsCatalog } from "@/features/pdf-tools";

export default function ToolsPage() {
  return (
    <PageShell>
      <PageHeader
        title="PDF Tools"
        description="All 29 tools run in your browser: merge, convert, OCR, sign, translate, and more."
      />
      <ToolsCatalog />
    </PageShell>
  );
}
