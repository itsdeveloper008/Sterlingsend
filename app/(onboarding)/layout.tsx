import { OnboardingLayout } from "@/components/layouts/onboarding-layout";
import { redirectIfOnboardingComplete } from "@/actions/onboarding.actions";

export default async function OnboardingRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await redirectIfOnboardingComplete();
  return <OnboardingLayout>{children}</OnboardingLayout>;
}
