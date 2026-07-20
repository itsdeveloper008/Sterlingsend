"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { routes } from "@/config/routes";
import { homeAnchor } from "@/features/marketing/lib/anchors";
import { cn } from "@/lib/utils";

export function MarketingAnchorLink({
  anchor,
  children,
  className,
  onNavigate,
}: {
  anchor: string;
  children: React.ReactNode;
  className?: string;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const href = homeAnchor(anchor);

  function handleClick(event: React.MouseEvent<HTMLAnchorElement>) {
    onNavigate?.();

    if (pathname !== routes.home) {
      return;
    }

    event.preventDefault();
    document.getElementById(anchor)?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <Link href={href} className={cn(className)} onClick={handleClick}>
      {children}
    </Link>
  );
}
