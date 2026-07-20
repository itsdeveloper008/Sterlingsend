import { redirect } from "next/navigation";
import { getServerSession } from "@/firebase/session";
import { OnboardingWizard } from "@/features/onboarding";
import { routes } from "@/config/routes";

export default async function OnboardingPage() {
  const session = await getServerSession();
  if (!session) {
    redirect(routes.login);
  }

  return (
    <OnboardingWizard userEmail={session.email ?? undefined} />
  );
}
