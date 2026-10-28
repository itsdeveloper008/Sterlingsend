"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  Download,
  FileUp,
  Loader2,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import dynamic from "next/dynamic";
import { routes } from "@/config/routes";
import type { PdfTool } from "@/features/pdf-tools/catalog";
import type { EditPdfHandle } from "@/features/pdf-tools/components/edit-pdf-editor";
import {
  downloadBytes,
  formatFileSize,
} from "@/features/pdf-tools/lib/download";
import { acceptAttr, acceptHint } from "@/features/pdf-tools/lib/accept";
import type {
  ProcessResult,
  ToolOptions,
} from "@/features/pdf-tools/lib/engine/types";
import { useAuth } from "@/hooks/use-auth";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

const EditPdfEditor = dynamic(
  () =>
    import("@/features/pdf-tools/components/edit-pdf-editor").then((m) => ({
      default: m.EditPdfEditor,
    })),
  { ssr: false },
);

const FilePreview = dynamic(
  () =>
    import("@/features/pdf-tools/components/file-preview").then((m) => ({
      default: m.FilePreview,
    })),
  { ssr: false },
);

const SignaturePad = dynamic(
  () =>
    import("@/features/pdf-tools/components/signature-pad").then((m) => ({
      default: m.SignaturePad,
    })),
  { ssr: false },
);

let enginePrefetch: Promise<unknown> | null = null;

function prefetchEngine() {
  if (!enginePrefetch) {
    enginePrefetch = import("@/features/pdf-tools/lib/engine/process");
  }
  return enginePrefetch;
}

const LANGS = [
  { code: "es", label: "Spanish" },
  { code: "fr", label: "French" },
  { code: "de", label: "German" },
  { code: "it", label: "Italian" },
  { code: "pt", label: "Portuguese" },
  { code: "ar", label: "Arabic" },
  { code: "hi", label: "Hindi" },
  { code: "zh-CN", label: "Chinese (Simplified)" },
  { code: "ja", label: "Japanese" },
  { code: "ko", label: "Korean" },
];

const OCR_LANGS = [
  { code: "eng", label: "English" },
  { code: "spa", label: "Spanish" },
  { code: "fra", label: "French" },
  { code: "deu", label: "German" },
  { code: "ita", label: "Italian" },
  { code: "por", label: "Portuguese" },
  { code: "ara", label: "Arabic" },
];

type OutputFile = ProcessResult["files"][number];

/** Parse the compress target ("200" + "KB") into bytes; null when blank. */
function parseTargetBytes(value: string, unit: "KB" | "MB") {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const n = Number(trimmed);
  if (!Number.isFinite(n) || n <= 0) return Number.NaN;
  return Math.floor(n * (unit === "MB" ? 1024 * 1024 : 1024));
}

