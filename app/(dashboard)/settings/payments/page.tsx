import { PageShell, SettingsShell } from "@/components/design-system";
import { StripeConnectionCard } from "@/features/payments";
import { BankDetailsSettingsForm } from "@/features/payments/components/bank-details-settings-form";
import { resolveWorkspaceSource } from "@/lib/workspace/resolve-source";
import { getCurrentUserContext } from "@/actions/auth.actions";
import { stripeService } from "@/services/stripe.service";
import { routes } from "@/config/routes";
import Link from "next/link";

export default async function SettingsPaymentsPage() {
  const workspace = await resolveWorkspaceSource();

  if (workspace.source === "local") {
    return (
      <PageShell>
        <SettingsShell
          title="Payments"
          description="Online payments require an account."
        >
          <p className="text-sm text-muted-foreground">
            Log in and finish business setup to connect Stripe and manage bank
            details.{" "}
            <Link href={routes.login} className="text-primary underline">
              Log in
            </Link>
          </p>
        </SettingsShell>
      </PageShell>
    );
  }

  const context = await getCurrentUserContext();
  if (!context?.business) {
    return (
      <PageShell>
        <SettingsShell
          title="Payments"
          description="Finish onboarding to connect payments."
        >
          <p className="text-sm text-muted-foreground">
            <Link href={routes.onboarding} className="text-primary underline">
              Complete business setup
            </Link>{" "}
            to enable Stripe and bank details.
          </p>
        </SettingsShell>
      </PageShell>
    );
  }

  const connection = await stripeService.getConnectionSummary(
    context.business.id,
  );

  return (
    <PageShell>
      <SettingsShell
        title="Payments"
        description="Connect Stripe and manage online invoice payments."
      >
        <div className="space-y-6">
          <StripeConnectionCard connection={connection} />
          <BankDetailsSettingsForm bankDetails={context.business.bankDetails} />
        </div>
      </SettingsShell>
    </PageShell>
  );
}
