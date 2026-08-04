import { AuthRouteShell } from "@/components/layouts/auth-route-shell";

export default function AuthRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthRouteShell>{children}</AuthRouteShell>;
}
