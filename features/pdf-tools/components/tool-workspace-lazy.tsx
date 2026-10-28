"use client";

import { useRef, useState } from "react";
import dynamic from "next/dynamic";
import { FileUp, ShieldCheck } from "lucide-react";
import type { PdfTool } from "@/features/pdf-tools/catalog";
import { acceptAttr, acceptHint } from "@/features/pdf-tools/lib/accept";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const ToolWorkspace = dynamic(
  () =>
    import("@/features/pdf-tools/components/tool-workspace").then((m) => ({
      default: m.ToolWorkspace,
    })),
  {
    ssr: false,
    loading: () => (
      <div
        className="rounded-[var(--radius-lg)] border border-border-subtle bg-card p-8 text-sm text-muted-foreground"
        aria-busy
      >
        Loading tool…
      </div>
    ),
  },
);

function prefetchWorkspace() {
  void import("@/features/pdf-tools/components/tool-workspace");
}

/**
 * Drop zone shown before the (heavy) workspace loads. Picking or dropping
 * files loads the workspace with those files already added.
 */
export function ToolWorkspaceLazy({ tool }: { tool: PdfTool }) {
  const [started, setStarted] = useState(false);
  const [initialFiles, setInitialFiles] = useState<File[]>([]);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function start(list: FileList | null) {
    if (!list?.length) return;
    setInitialFiles(Array.from(list));
    setStarted(true);
  }

  if (started) {
    return <ToolWorkspace tool={tool} initialFiles={initialFiles} />;
  }

  const many = tool.maxFiles !== 1;
  const hint = acceptHint(tool);

  return (
    <div
      className={cn(
        "flex flex-col items-center rounded-[var(--radius-lg)] border-2 border-dashed bg-card px-6 py-12 text-center transition-colors",
        dragging
          ? "border-[var(--brand-600)] bg-[var(--brand-tint)]"
          : "border-border-subtle hover:border-[var(--brand-600)]",
      )}
      onDragEnter={(e) => {
        e.preventDefault();
        setDragging(true);
        prefetchWorkspace();
      }}
      onDragOver={(e) => e.preventDefault()}
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
          setDragging(false);
        }
      }}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        start(e.dataTransfer.files);
      }}
      onMouseEnter={prefetchWorkspace}
    >
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--brand-tint)] text-[var(--brand-700)]">
        <FileUp className="h-6 w-6" aria-hidden />
      </span>
      <p className="mt-4 text-lg font-semibold text-foreground">
        Drop your {hint === "PDF" ? (many ? "PDFs" : "PDF") : "files"} here
      </p>
      <p className="mt-1 text-sm text-muted-foreground">
        {hint}
        {tool.minFiles > 1
          ? ` · at least ${tool.minFiles} files`
          : many && tool.maxFiles > 1
            ? ` · up to ${tool.maxFiles} files`
            : ""}
      </p>
      <Button
        type="button"
        size="lg"
        className="mt-6"
        onFocus={prefetchWorkspace}
        onClick={() => inputRef.current?.click()}
      >
        <FileUp className="mr-2 h-4 w-4" aria-hidden />
        Choose {many ? "files" : "file"}
      </Button>
      <input
        ref={inputRef}
        type="file"
        className="sr-only"
        accept={acceptAttr(tool)}
        multiple={many}
        onChange={(e) => {
          start(e.target.files);
          e.target.value = "";
        }}
      />
      {tool.slug === "html-to-pdf" ? (
        <button
          type="button"
          className="ss-link-underline mt-3 text-sm text-muted-foreground hover:text-foreground"
          onClick={() => setStarted(true)}
        >
          Or paste HTML instead
        </button>
      ) : null}
      <p className="mt-6 flex items-center gap-1.5 text-xs text-muted-foreground">
        <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
        {tool.privacyTag === "Runs in your browser"
          ? "Your files stay on this device. Nothing is uploaded."
          : tool.privacyTag}
      </p>
    </div>
  );
}
