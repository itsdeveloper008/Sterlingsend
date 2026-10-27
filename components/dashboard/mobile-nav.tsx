"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileStack, FolderOpen, History, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { routes } from "@/config/routes";

const items = [
  { href: routes.invoices, label: "History", icon: History },
  { href: routes.files, label: "Files", icon: FolderOpen },
  { href: routes.tools, label: "Tools", icon: FileStack },
  { href: routes.account, label: "Account", icon: Settings },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border-subtle bg-background/95 backdrop-blur-md md:hidden"
      aria-label="Account"
    >
      <div className="grid grid-cols-4">
        {items.map((item) => {
          const Icon = item.icon;
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex min-h-11 flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-medium transition-colors",
                active ? "text-primary" : "text-muted-foreground",
              )}
            >
              {active ? (
                <span
                  className="absolute inset-x-3 top-0 h-0.5 rounded-sm bg-primary"
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
