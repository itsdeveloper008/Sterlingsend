import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerSession } from "@/firebase/session";
import { routes } from "@/config/routes";
import { isAdminSession } from "@/services/admin.service";
import { AdminLoginForm } from "@/features/admin/components/admin-login-form";

export const metadata: Metadata = {
  title: "Admin sign in",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  const session = await getServerSession();
  if (session && isAdminSession(session)) {
    redirect(routes.admin);
  }

  return <AdminLoginForm />;
}
