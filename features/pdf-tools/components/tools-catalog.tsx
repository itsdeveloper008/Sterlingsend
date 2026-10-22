"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePointerEffects } from "@/features/marketing/lib/use-pointer-effects";
import {
  Archive,
  ClipboardList,
  Columns2,
  Combine,
  Crop,
  FileCode,
  FileMinus,
  FileOutput,
  FileText,
  FileType,
  Globe,
  Hash,
  Image,
  Images,
  Languages,
  LayoutList,
  Lock,
  LockOpen,
  Minimize2,
  PenLine,
  Presentation,
  RotateCw,
  ScanText,
  Scissors,
  Sheet,
  Signature,
  Square,
  Stamp,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { routes } from "@/config/routes";
import {
  CATEGORY_META,
  CATEGORY_ORDER,
  PDF_TOOLS,
  type ToolCategory,
} from "@/features/pdf-tools/catalog";
import { Input } from "@/components/ui/input";

const ICONS: Record<string, LucideIcon> = {
  Minimize2,
  Wrench,
  ScanText,
  FileType,
  Presentation,
  Sheet,
  Image,
  Images,
  FileText,
  Globe,
  Archive,
  FileCode,
  Combine,
  Scissors,
  FileMinus,
  FileOutput,
  LayoutList,
  PenLine,
  RotateCw,
  Crop,
  Hash,
  Stamp,
  ClipboardList,
  Lock,
  LockOpen,
  Signature,
  Square,
  Columns2,
  Languages,
};

export function ToolsCatalog() {
  usePointerEffects(true);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<ToolCategory | "all">("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return PDF_TOOLS.filter((tool) => {
      if (category !== "all" && tool.category !== category) return false;
      if (!q) return true;
      return (
        tool.title.toLowerCase().includes(q) ||
        tool.description.toLowerCase().includes(q)
      );
    });
  }, [query, category]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search PDF tools"
          aria-label="Search PDF tools"
          className="sm:max-w-sm"
        />
        <div
          className="flex flex-wrap gap-2"
          role="tablist"
          aria-label="Tool categories"
        >
          <FilterChip
            active={category === "all"}
            onClick={() => setCategory("all")}
          >
            All
          </FilterChip>
          {CATEGORY_ORDER.map((key) => (
            <FilterChip
              key={key}
              active={category === key}
              onClick={() => setCategory(key)}
            >
              {CATEGORY_META[key].title.split(" ")[0]}
            </FilterChip>
          ))}
        </div>
      </div>

      <p className="text-sm text-muted-foreground" aria-live="polite">
        Showing {filtered.length} of {PDF_TOOLS.length} tools
      </p>

      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground">No tools match your search.</p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((tool) => {
            const Icon = ICONS[tool.icon] ?? FileText;
            return (
              <li key={tool.slug}>
                <Link
                  href={routes.tool(tool.slug)}
                  data-ss-tilt="card"
                  className={cn(
                    "ss-card-tilt ss-card-spotlight group flex gap-3 rounded-[var(--radius-lg)] border border-border-subtle bg-card p-4",
                    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-500)]",
                  )}
                  onPointerMove={(event) => {
                    const node = event.currentTarget;
                    const rect = node.getBoundingClientRect();
                    node.style.setProperty(
                      "--ss-spot-x",
                      `${((event.clientX - rect.left) / rect.width) * 100}%`,
                    );
                    node.style.setProperty(
                      "--ss-spot-y",
                      `${((event.clientY - rect.top) / rect.height) * 100}%`,
                    );
                  }}
                >
                  <span className="clay ss-icon-tilt flex h-11 w-11 shrink-0 items-center justify-center text-[var(--brand-700)]">
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium text-foreground">
                      {tool.title}
                    </span>
                    <span className="mt-1 line-clamp-2 block text-sm text-muted-foreground">
                      {tool.description}
                    </span>
                    <span className="mt-2 block text-xs font-medium text-muted-foreground">
                      {tool.privacyTag}
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      <p className="rounded-[var(--radius-md)] border border-border-subtle bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
        Most tools run in your browser. Translate PDF sends extracted text to a
        translation service. OCR may download language data on first use. See{" "}
        <Link href={routes.privacy} className="ss-link-underline font-medium text-foreground">
          Privacy
        </Link>
        .
      </p>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        "rounded-[var(--radius-md)] px-3 py-1.5 text-xs font-medium transition",
        active
          ? "bg-[var(--brand-700)] text-white"
          : "bg-muted text-muted-foreground hover-fine:hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}
