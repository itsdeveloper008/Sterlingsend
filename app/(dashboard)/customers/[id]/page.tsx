import { notFound } from "next/navigation";
import { requireOnboarding } from "@/actions/auth.actions";
import { CustomerDetailPage } from "@/features/customers";
import { serializeCustomer } from "@/features/customers/lib/serialize";
import { customerService } from "@/services/customer.service";

export default async function CustomerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { business } = await requireOnboarding();
  const customer = await customerService.getCustomer(id, business.id);

  if (!customer) {
    notFound();
  }

  return <CustomerDetailPage customer={serializeCustomer(customer)} />;
}
