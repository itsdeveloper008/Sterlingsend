"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileStack, History, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { routes } from "@/config/routes";
import { Logo } from "@/components/design-system/logo";

const navItems = [
  { href: routes.invoices, label: "History", icon: History },
  { href: routes.tools, label: "PDF Tools", icon: FileStack },
  { href: routes.account, label: "Account", icon: Settings },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-60 shrink-0 border-r border-border-subtle bg-background md:flex md:flex-col">
      <div className="flex h-16 items-center border-b border-border-subtle px-5">
        <Logo href={routes.home} size={56} />
      </div>
      <nav className="flex flex-1 flex-col gap-0.5 p-3" aria-label="Account">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn("ss-nav-item", active && "ss-nav-active")}
            >
              <Icon className="h-4 w-4 shrink-0" aria-hidden />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-border-subtle p-4">
        <p className="text-xs leading-relaxed text-muted-foreground">
          Tools stay free for everyone. Log in to save invoice history and
          branding.
        </p>
      </div>
    </aside>
  );
}
