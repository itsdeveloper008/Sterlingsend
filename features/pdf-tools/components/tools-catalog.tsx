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

const FILTER_LABELS: Record<ToolCategory | "all", string> = {
  all: "All",
  optimize: "Optimize",
  convert: "Convert",
  organize: "Organize",
  edit: "Edit",
  security: "Security",
};

const POPULAR_SLUGS = [
  "merge-pdf",
  "split-pdf",
  "compress-pdf",
  "pdf-to-jpg",
  "jpg-to-pdf",
  "edit-pdf",
] as const;

function exceptionTag(slug: string): string | null {
  if (slug === "translate-pdf") return "Sends text to a translation service";
  if (slug === "ocr-pdf") return "Downloads language data on first use";
  return null;
}

function ToolCard({
  slug,
  title,
  description,
  icon,
}: {
  slug: string;
  title: string;
  description: string;
  icon: string;
}) {
  const Icon = ICONS[icon] ?? FileText;
  const tag = exceptionTag(slug);
  return (
    <Link
      href={routes.tool(slug)}
      data-ss-tilt="card"
      className={cn(
        "ss-card-tilt ss-card-spotlight group flex h-full flex-col gap-3 rounded-2xl border border-border-subtle bg-card p-6 shadow-[var(--shadow-1)]",
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
      <span className="clay ss-icon-tilt flex h-12 w-12 shrink-0 items-center justify-center text-[var(--brand-700)]">
        <Icon className="h-5 w-5" aria-hidden />
      </span>
      <span className="text-lg font-semibold text-[var(--ink)]">{title}</span>
      <span className="line-clamp-2 text-[0.9375rem] leading-snug text-[var(--body-text)]">
        {description}
      </span>
      {tag ? (
        <span className="mt-auto text-sm font-medium text-[var(--secondary-text)]">
          {tag}
        </span>
      ) : null}
    </Link>
  );
}

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

  const counts = useMemo(() => {
    const map: Record<string, number> = { all: PDF_TOOLS.length };
    for (const key of CATEGORY_ORDER) {
      map[key] = PDF_TOOLS.filter((t) => t.category === key).length;
    }
    return map;
  }, []);

  const isDefaultBrowse = category === "all" && !query.trim();

  const popular = POPULAR_SLUGS.map((slug) =>
    PDF_TOOLS.find((t) => t.slug === slug),
  ).filter(Boolean);

  return (
    <div className="space-y-10">
      <div className="space-y-4">
        <label className="sr-only" htmlFor="tools-search">
          Search PDF tools
        </label>
        <input
          id="tools-search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search PDF tools"
          className="h-14 w-full rounded-xl border border-[var(--border-ui)] bg-card px-4 text-base text-[var(--ink)] placeholder:text-[var(--placeholder)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-500)]"
        />
        <div
          className="flex flex-wrap gap-2"
          role="tablist"
          aria-label="Tool categories"
        >
          {(["all", ...CATEGORY_ORDER] as const).map((key) => (
            <FilterChip
              key={key}
              active={category === key}
              onClick={() => setCategory(key)}
            >
              {FILTER_LABELS[key]} ({counts[key]})
            </FilterChip>
          ))}
        </div>
      </div>

      {!isDefaultBrowse ? (
        <>
          <p className="text-base text-[var(--secondary-text)]" aria-live="polite">
            Showing {filtered.length} of {PDF_TOOLS.length} tools
          </p>
          {filtered.length === 0 ? (
            <p className="text-base text-[var(--secondary-text)]">
              No tools match your search.
            </p>
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((tool) => (
                <li key={tool.slug}>
                  <ToolCard
                    slug={tool.slug}
                    title={tool.title}
                    description={tool.description}
                    icon={tool.icon}
                  />
                </li>
              ))}
            </ul>
          )}
        </>
      ) : (
        <>
          <section>
            <h2 className="bonsai-h2">Popular</h2>
            <p className="marketing-body mt-2">
              Six tools people open most often.
            </p>
            <ul className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {popular.map((tool) =>
                tool ? (
                  <li key={tool.slug}>
                    <ToolCard
                      slug={tool.slug}
                      title={tool.title}
                      description={tool.description}
                      icon={tool.icon}
                    />
                  </li>
                ) : null,
              )}
            </ul>
          </section>

          {CATEGORY_ORDER.map((key) => {
            const tools = PDF_TOOLS.filter((t) => t.category === key);
            return (
              <section key={key} id={key}>
                <h2 className="bonsai-h2">{CATEGORY_META[key].title}</h2>
                <p className="marketing-body mt-2">
                  {CATEGORY_META[key].description}
                </p>
                <ul className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {tools.map((tool) => (
                    <li key={tool.slug}>
                      <ToolCard
                        slug={tool.slug}
                        title={tool.title}
                        description={tool.description}
                        icon={tool.icon}
                      />
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </>
      )}

      <p className="rounded-2xl border border-border-subtle bg-[var(--surface-muted)] px-5 py-4 text-base text-[var(--body-text)]">
        Most tools run in your browser. Translate PDF sends extracted text to a
        translation service. OCR may download language data on first use. See{" "}
        <Link
          href={routes.privacy}
          className="ss-link-underline font-medium text-[var(--ink)]"
        >
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
        "rounded-xl px-3.5 py-2 text-[0.9375rem] font-semibold transition",
        active
          ? "bg-[var(--brand-700)] text-white"
          : "border border-[var(--border-ui)] bg-card text-[var(--secondary-text)] hover-fine:hover:text-[var(--ink)]",
      )}
    >
      {children}
    </button>
  );
}
