"use client";

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { createPortal } from "react-dom";
import dynamic from "next/dynamic";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Menu, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { routes } from "@/config/routes";
import { Logo } from "@/components/design-system/logo";
import { ButtonLink } from "@/components/ui/button-link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useAdminLink } from "@/hooks/use-admin-link";
import { clearAuthHint, readAuthHint } from "@/lib/auth-hint";
import {
  CATEGORY_META,
  PDF_TOOLS,
  type ToolCategory,
} from "@/features/pdf-tools/catalog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const MobileNavSheet = dynamic(
  () =>
    import("@/components/shell/mobile-nav-sheet").then((m) => ({
      default: m.MobileNavSheet,
    })),
  { ssr: false },
);

const SHORT_CATEGORY: Record<ToolCategory, string> = {
  optimize: "Optimize",
  convert: "Convert",
  organize: "Organize",
  edit: "Edit",
  security: "Security",
};

function openSiteSearch() {
  window.dispatchEvent(new Event("ss-open-search"));
}

function initials(name: string | null | undefined, email: string | null | undefined) {
  const source = (name?.trim() || email?.trim() || "?").slice(0, 40);
  const parts = source.split(/[\s@._-]+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return source.slice(0, 2).toUpperCase();
}

/** 3 columns: Optimize|Organize · Convert|Edit · Security + See all */
const MEGA_COLUMNS: ToolCategory[][] = [
  ["optimize", "organize"],
  ["convert", "edit"],
  ["security"],
];

function PdfToolsMegaMenu({
  open,
  onOpenChange,
  active,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  active?: boolean;
}) {
  const panelId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(
    null,
  );
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const updatePosition = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const width = Math.min(760, window.innerWidth - 32);
    let left = r.left + r.width / 2 - width / 2;
    left = Math.max(16, Math.min(left, window.innerWidth - width - 16));
    setCoords({ top: r.bottom + 10, left });
  }, []);

  useLayoutEffect(() => {
    if (!open) return;
    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open, updatePosition]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: globalThis.KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onOpenChange(false);
        triggerRef.current?.focus();
      }
    }
    function onPointerDown(e: PointerEvent) {
      const t = e.target as Node;
      if (wrapRef.current?.contains(t) || panelRef.current?.contains(t)) return;
      onOpenChange(false);
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open, onOpenChange]);

  const panel =
    open && mounted && coords
      ? createPortal(
          <div
            ref={panelRef}
            id={panelId}
            role="region"
            aria-label="PDF tools"
            className="ss-pdf-mega glass-strong"
            style={{ top: coords.top, left: coords.left }}
          >
            <div className="ss-pdf-mega-grid">
              {MEGA_COLUMNS.map((keys, colIdx) => (
                <div key={colIdx} className="ss-pdf-mega-col flex flex-col gap-5">
                  {keys.map((key) => {
                    const tools = PDF_TOOLS.filter((t) => t.category === key).slice(
                      0,
                      6,
                    );
                    return (
                      <div key={key}>
                        <p className="ss-pdf-mega-heading">
                          {SHORT_CATEGORY[key] ?? CATEGORY_META[key].title}
                        </p>
                        <ul className="ss-pdf-mega-list">
                          {tools.map((tool) => (
                            <li key={tool.slug}>
                              <Link
                                href={routes.tool(tool.slug)}
                                className="ss-pdf-mega-link"
                                onClick={() => onOpenChange(false)}
                              >
                                {tool.title}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })}
                  {colIdx === 2 ? (
                    <div className="ss-pdf-mega-footer">
                      <Link
                        href={routes.tools}
                        className="ss-pdf-mega-all clay"
                        onClick={() => onOpenChange(false)}
                      >
                        See all tools
                      </Link>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <div ref={wrapRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        className={cn(
          "ss-nav-link inline-flex items-center gap-1",
          (open || active) && "is-active",
        )}
        aria-expanded={open}
        aria-haspopup="true"
        aria-controls={panelId}
        onClick={() => onOpenChange(!open)}
      >
        PDF tools
        <ChevronDown className="h-3.5 w-3.5 opacity-70" aria-hidden />
      </button>
      {panel}
    </div>
  );
}

export function SiteHeader({
  onOpenSearch,
}: {
  onOpenSearch?: () => void;
} = {}) {
  const pathname = usePathname();
  const { user, loading, signOut } = useAuth();
  const adminLink = useAdminLink();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileReady, setMobileReady] = useState(false);
  const [pdfOpen, setPdfOpen] = useState(false);
  const [hintLoggedIn, setHintLoggedIn] = useState(false);
  const openSearch = onOpenSearch ?? openSiteSearch;

  useEffect(() => {
    setHintLoggedIn(readAuthHint());
  }, []);

  useEffect(() => {
    if (loading) return;
    if (user) {
      setHintLoggedIn(true);
      return;
    }
    if (hintLoggedIn) {
      clearAuthHint();
      setHintLoggedIn(false);
    }
  }, [loading, user, hintLoggedIn]);

  useEffect(() => {
    setMobileOpen(false);
    setPdfOpen(false);
  }, [pathname]);

  const showHistory = Boolean(user) || hintLoggedIn;

  const createActive =
    pathname === routes.createInvoice ||
    pathname.startsWith(`${routes.createInvoice}/`);
  const historyActive =
    pathname === routes.invoices || pathname.startsWith(`${routes.invoices}/`);
  const templatesActive =
    pathname === routes.templates || pathname.startsWith(`${routes.templates}/`);
  const toolsActive =
    pathname === routes.tools || pathname.startsWith(`${routes.tools}/`);

  const onPdfKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" && pdfOpen) {
        setPdfOpen(false);
      }
    },
    [pdfOpen],
  );

  return (
    <header className="ss-site-header no-print" onKeyDown={onPdfKeyDown}>
      <div className="ss-site-header-bar">
        <Logo href={routes.home} size={32} tone="onDark" className="ss-nav-logo shrink-0" />

        <nav className="ss-nav-centre hidden min-[900px]:flex" aria-label="Primary">
          <div className="ss-nav-pill">
            <Link
              href={routes.createInvoice}
              className={cn("ss-nav-link", createActive && "is-active")}
              aria-current={createActive ? "page" : undefined}
            >
              Create invoice
            </Link>
            {showHistory ? (
              <Link
                href={routes.invoices}
                className={cn("ss-nav-link", historyActive && "is-active")}
                aria-current={historyActive ? "page" : undefined}
              >
                History
              </Link>
            ) : null}
            <PdfToolsMegaMenu
              open={pdfOpen}
              onOpenChange={setPdfOpen}
              active={toolsActive}
            />
            <Link
              href={routes.templates}
              className={cn("ss-nav-link", templatesActive && "is-active")}
              aria-current={templatesActive ? "page" : undefined}
            >
              Templates
            </Link>
          </div>
        </nav>

        <div className="ss-nav-right ml-auto flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="ss-nav-icon-btn"
            aria-label="Search"
            onClick={() => openSearch()}
          >
            <Search className="h-4 w-4" />
          </Button>

          <div className="hidden min-[900px]:flex items-center gap-2">
            {!loading && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger
                  className="ss-nav-avatar clay-teal"
                  aria-label="Account menu"
                >
                  {initials(user.displayName, user.email)}
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="glass-strong w-56 border-[var(--glass-border)]"
                >
                  <DropdownMenuGroup>
                    <DropdownMenuLabel className="font-normal">
                      <p className="text-sm font-semibold text-[#0F172A]">
                        {user.displayName || "Account"}
                      </p>
                      {user.email ? (
                        <p className="truncate text-xs text-[#64748B]">
                          {user.email}
                        </p>
                      ) : null}
                    </DropdownMenuLabel>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  {adminLink ? (
                    <DropdownMenuItem
                      className="cursor-pointer font-semibold text-[var(--brand-700)]"
                      onClick={() => {
                        window.location.href = adminLink;
                      }}
                    >
                      Admin panel
                    </DropdownMenuItem>
                  ) : null}
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => {
                      window.location.href = routes.account;
                    }}
                  >
                    Account
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => void signOut()}>
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <ButtonLink
                  variant="ghost"
                  href={routes.login}
                  className="ss-nav-login h-11 px-3 text-[15px] font-semibold text-[#334155]"
                >
                  Log in
                </ButtonLink>
                <ButtonLink
                  href={routes.signup}
                  className="ss-nav-signup clay-teal inline-flex h-11 items-center justify-center px-4 text-[15px] font-semibold text-white"
                >
                  Sign up
                </ButtonLink>
              </>
            )}
          </div>

          <div className="min-[900px]:hidden">
            {mobileReady || mobileOpen ? (
              <MobileNavSheet
                open={mobileOpen}
                onOpenChange={setMobileOpen}
                onOpenSearch={openSearch}
                user={user}
                loading={loading}
                showHistory={showHistory}
                onSignOut={() => void signOut()}
              />
            ) : (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="ss-nav-icon-btn"
                aria-label="Open menu"
                onClick={() => {
                  setMobileReady(true);
                  setMobileOpen(true);
                }}
              >
                <Menu className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
