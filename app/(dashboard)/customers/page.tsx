import { CustomersListPage } from "@/features/customers";
import { serializeCustomers } from "@/features/customers/lib/serialize";
import { resolveWorkspaceSource } from "@/lib/workspace/resolve-source";
import { customerService } from "@/services/customer.service";

export default async function CustomersPage() {
  const workspace = await resolveWorkspaceSource();

  if (workspace.source === "local") {
    return (
      <CustomersListPage
        source="local"
        initialCustomers={[]}
        initialNextCursor={null}
        initialHasMore={false}
      />
    );
  }

  const result = await customerService.getCustomers({
    businessId: workspace.businessId!,
  });

  return (
    <CustomersListPage
      source="cloud"
      initialCustomers={serializeCustomers(result.customers)}
      initialNextCursor={result.nextCursor}
      initialHasMore={result.hasMore}
    />
  );
}
