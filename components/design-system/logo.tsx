"use client";

import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/site";
import { routes } from "@/config/routes";

export function Logo({
  href = routes.home,
  className,
  showMark = true,
  showWordmark = true,
  size = 56,
}: {
  href?: string;
  className?: string;
  showMark?: boolean;
  showWordmark?: boolean;
  size?: number;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group inline-flex items-center gap-3 tracking-tight text-foreground",
        className,
      )}
    >
      {showMark ? (
        <Image
          src={siteConfig.logo}
          alt={siteConfig.logoAlt}
          width={size}
          height={size}
          className="shrink-0 rounded-[10px] object-contain"
          style={{ width: size, height: size }}
          priority
        />
      ) : null}
      {showWordmark ? (
        <span className="text-[21px] font-extrabold leading-none tracking-tight text-[#0F172A]">
          Sterling<span className="text-[#0D9488]">Send</span>
        </span>
      ) : null}
    </Link>
  );
}
