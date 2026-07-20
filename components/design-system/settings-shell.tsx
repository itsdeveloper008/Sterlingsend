"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { routes } from "@/config/routes";
import { PageHeader } from "@/components/design-system/page-header";

const settingsLinks = [
  { href: routes.settingsBusiness, label: "Business" },
  { href: routes.settingsInvoices, label: "Invoices" },
  { href: routes.settingsBranding, label: "Branding" },
  { href: routes.settingsPayments, label: "Payments" },
  { href: routes.settingsSecurity, label: "Security" },
];

export function SettingsShell({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="space-y-8">
      <PageHeader title={title} description={description} />
      <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
        <nav
          aria-label="Settings"
          className="flex shrink-0 gap-1 overflow-x-auto lg:w-52 lg:flex-col lg:overflow-visible"
        >
          {settingsLinks.map((link) => {
            const active =
              pathname === link.href || pathname.startsWith(`${link.href}/`);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary/8 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
