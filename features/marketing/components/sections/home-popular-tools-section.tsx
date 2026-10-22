"use client";

import Link from "next/link";
import {
  Combine,
  Scissors,
  Minimize2,
  FileImage,
  ImagePlus,
  FileType,
  Pencil,
  PenLine,
  type LucideIcon,
} from "lucide-react";
import { routes } from "@/config/routes";
import { PDF_TOOLS } from "@/features/pdf-tools/catalog";
import { MotionReveal } from "@/features/marketing/lib/motion-reveal";

const POPULAR_SLUGS = [
  "merge-pdf",
  "split-pdf",
  "compress-pdf",
  "pdf-to-jpg",
  "jpg-to-pdf",
  "word-to-pdf",
  "edit-pdf",
  "sign-pdf",
] as const;

const ICONS: Record<(typeof POPULAR_SLUGS)[number], LucideIcon> = {
  "merge-pdf": Combine,
  "split-pdf": Scissors,
  "compress-pdf": Minimize2,
  "pdf-to-jpg": FileImage,
  "jpg-to-pdf": ImagePlus,
  "word-to-pdf": FileType,
  "edit-pdf": Pencil,
  "sign-pdf": PenLine,
};

export function HomePopularToolsSection() {
  const toolCount = PDF_TOOLS.length;
  const tools = POPULAR_SLUGS.map((slug) => {
    const tool = PDF_TOOLS.find((t) => t.slug === slug);
    if (!tool) return null;
    return { ...tool, Icon: ICONS[slug] };
  }).filter(Boolean);

  return (
    <section className="border-b border-border-subtle bg-background py-16 sm:py-20">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <MotionReveal>
          <h2 className="type-h2 text-foreground">Popular PDF tools</h2>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Eight tools people use most. All {toolCount} tools are listed on the
            tools page.
          </p>
        </MotionReveal>
        <ul className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
          {tools.map((tool, index) => {
            if (!tool) return null;
            const Icon = tool.Icon;
            const tile = (
              <Link
                href={routes.tool(tool.slug)}
                data-ss-tilt="card"
                className="ss-card-lift ss-card-tilt ss-card-spotlight group flex h-full flex-col gap-3 rounded-[var(--radius-lg)] p-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-500)]"
              >
                <span className="clay ss-icon-tilt flex h-12 w-12 items-center justify-center text-[var(--brand-700)]">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <span className="text-sm font-semibold text-foreground">
                  {tool.title}
                </span>
                <span className="text-xs text-muted-foreground">
                  {tool.description}
                </span>
              </Link>
            );
            return (
              <li key={tool.slug}>
                {index < 6 ? (
                  <MotionReveal delayMs={index * 60}>{tile}</MotionReveal>
                ) : (
                  tile
                )}
              </li>
            );
          })}
        </ul>
        <p className="mt-8">
          <Link
            href={routes.tools}
            className="ss-link-underline text-sm font-semibold text-[var(--brand-700)]"
          >
            See all {toolCount} tools
          </Link>
        </p>
      </div>
    </section>
  );
}
