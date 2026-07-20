import { requireOnboarding } from "@/actions/auth.actions";
import { CustomersListPage } from "@/features/customers";
import { serializeCustomers } from "@/features/customers/lib/serialize";
import { customerService } from "@/services/customer.service";

export default async function CustomersPage() {
  const { business } = await requireOnboarding();
  const result = await customerService.getCustomers({
    businessId: business.id,
  });

  return (
    <CustomersListPage
      initialCustomers={serializeCustomers(result.customers)}
      initialNextCursor={result.nextCursor}
      initialHasMore={result.hasMore}
    />
  );
}
