"use client";

import { useEffect, useId, useState } from "react";
import Link from "next/link";
import { ChevronDown, Menu, Search, X } from "lucide-react";
import { routes } from "@/config/routes";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  CATEGORY_META,
  PDF_TOOLS,
  type ToolCategory,
} from "@/features/pdf-tools/catalog";
import type { AuthUser } from "@/providers/auth-provider";
import { cn } from "@/lib/utils";

const PDF_CATEGORY_ORDER: ToolCategory[] = [
  "optimize",
  "convert",
  "organize",
  "edit",
  "security",
];

const SHORT_CATEGORY: Record<ToolCategory, string> = {
  optimize: "Optimize",
  convert: "Convert",
  organize: "Organize",
  edit: "Edit",
  security: "Security",
};

export function MobileNavSheet({
  open,
  onOpenChange,
  onOpenSearch,
  user,
  loading,
  showHistory,
  onSignOut,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOpenSearch?: () => void;
  user: AuthUser | null;
  loading: boolean;
  showHistory: boolean;
  onSignOut: () => void;
}) {
  const [pdfExpanded, setPdfExpanded] = useState(false);
  const pdfId = useId();

  useEffect(() => {
    if (!open) setPdfExpanded(false);
  }, [open]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="ss-nav-icon-btn min-[900px]:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
          />
        }
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </SheetTrigger>
      <SheetContent
        side="right"
        className="flex h-full w-full max-w-none flex-col p-0 sm:max-w-none"
      >
        <SheetHeader className="border-b border-[#E2E8F0] px-4 py-4">
          <SheetTitle className="text-left text-[#0F172A]">Menu</SheetTitle>
        </SheetHeader>
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
          <nav className="flex flex-col gap-1 p-3" aria-label="Mobile">
            <Link
              href={routes.createInvoice}
              className="flex h-12 items-center rounded-[10px] px-3 text-[15px] font-semibold text-[#334155] hover:bg-[#F1F5F9]"
              onClick={() => onOpenChange(false)}
            >
              Create invoice
            </Link>
            {showHistory ? (
              <Link
                href={routes.invoices}
                className="flex h-12 items-center rounded-[10px] px-3 text-[15px] font-semibold text-[#334155] hover:bg-[#F1F5F9]"
                onClick={() => onOpenChange(false)}
              >
                History
              </Link>
            ) : null}
            <div>
              <button
                type="button"
                className="flex h-12 w-full items-center justify-between rounded-[10px] px-3 text-[15px] font-semibold text-[#334155] hover:bg-[#F1F5F9]"
                aria-expanded={pdfExpanded}
                aria-controls={pdfId}
                onClick={() => setPdfExpanded((v) => !v)}
              >
                PDF tools
                <ChevronDown
                  className={cn(
                    "h-4 w-4 transition-transform",
                    pdfExpanded && "rotate-180",
                  )}
                  aria-hidden
                />
              </button>
              {pdfExpanded ? (
                <div id={pdfId} className="space-y-3 px-2 pb-2 pt-1">
                  {PDF_CATEGORY_ORDER.map((key) => (
                    <div key={key}>
                      <p className="px-2 text-xs font-bold uppercase tracking-wide text-[#64748B]">
                        {SHORT_CATEGORY[key] ?? CATEGORY_META[key].title}
                      </p>
                      <ul className="mt-1">
                        {PDF_TOOLS.filter((t) => t.category === key).map(
                          (tool) => (
                            <li key={tool.slug}>
                              <Link
                                href={routes.tool(tool.slug)}
                                className="flex h-10 items-center rounded-lg px-2 text-sm font-medium text-[#334155] hover:bg-[#F1F5F9]"
                                onClick={() => onOpenChange(false)}
                              >
                                {tool.title}
                              </Link>
                            </li>
                          ),
                        )}
                      </ul>
                    </div>
                  ))}
                  <Link
                    href={routes.tools}
                    className="flex h-10 items-center rounded-lg px-2 text-sm font-semibold text-[#0F766E]"
                    onClick={() => onOpenChange(false)}
                  >
                    See all tools
                  </Link>
                </div>
              ) : null}
            </div>
            <Link
              href={routes.templates}
              className="flex h-12 items-center rounded-[10px] px-3 text-[15px] font-semibold text-[#334155] hover:bg-[#F1F5F9]"
              onClick={() => onOpenChange(false)}
            >
              Templates
            </Link>
            <button
              type="button"
              className="flex h-12 items-center gap-2 rounded-[10px] px-3 text-left text-[15px] font-semibold text-[#334155] hover:bg-[#F1F5F9]"
              onClick={() => {
                onOpenChange(false);
                onOpenSearch?.();
              }}
            >
              <Search className="h-4 w-4" aria-hidden />
              Search
            </button>
          </nav>

          <div className="mt-auto space-y-2 border-t border-[#E2E8F0] p-4">
            {!loading && user ? (
              <>
                <ButtonLink
                  href={routes.account}
                  variant="outline"
                  className="h-12 w-full"
                  onClick={() => onOpenChange(false)}
                >
                  Account
                </ButtonLink>
                <Button
                  type="button"
                  variant="ghost"
                  className="h-12 w-full"
                  onClick={() => {
                    onOpenChange(false);
                    onSignOut();
                  }}
                >
                  Log out
                </Button>
              </>
            ) : (
              <>
                <ButtonLink
                  href={routes.login}
                  variant="outline"
                  className="h-12 w-full"
                  onClick={() => onOpenChange(false)}
                >
                  Log in
                </ButtonLink>
                <ButtonLink
                  href={routes.signup}
                  className="h-12 w-full rounded-xl bg-[#0F766E] text-white hover:bg-[#0F766E]/90"
                  onClick={() => onOpenChange(false)}
                >
                  Sign up
                </ButtonLink>
              </>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
