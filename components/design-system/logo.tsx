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
  tone = "default",
}: {
  href?: string;
  className?: string;
  showMark?: boolean;
  showWordmark?: boolean;
  size?: number;
  /** "onDark" lightens the wordmark for dark surfaces such as the footer. */
  tone?: "default" | "onDark";
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
          className={cn(
            "shrink-0 rounded-[10px] object-contain",
            tone === "onDark" && "bg-white p-1",
          )}
          style={{ width: size, height: size }}
          priority
        />
      ) : null}
      {showWordmark ? (
        <span
          className={cn(
            "text-[21px] font-extrabold leading-none tracking-tight",
            tone === "onDark" ? "text-white" : "text-[#0F172A]",
          )}
        >
          Sterling
          <span className={tone === "onDark" ? "text-teal-300" : "text-[#0E9BA6]"}>
            Send
          </span>
        </span>
      ) : null}
    </Link>
  );
}
