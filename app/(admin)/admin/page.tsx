import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAuth } from "@/actions/auth.actions";
import { getAdminOverview, isAdminSession } from "@/services/admin.service";
import { AdminDashboard } from "@/features/admin/components/admin-dashboard";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const { session } = await requireAuth();
  if (!isAdminSession(session)) {
    notFound();
  }

  const overview = await getAdminOverview();
  return <AdminDashboard overview={overview} />;
}
