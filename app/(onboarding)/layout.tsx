import type { Metadata } from "next";
import { OnboardingLayout } from "@/components/layouts/onboarding-layout";
import { redirectIfOnboardingComplete } from "@/actions/onboarding.actions";

/** Signed-in pages: keep out of search results. */
export const metadata: Metadata = {
  robots: { index: false, follow: true },
};

export default async function OnboardingRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await redirectIfOnboardingComplete();
  return <OnboardingLayout>{children}</OnboardingLayout>;
}
