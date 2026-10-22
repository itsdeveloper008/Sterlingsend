"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import type { PdfTool } from "@/features/pdf-tools/catalog";
import { Button } from "@/components/ui/button";
import { FileUp } from "lucide-react";

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

export function ToolWorkspaceLazy({ tool }: { tool: PdfTool }) {
  const [started, setStarted] = useState(false);

  if (!started) {
    return (
      <div className="ss-calm-zone rounded-[var(--radius-lg)] border border-dashed border-border-subtle bg-card p-8">
        <p className="text-sm text-muted-foreground">
          {tool.privacyTag}. Choose a file to load the tool processor in this
          browser tab.
        </p>
        <Button
          type="button"
          className="mt-4"
          onClick={() => setStarted(true)}
          onMouseEnter={() => {
            void import("@/features/pdf-tools/components/tool-workspace");
          }}
          onFocus={() => {
            void import("@/features/pdf-tools/components/tool-workspace");
          }}
        >
          <FileUp className="mr-2 h-4 w-4" />
          Choose files
        </Button>
      </div>
    );
  }

  return <ToolWorkspace tool={tool} />;
}
