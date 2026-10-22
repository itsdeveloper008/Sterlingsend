import {
  SiteFooter,
  SiteHeader,
  SkipLink,
  UtmCapture,
  CookieBanner,
} from "@/components/shell";
import { MarketingShellExtras } from "@/features/marketing/components/marketing-shell-extras";
import "@/features/marketing/styles/marketing.css";

/**
 * Server shell: footer stays on the server. Header is a client island (auth).
 * Idle extras and cookie banner are separate client islands.
 */
export function MarketingShell({
  children,
  showScrollProgress = false,
}: {
  children: React.ReactNode;
  showScrollProgress?: boolean;
}) {
  return (
    <div className="marketing-page flex min-h-screen flex-col overflow-x-hidden antialiased">
      <SkipLink />
      <SiteHeader />
      <main id="main" className="flex-1">
        {children}
      </main>
      <SiteFooter />
      <CookieBanner />
      <MarketingShellExtras showScrollProgress={showScrollProgress} />
      <UtmCapture />
    </div>
  );
}
