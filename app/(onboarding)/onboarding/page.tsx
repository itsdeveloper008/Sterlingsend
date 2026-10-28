import { redirect } from "next/navigation";
import { getServerSession } from "@/firebase/session";
import { OnboardingWizard } from "@/features/onboarding";
import { routes } from "@/config/routes";
import { BUSINESS_TYPES } from "@/lib/business-types";
import { getBusinessForUser } from "@/services/business-profile.service";
import type { OnboardingFormData } from "@/lib/validations/onboarding";

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const session = await getServerSession();
  if (!session) {
    redirect(routes.login);
  }

  const [{ redirect: redirectTo }, business] = await Promise.all([
    searchParams,
    getBusinessForUser(session.uid),
  ]);
  const businessType = (BUSINESS_TYPES as readonly string[]).includes(
    business?.businessType ?? "",
  )
    ? (business?.businessType as OnboardingFormData["businessType"])
    : undefined;

  return (
    <OnboardingWizard
      userEmail={session.email ?? undefined}
      redirectTo={redirectTo}
      initial={
        business
          ? {
              businessName: business.businessName,
              email: business.email,
              businessType,
              phone: business.phone ?? "",
              city: business.city,
              postcode: business.postcode,
            }
          : undefined
      }
    />
  );
}
