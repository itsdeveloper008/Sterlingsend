import { notFound } from "next/navigation";
import { PageShell } from "@/components/design-system";
import { getToolBySlug, ToolWorkspace } from "@/features/pdf-tools";

export default async function ToolPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tool = getToolBySlug(slug);
  if (!tool) notFound();

  return (
    <PageShell>
      <ToolWorkspace tool={tool} />
    </PageShell>
  );
}
