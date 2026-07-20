"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FileText,
  LayoutDashboard,
  Package,
  Settings,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { routes } from "@/config/routes";

const items = [
  { href: routes.dashboard, label: "Home", icon: LayoutDashboard },
  { href: routes.customers, label: "Customers", icon: Users },
  { href: routes.invoices, label: "Invoices", icon: FileText },
  { href: routes.services, label: "Services", icon: Package },
  { href: routes.settings, label: "Settings", icon: Settings },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur-md md:hidden"
      aria-label="Mobile"
    >
      <div className="grid grid-cols-5">
        {items.map((item) => {
          const Icon = item.icon;
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition-colors",
                active ? "text-primary" : "text-muted-foreground",
              )}
            >
              {active ? (
                <span
                  className="absolute inset-x-3 top-0 h-0.5 rounded-full bg-primary"
                  aria-hidden
                />
              ) : null}
              <Icon className="h-5 w-5" aria-hidden />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