export function ToolWorkspace({
  tool,
  initialFiles,
}: {
  tool: PdfTool;
  /** Files picked in the page's drop zone before the workspace loaded. */
  initialFiles?: File[];
}) {
  const { user } = useAuth();
  const [files, setFiles] = useState<File[]>(() =>
    (initialFiles ?? []).slice(0, tool.maxFiles > 0 ? tool.maxFiles : undefined),
  );
  const [targetSize, setTargetSize] = useState("");
  const [targetUnit, setTargetUnit] = useState<"KB" | "MB">("KB");
  /** Outputs waiting on the "save to history?" answer. */
  const [pendingOutputs, setPendingOutputs] = useState<OutputFile[] | null>(
    null,
  );
  const [saving, setSaving] = useState(false);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState("");
  const [doneName, setDoneName] = useState("");

  const [password, setPassword] = useState("");
  const [pages, setPages] = useState("1");
  const [rotation, setRotation] = useState<90 | 180 | 270>(90);
  const [watermarkText, setWatermarkText] = useState("CONFIDENTIAL");
  const [cropMargin, setCropMargin] = useState(36);
  const [redactBand, setRedactBand] = useState<"top" | "middle" | "bottom">(
    "middle",
  );
  const [pageOrder, setPageOrder] = useState<number[]>([]);
  const [ocrLang, setOcrLang] = useState("eng");
  const [targetLang, setTargetLang] = useState("es");
  const [htmlContent, setHtmlContent] = useState("");
  const [editText, setEditText] = useState("");
  const [editPage, setEditPage] = useState(1);
  const [editX, setEditX] = useState(72);
  const [editY, setEditY] = useState(72);
  const [editFontSize, setEditFontSize] = useState(14);
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formDate, setFormDate] = useState(
    () => new Date().toISOString().slice(0, 10),
  );
  const [signatureDataUrl, setSignatureDataUrl] = useState("");
  const [signerName, setSignerName] = useState("");
  const [signPage, setSignPage] = useState(1);
  const [editReady, setEditReady] = useState(false);
  const [translateConfirmed, setTranslateConfirmed] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editRef = useRef<EditPdfHandle>(null);

  const targetBytes =
    tool.slug === "compress-pdf" ? parseTargetBytes(targetSize, targetUnit) : null;
  const targetInvalid = targetBytes !== null && Number.isNaN(targetBytes);

  const htmlReady = tool.slug === "html-to-pdf" && htmlContent.trim().length > 0;
  const translateBlocked =
    tool.slug === "translate-pdf" && !translateConfirmed;
  const canRun =
    !busy &&
    !translateBlocked &&
    !targetInvalid &&
    !(tool.slug === "sign-pdf" && !signatureDataUrl) &&
    (tool.slug === "edit-pdf"
      ? files.length >= 1 && editReady
      : files.length >= tool.minFiles ||
        (tool.slug === "html-to-pdf" && htmlReady));

  const options: ToolOptions = useMemo(
    () => ({
      password,
      pages,
      rotation,
      watermarkText,
      cropMargin,
      redactBand,
      pageOrder: pageOrder.length ? pageOrder : undefined,
      ocrLang,
      targetLang,
      htmlContent,
      editText,
      editPage,
      editX,
      editY,
      editFontSize,
      formName,
      formEmail,
      formDate,
      signatureDataUrl,
      signerName,
      signPage,
      targetBytes: targetBytes ?? undefined,
    }),
    [
      password,
      pages,
      rotation,
      watermarkText,
      cropMargin,
      redactBand,
      pageOrder,
      ocrLang,
      targetLang,
      htmlContent,
      editText,
      editPage,
      editX,
      editY,
      editFontSize,
      formName,
      formEmail,
      formDate,
      signatureDataUrl,
      signerName,
      signPage,
      targetBytes,
    ],
  );

  const onFiles = useCallback(
    (list: FileList | File[] | null) => {
      if (!list || ("length" in list && !list.length)) return;
      const next = Array.from(list);
      setFiles((prev) => {
        const merged =
          tool.maxFiles === 1 ? next.slice(0, 1) : [...prev, ...next];
        return tool.maxFiles > 0 ? merged.slice(0, tool.maxFiles) : merged;
      });
      setDoneName("");
      if (tool.slug === "organize-pdf") setPageOrder([]);
    },
    [tool.maxFiles, tool.slug],
  );

  const moveFile = (index: number, dir: -1 | 1) => {
    setFiles((prev) => {
      const next = [...prev];
      const j = index + dir;
      if (j < 0 || j >= next.length) return prev;
      [next[index], next[j]] = [next[j], next[index]];
      return next;
    });
  };

  const movePage = (index: number, dir: -1 | 1) => {
    setPageOrder((prev) => {
      const next = [...prev];
      const j = index + dir;
      if (j < 0 || j >= next.length) return prev;
      [next[index], next[j]] = [next[j], next[index]];
      return next;
    });
  };

  async function ensureOrganizeOrder() {
    if (tool.slug !== "organize-pdf" || !files[0]) return;
    if (pageOrder.length) return;
    const { PDFDocument } = await import("@cantoo/pdf-lib");
    const bytes = new Uint8Array(await files[0].arrayBuffer());
    const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
    setPageOrder(doc.getPageIndices());
  }

  function downloadOutputs(outputs: OutputFile[]) {
    for (const out of outputs) {
      downloadBytes(out.bytes, out.name, out.mime);
    }
    setDoneName(outputs[0]?.name || "download");
    toast.success(
      outputs.length === 1 ? `Downloaded ${outputs[0].name}` : "Download ready",
    );
  }

  /** Signed-in users are asked whether to keep the result in History. */
  function deliverOutputs(outputs: OutputFile[]) {
    if (user && outputs.length) {
      setPendingOutputs(outputs);
      return;
    }
    downloadOutputs(outputs);
  }

  async function onSaveToHistory() {
    if (!pendingOutputs || !user) return;
    const outputs = pendingOutputs;
    setSaving(true);
    downloadOutputs(outputs);
    try {
      const { savePdfToHistory } = await import("@/firebase/pdf-history");
      for (const out of outputs) {
        await savePdfToHistory(user.uid, out, {
          slug: tool.slug,
          title: tool.title,
        });
      }
      toast.success(
        outputs.length === 1
          ? "Saved to your history"
          : `${outputs.length} files saved to your history`,
        {
          action: {
            label: "View",
            onClick: () => window.location.assign(routes.files),
          },
        },
      );
    } catch (error) {
      console.error("[pdf-history] save failed", error);
      toast.error(
        error instanceof Error && error.message.includes("25 MB")
          ? error.message
          : "Downloaded, but could not save to history. Please try again.",
      );
    } finally {
      setSaving(false);
      setPendingOutputs(null);
    }
  }

  async function onProcess() {
    if (!canRun) return;
    setBusy(true);
    setDoneName("");
    setProgress("Preparing…");
    try {
      let order = pageOrder;
      if (tool.slug === "organize-pdf") {
        if (!order.length && files[0]) {
          const { PDFDocument } = await import("@cantoo/pdf-lib");
          const bytes = new Uint8Array(await files[0].arrayBuffer());
          const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
          order = doc.getPageIndices();
          setPageOrder(order);
        }
      }

      if (tool.slug === "ocr-pdf") setProgress("Running OCR (this can take a minute)…");
      else if (tool.slug === "translate-pdf") setProgress("Translating pages…");
      else if (tool.slug === "compare-pdf") setProgress("Comparing documents…");
      else if (tool.slug === "compress-pdf") setProgress("Compressing pages…");
      else if (tool.slug === "edit-pdf") setProgress("Saving your edits…");
      else setProgress("Processing in your browser…");

      if (tool.slug === "edit-pdf") {
        const exported = await editRef.current?.exportEdited();
        if (!exported) throw new Error("Edit preview is still loading.");
        deliverOutputs([exported]);
        return;
      }

      const { processTool } = await import(
        "@/features/pdf-tools/lib/engine/process"
      );
      const result = await processTool({
        slug: tool.slug,
        files,
        options: { ...options, pageOrder: order.length ? order : undefined },
      });

      if (result.note) toast.message(result.note);
      deliverOutputs(result.files);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not process file",
      );
    } finally {
      setBusy(false);
      setProgress("");
    }
  }

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-border/80 shadow-sm">
        <CardHeader className="border-b border-border/60 bg-muted/20">
          <CardTitle className="text-base">Files</CardTitle>
          <CardDescription>
            {tool.slug === "html-to-pdf"
              ? "Upload an HTML file, or paste markup in Options below."
              : tool.slug === "edit-pdf"
                ? "Select a PDF, then click any text on the page to edit it."
              : tool.minFiles > 1
                ? `Add at least ${tool.minFiles} files (${acceptHint(tool)}).`
                : `Select a ${acceptHint(tool)} file from your device.`}
            {tool.maxFiles > 1 ? ` Up to ${tool.maxFiles} files.` : null}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-5">
          <div
            className="neu-inset rounded-[var(--radius-lg)] border border-dashed border-border-subtle p-4 transition-[box-shadow,border-color] duration-150 focus-within:border-[var(--brand-600)] data-[drag=true]:border-[var(--brand-600)]"
            onDragEnter={(e) => {
              e.preventDefault();
              e.currentTarget.dataset.drag = "true";
              void prefetchEngine();
            }}
            onDragOver={(e) => e.preventDefault()}
            onDragLeave={(e) => {
              e.currentTarget.dataset.drag = "false";
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.currentTarget.dataset.drag = "false";
              void prefetchEngine();
              onFiles(e.dataTransfer.files);
            }}
            onFocusCapture={() => {
              void prefetchEngine();
            }}
            onMouseEnter={() => {
              void prefetchEngine();
            }}
          >
            <div className="flex flex-wrap items-center gap-3">
              <Button
                type="button"
                onClick={() => {
                  void prefetchEngine();
                  fileInputRef.current?.click();
                }}
              >
                <FileUp className="mr-2 h-4 w-4" />
                {files.length > 0 ? "Add more files" : "Select files"}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                className="sr-only"
                accept={acceptAttr(tool)}
                multiple={tool.maxFiles !== 1}
                onChange={(e) => {
                  void prefetchEngine();
                  onFiles(e.target.files);
                  e.target.value = "";
                }}
              />
              <p className="text-xs text-muted-foreground">
                Drop files here or select. Files stay on this device.
              </p>
            </div>
          </div>

          {files.length > 0 ? (
            <ul className="space-y-5">
              {files.map((file, index) => (
                <li
                  key={`${file.name}-${file.size}-${index}`}
                  className="rounded-2xl border border-border bg-background p-3 sm:p-4"
                >
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <div className="min-w-0 text-xs text-muted-foreground">
                      <span className="font-medium text-foreground">
                        {file.name}
                      </span>
                      <span className="ml-2">
                        {(file.size / 1024).toFixed(0)} KB
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      {tool.slug === "merge-pdf" ||
                      tool.slug === "jpg-to-pdf" ||
                      tool.slug === "compare-pdf" ||
                      tool.slug === "word-to-pdf" ? (
                        <>
                          <button
                            type="button"
                            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                            onClick={() => moveFile(index, -1)}
                            aria-label="Move up"
                          >
                            <ArrowUp className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                            onClick={() => moveFile(index, 1)}
                            aria-label="Move down"
                          >
                            <ArrowDown className="h-3.5 w-3.5" />
                          </button>
                        </>
                      ) : null}
                      <button
                        type="button"
                        className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => {
                          setFiles((prev) => prev.filter((_, i) => i !== index));
                          if (tool.slug === "edit-pdf") setEditReady(false);
                        }}
                        aria-label="Remove file"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  {tool.slug === "edit-pdf" && index === 0 ? (
                    <EditPdfEditor
                      ref={editRef}
                      file={file}
                      onReadyChange={setEditReady}
                    />
                  ) : (
                    <FilePreview file={file} index={index} />
                  )}
                </li>
              ))}
            </ul>
          ) : null}
        </CardContent>
      </Card>

      <ToolOptionsPanel
        tool={tool}
        password={password}
        setPassword={setPassword}
        pages={pages}
        setPages={setPages}
        rotation={rotation}
        setRotation={setRotation}
        watermarkText={watermarkText}
        setWatermarkText={setWatermarkText}
        cropMargin={cropMargin}
        setCropMargin={setCropMargin}
        redactBand={redactBand}
        setRedactBand={setRedactBand}
        pageOrder={pageOrder}
        ensureOrganizeOrder={ensureOrganizeOrder}
        movePage={movePage}
        ocrLang={ocrLang}
        setOcrLang={setOcrLang}
        targetLang={targetLang}
        setTargetLang={setTargetLang}
        htmlContent={htmlContent}
        setHtmlContent={setHtmlContent}
        editText={editText}
        setEditText={setEditText}
        editPage={editPage}
        setEditPage={setEditPage}
        editX={editX}
        setEditX={setEditX}
        editY={editY}
        setEditY={setEditY}
        editFontSize={editFontSize}
        setEditFontSize={setEditFontSize}
        formName={formName}
        setFormName={setFormName}
        formEmail={formEmail}
        setFormEmail={setFormEmail}
        formDate={formDate}
        setFormDate={setFormDate}
        signatureDataUrl={signatureDataUrl}
        setSignatureDataUrl={setSignatureDataUrl}
        signerName={signerName}
        setSignerName={setSignerName}
        signPage={signPage}
        setSignPage={setSignPage}
        targetSize={targetSize}
        setTargetSize={setTargetSize}
        targetUnit={targetUnit}
        setTargetUnit={setTargetUnit}
        targetInvalid={targetInvalid}
        sourceSize={files[0]?.size ?? null}
      />

      {tool.slug === "translate-pdf" ? (
        <div
          className="rounded-[var(--radius-md)] border border-amber-500/40 bg-amber-50 px-4 py-3 text-sm text-foreground"
          role="status"
        >
          <p>
            Extracted text from your PDF is sent to a translation service before
            processing continues. Confirm below to enable the download button.
          </p>
          <label className="mt-3 flex items-start gap-2">
            <input
              type="checkbox"
              className="mt-1"
              checked={translateConfirmed}
              onChange={(e) => setTranslateConfirmed(e.target.checked)}
            />
            <span>
              I understand extracted text will be sent to a translation service.
            </span>
          </label>
        </div>
      ) : null}

      <Card className="border-border-subtle">
        <CardContent className="flex flex-wrap items-center justify-between gap-4 py-5">
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground">
              {busy
                ? progress || "Processing…"
                : doneName
                  ? `Ready: ${doneName}`
                  : "Ready when you are"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {tool.privacyTag}
              {tool.slug === "ocr-pdf"
                ? " OCR may take longer on multi-page scans."
                : tool.slug === "edit-pdf"
                  ? " Edit text on the page, then download your updated PDF."
                  : ""}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {files.length > 0 || htmlContent ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setFiles([]);
                  setPageOrder([]);
                  setDoneName("");
                  setEditReady(false);
                  setTranslateConfirmed(false);
                  if (tool.slug === "html-to-pdf") setHtmlContent("");
                }}
              >
                Clear
              </Button>
            ) : null}
            <Button onClick={() => void onProcess()} disabled={!canRun} size="lg">
              {busy ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing…
                </>
              ) : doneName ? (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Run again
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Process and download
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {user ? null : (
        <p className="text-center text-sm text-muted-foreground">
          Want to keep your files in your history?{" "}
          <Link href={routes.login} className="ss-link-underline font-semibold text-foreground">
            Log in
          </Link>
          .
        </p>
      )}

      <ConfirmDialog
        open={pendingOutputs !== null}
        onOpenChange={(open) => {
          // Closing without choosing still downloads: they asked for the file.
          if (!open && pendingOutputs && !saving) {
            downloadOutputs(pendingOutputs);
            setPendingOutputs(null);
          }
        }}
        title="Save to your history?"
        description={
          pendingOutputs && pendingOutputs.length > 1
            ? `Keep these ${pendingOutputs.length} files in your history so you can download them again later.`
            : "Keep this file in your history so you can download it again later."
        }
        cancelLabel="Download only"
        confirmLabel="Download & save"
        loading={saving}
        onConfirm={() => void onSaveToHistory()}
      />
    </div>
  );
}

