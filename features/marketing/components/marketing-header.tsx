"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { routes } from "@/config/routes";
import { Logo } from "@/components/design-system/logo";
import {
  CATEGORY_META,
  CATEGORY_ORDER,
  toolsByCategory,
} from "@/features/pdf-tools/catalog";

const productColumns = [
  {
    title: "Invoicing",
    items: [
      {
        href: routes.createInvoice,
        label: "Create invoice",
        desc: "Free · no account needed",
      },
      {
        href: routes.features,
        label: "PDF export",
        desc: "Print-ready SterlingSend Classic",
      },
      {
        href: routes.signup,
        label: "Save & track",
        desc: "Log in only to keep history",
      },
    ],
  },
  {
    title: "PDF Toolkit",
    items: [
      {
        href: routes.tools,
        label: "All PDF tools",
        desc: "Merge, split, compress, and more",
      },
      {
        href: routes.tools,
        label: "Organize & edit",
        desc: "Reorder, rotate, watermark",
      },
      {
        href: routes.tools,
        label: "Security",
        desc: "Protect, unlock, and redact",
      },
    ],
  },
  {
    title: "Account",
    items: [
      {
        href: routes.signup,
        label: "Create account",
        desc: "Only needed to save your data",
      },
      {
        href: routes.features,
        label: "Saved customers",
        desc: "Reuse details on every invoice",
      },
      {
        href: routes.features,
        label: "Online payments",
        desc: "Stripe Checkout",
      },
    ],
  },
];

const pdfToolColumns = CATEGORY_ORDER.map((category) => ({
  key: category,
  title: CATEGORY_META[category].title,
  items: toolsByCategory(category).map((tool) => ({
    href: routes.tool(tool.slug),
    label: tool.title,
    desc: tool.description,
  })),
}));

type OpenMenu = null | "products" | "tools";

