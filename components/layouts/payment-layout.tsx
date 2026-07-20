import Link from "next/link";
import { siteConfig } from "@/config/site";

export function PaymentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-background">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-center px-4">
          <Link href="/" className="text-sm font-medium">
            {siteConfig.name}
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-8">{children}</main>
    </div>
  );
}
