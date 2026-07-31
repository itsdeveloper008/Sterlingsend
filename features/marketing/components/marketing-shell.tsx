import { MarketingFooter } from "@/features/marketing/components/marketing-footer";
import { MarketingHeader } from "@/features/marketing/components/marketing-header";
import "@/features/marketing/styles/marketing.css";

export function MarketingShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="marketing-page flex min-h-screen flex-col antialiased">
      <MarketingHeader />
      <main className="flex-1">{children}</main>
      <MarketingFooter />
    </div>
  );
}
