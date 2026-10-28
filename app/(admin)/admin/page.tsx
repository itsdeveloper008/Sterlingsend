import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getServerSession } from "@/firebase/session";
import { getAdminOverview, isAdminSession } from "@/services/admin.service";
import { AdminDashboard } from "@/features/admin/components/admin-dashboard";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await getServerSession();
  // Same 404 as any unknown page: don't reveal that an admin area exists.
  if (!session || !isAdminSession(session)) {
    notFound();
  }

  const overview = await getAdminOverview();
  return <AdminDashboard overview={overview} adminEmail={session.email ?? ""} />;
}
