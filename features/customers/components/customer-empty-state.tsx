import { Users } from "lucide-react";
import { ButtonLink } from "@/components/ui/button-link";
import { EmptyState } from "@/components/design-system";
import { routes } from "@/config/routes";

export function CustomerEmptyState() {
  return (
    <EmptyState
      icon={Users}
      title="No customers yet"
      description="Add your first customer to speed up invoice creation and keep contact details in one place."
      action={
        <ButtonLink href={routes.customersNew} className="shadow-xs">
          Add customer
        </ButtonLink>
      }
    />
  );
}
