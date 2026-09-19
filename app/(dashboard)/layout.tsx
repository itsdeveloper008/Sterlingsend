import { getCurrentUserContext } from "@/actions/auth.actions";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { getServerSession } from "@/firebase/session";

export default async function AppRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();

  if (!session) {
    return (
      <DashboardLayout businessName="Guest workspace">{children}</DashboardLayout>
    );
  }

  const context = await getCurrentUserContext();
  const businessName =
    context?.business?.businessName?.trim() ||
    context?.user.displayName?.trim() ||
    context?.user.email?.trim() ||
    "Your workspace";

  return <DashboardLayout businessName={businessName}>{children}</DashboardLayout>;
}
