import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { AppHeader } from "@/components/dashboard/app-header";
import { MobileNav } from "@/components/dashboard/mobile-nav";

export function DashboardLayout({
  children,
  businessName,
}: {
  children: React.ReactNode;
  businessName: string;
}) {
  return (
    <div className="flex min-h-screen bg-[#fafbfc]" data-dashboard-layout>
      <AppSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <div data-dashboard-header>
          <AppHeader businessName={businessName} />
        </div>
        <main className="flex-1 overflow-y-auto px-4 py-6 pb-24 md:px-8 md:pb-8">
          {children}
        </main>
        <div data-dashboard-mobile-nav>
          <MobileNav />
        </div>
      </div>
    </div>
  );
}
