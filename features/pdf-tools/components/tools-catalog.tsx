"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
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
  Unlock,
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
import { Badge } from "@/components/ui/badge";

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
  Unlock,
  Lock,
  Signature,
  Square,
  Columns2,
  Languages,
};

export function ToolsCatalog() {
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

  const groups = CATEGORY_ORDER.map((key) => ({
    key,
    ...CATEGORY_META[key],
    tools: filtered.filter((t) => t.category === key),
  })).filter((g) => g.tools.length > 0);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search PDF tools…"
          className="sm:max-w-sm"
        />
        <div className="flex flex-wrap gap-2">
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

      {groups.length === 0 ? (
        <p className="text-sm text-muted-foreground">No tools match your search.</p>
      ) : (
        groups.map((group) => (
          <section key={group.key} className="space-y-3">
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-foreground">
                {group.title}
              </h2>
              <p className="text-sm text-muted-foreground">{group.description}</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {group.tools.map((tool) => {
                const Icon = ICONS[tool.icon] ?? FileText;
                return (
                  <Link
                    key={tool.slug}
                    href={routes.tool(tool.slug)}
                    className={cn(
                      "group flex gap-3 rounded-xl border border-border bg-card p-4 shadow-xs",
                      "transition duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md",
                    )}
                  >
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 text-primary transition group-hover:from-primary/25 group-hover:to-primary/10">
                      <Icon className="h-5 w-5" aria-hidden />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2">
                        <span className="truncate font-medium text-foreground group-hover:text-primary">
                          {tool.title}
                        </span>
                        <Badge className="shrink-0 bg-primary/15 text-[10px] text-primary hover:bg-primary/15">
                          Ready
                        </Badge>
                      </span>
                      <span className="mt-1 line-clamp-2 block text-sm text-muted-foreground">
                        {tool.description}
                      </span>
                    </span>
                  </Link>
                );
              })}
            </div>
          </section>
        ))
      )}
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
      onClick={onClick}
      className={cn(
        "rounded-full px-3 py-1.5 text-xs font-medium transition",
        active
          ? "bg-primary text-primary-foreground"
          : "bg-muted text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}
