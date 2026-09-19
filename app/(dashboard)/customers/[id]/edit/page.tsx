import { notFound } from "next/navigation";
import { EditCustomerPage } from "@/features/customers";
import { LocalCustomerEdit } from "@/features/customers/components/local-customer-edit";
import { serializeCustomer } from "@/features/customers/lib/serialize";
import { resolveWorkspaceSource } from "@/lib/workspace/resolve-source";
import { customerService } from "@/services/customer.service";

export default async function CustomerEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const workspace = await resolveWorkspaceSource();

  if (workspace.source === "local") {
    return <LocalCustomerEdit id={id} />;
  }

  const customer = await customerService.getCustomer(id, workspace.businessId!);
  if (!customer) notFound();

  return (
    <EditCustomerPage source="cloud" customer={serializeCustomer(customer)} />
  );
}
