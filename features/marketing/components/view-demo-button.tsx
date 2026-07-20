"use client";

import { routes } from "@/config/routes";
import { marketingAnchors, homeAnchor } from "@/features/marketing/lib/anchors";
import { usePathname } from "next/navigation";

export function ViewDemoButton() {
  const pathname = usePathname();

  function handleClick(event: React.MouseEvent<HTMLAnchorElement>) {
    if (pathname !== routes.home) return;
    event.preventDefault();
    document
      .getElementById(marketingAnchors.features)
      ?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <a
      href={homeAnchor(marketingAnchors.features)}
      className="marketing-btn-secondary"
      onClick={handleClick}
    >
      See Product Features
    </a>
  );
}
