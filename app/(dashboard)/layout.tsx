import type { Metadata } from "next";
import { requireOnboarding } from "@/actions/auth.actions";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";

/** Signed-in pages: keep out of search results. */
export const metadata: Metadata = {
  robots: { index: false, follow: true },
};

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