export function MarketingHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [openMenu, setOpenMenu] = useState<OpenMenu>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    function onPointer(event: MouseEvent) {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setOpenMenu(null);
      }
    }
    function onEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpenMenu(null);
        setMobileOpen(false);
      }
    }
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onEscape);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  function toggleMenu(menu: Exclude<OpenMenu, null>) {
    setOpenMenu((current) => (current === menu ? null : menu));
  }

  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function openOnHover(menu: Exclude<OpenMenu, null>) {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
    setOpenMenu(menu);
  }

  function closeOnLeave() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpenMenu(null), 120);
  }

  useEffect(() => {
    return () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
    };
  }, []);

  return (
    <header
      className={cn("bonsai-header", scrolled && "bonsai-header--scrolled")}
    >
      <div className="bonsai-container">
        <div className="bonsai-header-shell">
          <Logo href={routes.home} size={64} />

          <nav
            ref={navRef}
            className="bonsai-nav-cluster relative"
            aria-label="Main"
          >
            <div
              className="relative"
              onMouseEnter={() => openOnHover("products")}
              onMouseLeave={closeOnLeave}
            >
              <button
                type="button"
                className="bonsai-nav-link"
                aria-expanded={openMenu === "products"}
                aria-haspopup="true"
                onFocus={() => openOnHover("products")}
                onClick={() => toggleMenu("products")}
              >
                Products
                <ChevronDown
                  className={cn(
                    "h-3.5 w-3.5 transition-transform duration-200",
                    openMenu === "products" && "rotate-180",
                  )}
                />
              </button>
              {openMenu === "products" ? (
                <div className="bonsai-mega" onMouseEnter={() => openOnHover("products")}>
                  <div className="grid gap-6 sm:grid-cols-3">
                    {productColumns.map((col) => (
                      <div key={col.title}>
                        <p className="bonsai-mega-col-title">{col.title}</p>
                        <div className="space-y-1">
                          {col.items.map((link) => (
                            <Link
                              key={link.label}
                              href={link.href}
                              className="bonsai-mega-item"
                              onClick={() => setOpenMenu(null)}
                            >
                              <strong>{link.label}</strong>
                              <span>{link.desc}</span>
                            </Link>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            <div
              className="relative"
              onMouseEnter={() => openOnHover("tools")}
              onMouseLeave={closeOnLeave}
            >
              <button
                type="button"
                className="bonsai-nav-link"
                aria-expanded={openMenu === "tools"}
                aria-haspopup="true"
                onFocus={() => openOnHover("tools")}
                onClick={() => toggleMenu("tools")}
              >
                PDF Tools
                <ChevronDown
                  className={cn(
                    "h-3.5 w-3.5 transition-transform duration-200",
                    openMenu === "tools" && "rotate-180",
                  )}
                />
              </button>
              {openMenu === "tools" ? (
                <div
                  className="bonsai-mega bonsai-mega--tools"
                  onMouseEnter={() => openOnHover("tools")}
                >
                  <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-5">
                    {pdfToolColumns.map((col) => (
                      <div key={col.key}>
                        <p className="bonsai-mega-col-title">{col.title}</p>
                        <div className="space-y-0.5">
                          {col.items.map((link) => (
                            <Link
                              key={link.href}
                              href={link.href}
                              className="bonsai-mega-item bonsai-mega-item--compact"
                              title={link.desc}
                              onClick={() => setOpenMenu(null)}
                            >
                              <strong>{link.label}</strong>
                            </Link>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex items-center justify-between gap-3 border-t border-[#E5E7EB] pt-3">
                    <p className="text-xs text-muted-foreground">
                      Free in your browser. No login required.
                    </p>
                    <Link
                      href={routes.tools}
                      className="text-sm font-semibold text-primary hover:underline"
                      onClick={() => setOpenMenu(null)}
                    >
                      View all PDF tools
                    </Link>
                  </div>
                </div>
              ) : null}
            </div>

            <Link href={routes.pricing} className="bonsai-nav-link">
              Pricing
            </Link>
          </nav>

          <div className="bonsai-header-actions">
            <Link href={routes.login} className="bonsai-nav-login">
              Login
            </Link>
            <Link href={routes.createInvoice} className="bonsai-nav-cta">
              Get started
            </Link>
          </div>

          <button
            type="button"
            className="bonsai-menu-toggle"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen ? (
        <div className="fixed inset-0 top-[5.25rem] z-40 overflow-y-auto bg-white/95 backdrop-blur-md lg:hidden">
          <div className="bonsai-container space-y-6 py-6">
            {productColumns.map((col) => (
              <div key={col.title}>
                <p className="bonsai-mega-col-title">{col.title}</p>
                <div className="mt-2 space-y-1">
                  {col.items.map((link) => (
                    <Link
                      key={link.label}
                      href={link.href}
                      className="bonsai-mega-item"
                      onClick={() => setMobileOpen(false)}
                    >
                      <strong>{link.label}</strong>
                      <span>{link.desc}</span>
                    </Link>
                  ))}
                </div>
              </div>
            ))}

            <div className="border-t border-[#E5E7EB] pt-4">
              <div className="mb-3 flex items-center justify-between gap-2">
                <p className="bonsai-mega-col-title mb-0">PDF Tools</p>
                <Link
                  href={routes.tools}
                  className="text-xs font-semibold text-primary"
                  onClick={() => setMobileOpen(false)}
                >
                  View all
                </Link>
              </div>
              <div className="space-y-4">
                {pdfToolColumns.map((col) => (
                  <div key={col.key}>
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
                      {col.title}
                    </p>
                    <div className="mt-1 space-y-0.5">
                      {col.items.map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          className="bonsai-mega-item bonsai-mega-item--compact"
                          onClick={() => setMobileOpen(false)}
                        >
                          <strong>{link.label}</strong>
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2 border-t border-[#E5E7EB] pt-4">
              <Link
                href={routes.login}
                className="bonsai-btn-secondary"
                onClick={() => setMobileOpen(false)}
              >
                Login
              </Link>
              <Link
                href={routes.createInvoice}
                className="bonsai-btn-primary"
                onClick={() => setMobileOpen(false)}
              >
                Get started
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
