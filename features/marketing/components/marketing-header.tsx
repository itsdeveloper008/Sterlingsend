"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { routes } from "@/config/routes";
import { Logo } from "@/components/design-system/logo";

const toolsLogin = `${routes.login}?redirect=${encodeURIComponent(routes.tools)}`;

const productColumns = [
  {
    title: "Invoicing",
    items: [
      { href: routes.createInvoice, label: "Create invoice", desc: "Start in Guest Mode" },
      { href: routes.features, label: "PDF export", desc: "Print-ready SterlingSend Classic" },
      { href: routes.features, label: "Invoice tracking", desc: "Sent, viewed, paid" },
    ],
  },
  {
    title: "PDF Toolkit",
    items: [
      { href: toolsLogin, label: "All PDF tools", desc: "Merge, split, compress, and more" },
      { href: toolsLogin, label: "Organize & edit", desc: "Reorder, rotate, watermark" },
      { href: toolsLogin, label: "Security", desc: "Protect, unlock, and redact" },
    ],
  },
  {
    title: "Business",
    items: [
      { href: routes.features, label: "Customers", desc: "Save and reuse details" },
      { href: routes.features, label: "Online payments", desc: "Stripe Checkout" },
      { href: routes.signup, label: "Create account", desc: "Invoices + PDF tools" },
    ],
  },
];

const nav = [
  { label: "Products", mega: true },
  { href: toolsLogin, label: "PDF Tools" },
  { href: routes.pricing, label: "Pricing" },
];

export function MarketingHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const megaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    function onPointer(event: MouseEvent) {
      if (megaRef.current && !megaRef.current.contains(event.target as Node)) {
        setMegaOpen(false);
      }
    }
    function onEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMegaOpen(false);
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

  return (
    <header
      className={cn("bonsai-header", scrolled && "bonsai-header--scrolled")}
    >
      <div className="bonsai-container flex h-[5.5rem] items-center justify-between gap-4">
        <Logo href={routes.home} size={84} />

        <nav className="relative hidden items-center gap-7 lg:flex" aria-label="Main">
          {nav.map((item) =>
            item.mega ? (
              <div key={item.label} className="relative" ref={megaRef}>
                <button
                  type="button"
                  className="bonsai-nav-link inline-flex items-center gap-1"
                  aria-expanded={megaOpen}
                  onClick={() => setMegaOpen((v) => !v)}
                >
                  {item.label}
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 transition-transform duration-200",
                      megaOpen && "rotate-180",
                    )}
                  />
                </button>
                {megaOpen ? (
                  <div className="bonsai-mega">
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
                                onClick={() => setMegaOpen(false)}
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
            ) : (
              <Link key={item.label} href={item.href!} className="bonsai-nav-link">
                {item.label}
              </Link>
            ),
          )}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Link href={routes.login} className="bonsai-nav-link px-2">
            Login
          </Link>
          <Link href={routes.createInvoice} className="bonsai-btn-primary h-10 text-sm">
            Get started
          </Link>
        </div>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-[#374151] hover:bg-[#F9FAFB] lg:hidden"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((v) => !v)}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen ? (
        <div className="fixed inset-0 top-[5.5rem] z-40 overflow-y-auto bg-white lg:hidden">
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