function ToolOptionsPanel(props: {
  tool: PdfTool;
  password: string;
  setPassword: (v: string) => void;
  pages: string;
  setPages: (v: string) => void;
  rotation: 90 | 180 | 270;
  setRotation: (v: 90 | 180 | 270) => void;
  watermarkText: string;
  setWatermarkText: (v: string) => void;
  cropMargin: number;
  setCropMargin: (v: number) => void;
  redactBand: "top" | "middle" | "bottom";
  setRedactBand: (v: "top" | "middle" | "bottom") => void;
  pageOrder: number[];
  ensureOrganizeOrder: () => Promise<void>;
  movePage: (index: number, dir: -1 | 1) => void;
  ocrLang: string;
  setOcrLang: (v: string) => void;
  targetLang: string;
  setTargetLang: (v: string) => void;
  htmlContent: string;
  setHtmlContent: (v: string) => void;
  editText: string;
  setEditText: (v: string) => void;
  editPage: number;
  setEditPage: (v: number) => void;
  editX: number;
  setEditX: (v: number) => void;
  editY: number;
  setEditY: (v: number) => void;
  editFontSize: number;
  setEditFontSize: (v: number) => void;
  formName: string;
  setFormName: (v: string) => void;
  formEmail: string;
  setFormEmail: (v: string) => void;
  formDate: string;
  setFormDate: (v: string) => void;
  signatureDataUrl: string;
  setSignatureDataUrl: (v: string) => void;
  signerName: string;
  setSignerName: (v: string) => void;
  signPage: number;
  setSignPage: (v: number) => void;
  targetSize: string;
  setTargetSize: (v: string) => void;
  targetUnit: "KB" | "MB";
  setTargetUnit: (v: "KB" | "MB") => void;
  targetInvalid: boolean;
  sourceSize: number | null;
}) {
  const { tool } = props;
  const showPassword =
    tool.slug === "protect-pdf" || tool.slug === "unlock-pdf";
  const showPages =
    tool.slug === "remove-pages" || tool.slug === "extract-pages";
  const showRotation = tool.slug === "rotate-pdf";
  const showWatermark = tool.slug === "watermark";
  const showCrop = tool.slug === "crop-pdf";
  const showRedact = tool.slug === "redact-pdf";
  const showOrganize = tool.slug === "organize-pdf";
  const showOcr = tool.slug === "ocr-pdf";
  const showTranslate = tool.slug === "translate-pdf";
  const showHtml = tool.slug === "html-to-pdf";
  const showEdit = tool.slug === "edit-pdf";
  const showForms = tool.slug === "pdf-forms";
  const showSign = tool.slug === "sign-pdf";
  const showCompress = tool.slug === "compress-pdf";

  const visible =
    showPassword ||
    showPages ||
    showRotation ||
    showWatermark ||
    showCrop ||
    showRedact ||
    showOrganize ||
    showOcr ||
    showTranslate ||
    showHtml ||
    showEdit ||
    showForms ||
    showSign ||
    showCompress;

  if (!visible) return null;

  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader className="border-b border-border/60 bg-muted/20">
        <CardTitle className="text-base">Options</CardTitle>
        <CardDescription>
          Fine-tune how this tool transforms your file.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 pt-5 sm:grid-cols-2">
        {showPassword ? (
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="pdf-password">
              {tool.slug === "unlock-pdf" ? "Current password" : "New password"}
            </Label>
            <Input
              id="pdf-password"
              type="password"
              value={props.password}
              onChange={(e) => props.setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
        ) : null}

        {showPages ? (
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="pdf-pages">Pages (e.g. 1,3-5)</Label>
            <Input
              id="pdf-pages"
              value={props.pages}
              onChange={(e) => props.setPages(e.target.value)}
              placeholder="1-3,7"
            />
          </div>
        ) : null}

        {showRotation ? (
          <div className="space-y-2">
            <Label htmlFor="pdf-rotation">Rotation</Label>
            <select
              id="pdf-rotation"
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
              value={props.rotation}
              onChange={(e) =>
                props.setRotation(Number(e.target.value) as 90 | 180 | 270)
              }
            >
              <option value={90}>90°</option>
              <option value={180}>180°</option>
              <option value={270}>270°</option>
            </select>
          </div>
        ) : null}

        {showWatermark ? (
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="pdf-watermark">Watermark text</Label>
            <Input
              id="pdf-watermark"
              value={props.watermarkText}
              onChange={(e) => props.setWatermarkText(e.target.value)}
            />
          </div>
        ) : null}

        {showCrop ? (
          <div className="space-y-2">
            <Label htmlFor="pdf-crop">Margin (points)</Label>
            <Input
              id="pdf-crop"
              type="number"
              min={0}
              max={200}
              value={props.cropMargin}
              onChange={(e) => props.setCropMargin(Number(e.target.value) || 0)}
            />
          </div>
        ) : null}

        {showCompress ? (
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="compress-target">Target file size (optional)</Label>
            <div className="flex gap-2">
              <Input
                id="compress-target"
                type="number"
                inputMode="decimal"
                min={0}
                step="any"
                value={props.targetSize}
                onChange={(e) => props.setTargetSize(e.target.value)}
                placeholder="e.g. 200"
                aria-invalid={props.targetInvalid || undefined}
                aria-describedby="compress-target-hint"
                className="max-w-40"
              />
              <select
                aria-label="Target size unit"
                className="flex h-9 rounded-md border border-input bg-transparent px-3 text-sm"
                value={props.targetUnit}
                onChange={(e) =>
                  props.setTargetUnit(e.target.value as "KB" | "MB")
                }
              >
                <option value="KB">KB</option>
                <option value="MB">MB</option>
              </select>
            </div>
            <p
              id="compress-target-hint"
              className={
                props.targetInvalid
                  ? "text-xs text-destructive"
                  : "text-xs text-muted-foreground"
              }
            >
              {props.targetInvalid
                ? "Enter a size greater than 0."
                : `Leave blank for standard compression.${
                    props.sourceSize
                      ? ` Your file is ${formatFileSize(props.sourceSize)}.`
                      : ""
                  }`}
            </p>
          </div>
        ) : null}

        {showRedact ? (
          <div className="space-y-2">
            <Label htmlFor="pdf-redact">Redact band</Label>
            <select
              id="pdf-redact"
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
              value={props.redactBand}
              onChange={(e) =>
                props.setRedactBand(
                  e.target.value as "top" | "middle" | "bottom",
                )
              }
            >
              <option value="top">Top</option>
              <option value="middle">Middle</option>
              <option value="bottom">Bottom</option>
            </select>
          </div>
        ) : null}

        {showOcr ? (
          <div className="space-y-2">
            <Label htmlFor="ocr-lang">OCR language</Label>
            <select
              id="ocr-lang"
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
              value={props.ocrLang}
              onChange={(e) => props.setOcrLang(e.target.value)}
            >
              {OCR_LANGS.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.label}
                </option>
              ))}
            </select>
          </div>
        ) : null}

        {showTranslate ? (
          <div className="space-y-2">
            <Label htmlFor="target-lang">Translate to</Label>
            <select
              id="target-lang"
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
              value={props.targetLang}
              onChange={(e) => props.setTargetLang(e.target.value)}
            >
              {LANGS.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.label}
                </option>
              ))}
            </select>
          </div>
        ) : null}

        {showHtml ? (
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="html-content">HTML markup</Label>
            <Textarea
              id="html-content"
              value={props.htmlContent}
              onChange={(e) => props.setHtmlContent(e.target.value)}
              placeholder="<h1>Hello</h1><p>Paste HTML here…</p>"
              className="min-h-40 font-mono text-xs"
            />
          </div>
        ) : null}

        {showEdit ? (
          <div className="space-y-2 sm:col-span-2 rounded-xl border border-border/70 bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
            Click any text line in the preview above to edit it. Use{" "}
            <span className="font-medium text-foreground">Add text</span> to
            place a new line, then download when you are done.
          </div>
        ) : null}

        {showForms ? (
          <>
            <div className="space-y-2">
              <Label htmlFor="form-name">Name</Label>
              <Input
                id="form-name"
                value={props.formName}
                onChange={(e) => props.setFormName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="form-email">Email</Label>
              <Input
                id="form-email"
                type="email"
                value={props.formEmail}
                onChange={(e) => props.setFormEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="form-date">Date</Label>
              <Input
                id="form-date"
                type="date"
                value={props.formDate}
                onChange={(e) => props.setFormDate(e.target.value)}
              />
            </div>
          </>
        ) : null}

        {showSign ? (
          <div className="space-y-4 sm:col-span-2">
            <div className="space-y-2">
              <Label>Signature</Label>
              <SignaturePad
                value={props.signatureDataUrl}
                onChange={props.setSignatureDataUrl}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="signer-name">Signer name (optional)</Label>
                <Input
                  id="signer-name"
                  value={props.signerName}
                  onChange={(e) => props.setSignerName(e.target.value)}
                  placeholder="Jane Doe"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sign-page">Page number</Label>
                <Input
                  id="sign-page"
                  type="number"
                  min={1}
                  value={props.signPage}
                  onChange={(e) =>
                    props.setSignPage(Number(e.target.value) || 1)
                  }
                />
              </div>
            </div>
          </div>
        ) : null}

        {showOrganize ? (
          <div className="space-y-3 sm:col-span-2">
            <div className="flex items-center justify-between gap-2">
              <Label>Page order</Label>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => void props.ensureOrganizeOrder()}
              >
                Load pages
              </Button>
            </div>
            {props.pageOrder.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                Add a PDF, then load pages to reorder them.
              </p>
            ) : (
              <ul className="space-y-1">
                {props.pageOrder.map((pageIndex, i) => (
                  <li
                    key={`${pageIndex}-${i}`}
                    className="flex items-center gap-2 rounded-md border border-border px-3 py-1.5 text-sm"
                  >
                    <span className="flex-1">Page {pageIndex + 1}</span>
                    <button
                      type="button"
                      className="rounded p-1 text-muted-foreground hover:text-foreground"
                      onClick={() => props.movePage(i, -1)}
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      className="rounded p-1 text-muted-foreground hover:text-foreground"
                      onClick={() => props.movePage(i, 1)}
                    >
                      <ArrowDown className="h-3.5 w-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
