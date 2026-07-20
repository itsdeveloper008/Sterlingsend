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
import { Logo } from "@/components/design-system/logo";

const navItems = [
  { href: routes.dashboard, label: "Dashboard", icon: LayoutDashboard },
  { href: routes.customers, label: "Customers", icon: Users },
  { href: routes.invoices, label: "Invoices", icon: FileText },
  { href: routes.services, label: "Services", icon: Package },
  { href: routes.settings, label: "Settings", icon: Settings },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-60 shrink-0 border-r border-border bg-background md:flex md:flex-col">
      <div className="flex h-16 items-center border-b border-border px-5">
        <Logo size={56} />
      </div>
      <nav className="flex flex-1 flex-col gap-0.5 p-3" aria-label="Main">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "valix-nav-item",
                active && "valix-nav-active",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" aria-hidden />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-border p-4">
        <p className="text-xs leading-relaxed text-muted-foreground">
          Create, send, and get paid - faster.
        </p>
      </div>
    </aside>
  );
}
