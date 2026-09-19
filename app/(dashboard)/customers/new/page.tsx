import { CreateCustomerPage } from "@/features/customers";
import { resolveWorkspaceSource } from "@/lib/workspace/resolve-source";

export default async function NewCustomerPage() {
  const workspace = await resolveWorkspaceSource();
  return <CreateCustomerPage source={workspace.source} />;
}
