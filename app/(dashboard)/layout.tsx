import { requireOnboarding } from "@/actions/auth.actions";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";

export default async function AppRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { business } = await requireOnboarding();

  return (
    <DashboardLayout businessName={business.businessName}>
      {children}
    </DashboardLayout>
  );
}
