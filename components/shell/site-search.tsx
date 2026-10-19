"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  buildSiteSearchIndex,
  filterSiteSearch,
} from "@/lib/search/site-index";

export function SiteSearch({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const index = useMemo(() => buildSiteSearchIndex(), []);
  const results = useMemo(
    () => filterSiteSearch(index, query),
    [index, query],
  );

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const isModK = (event.metaKey || event.ctrlKey) && event.key === "k";
      const isSlash =
        event.key === "/" &&
        !(event.target instanceof HTMLInputElement) &&
        !(event.target instanceof HTMLTextAreaElement) &&
        !(event.target as HTMLElement | null)?.isContentEditable;
      if (isModK || isSlash) {
        event.preventDefault();
        onOpenChange(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onOpenChange]);

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  const groups = ["Pages", "PDF tools"] as const;

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder="Search pages and PDF tools..."
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        <CommandEmpty>No matches. Try another word.</CommandEmpty>
        {groups.map((group) => {
          const items = results.filter((r) => r.group === group);
          if (items.length === 0) return null;
          return (
            <CommandGroup key={group} heading={group}>
              {items.map((item) => (
                <CommandItem
                  key={item.id}
                  value={`${item.title} ${item.description}`}
                  onSelect={() => {
                    onOpenChange(false);
                    router.push(item.href);
                  }}
                >
                  <span className="flex flex-col gap-0.5">
                    <span>{item.title}</span>
                    <span className="text-xs text-muted-foreground">
                      {item.description}
                    </span>
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          );
        })}
      </CommandList>
    </CommandDialog>
  );
}
