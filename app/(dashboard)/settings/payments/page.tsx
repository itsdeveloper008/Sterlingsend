import { redirect } from "next/navigation";
import { requireOnboarding } from "@/actions/auth.actions";
import { StripeConnectionCard } from "@/features/payments";
import { BankDetailsSettingsForm } from "@/features/payments/components/bank-details-settings-form";
import { stripeService } from "@/services/stripe.service";
import { PageShell, SettingsShell } from "@/components/design-system";
import { isPaymentsEnabled } from "@/lib/config/payments";
import { routes } from "@/config/routes";

export default async function SettingsPaymentsPage() {
  if (!isPaymentsEnabled()) {
    redirect(routes.settings);
  }

  const { business } = await requireOnboarding();
  const connection = await stripeService.getConnectionSummary(business.id);

  return (
    <PageShell>
      <SettingsShell
        title="Payments"
        description="Connect Stripe and manage online invoice payments."
      >
        <div className="space-y-6">
          <StripeConnectionCard connection={connection} />
          <BankDetailsSettingsForm bankDetails={business.bankDetails} />
        </div>
      </SettingsShell>
    </PageShell>
  );
}
