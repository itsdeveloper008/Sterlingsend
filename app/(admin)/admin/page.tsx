import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerSession } from "@/firebase/session";
import { routes } from "@/config/routes";
import { getAdminOverview, isAdminSession } from "@/services/admin.service";
import { AdminDashboard } from "@/features/admin/components/admin-dashboard";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await getServerSession();
  if (!session || !isAdminSession(session)) {
    redirect(routes.adminLogin);
  }

  const overview = await getAdminOverview();
  return <AdminDashboard overview={overview} adminEmail={session.email ?? ""} />;
}
