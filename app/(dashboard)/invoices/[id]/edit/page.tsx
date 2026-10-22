import { permanentRedirect } from "next/navigation";
import { routes } from "@/config/routes";

export default async function InvoiceEditRedirectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  permanentRedirect(`${routes.createInvoice}?edit=${encodeURIComponent(id)}`);
}
