"use client";

import { useRef, useState, useTransition } from "react";
import { Loader2, Upload, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { uploadBusinessLogo } from "@/firebase/storage";
import {
  removeBusinessLogoAction,
  updateBusinessLogoAction,
} from "@/actions/business.actions";
import { cn } from "@/lib/utils";

const ACCEPTED = ["image/png", "image/jpeg", "image/jpg", "image/svg+xml"];
const MAX_BYTES = 2 * 1024 * 1024;

export function BusinessLogoUploadForm({
  businessId,
  logoUrl,
  businessName,
  /** When true, keep the file locally until the parent uploads after business creation. */
  deferred = false,
  onDeferredFileChange,
  compact = false,
}: {
  businessId?: string;
  logoUrl?: string | null;
  businessName: string;
  deferred?: boolean;
  onDeferredFileChange?: (file: File | null) => void;
  compact?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(logoUrl ?? null);
  const [localObjectUrl, setLocalObjectUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progressLabel, setProgressLabel] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const initial = (businessName || "V").charAt(0).toUpperCase();

  function clearLocalPreview() {
    if (localObjectUrl) {
      URL.revokeObjectURL(localObjectUrl);
      setLocalObjectUrl(null);
    }
  }

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!ACCEPTED.includes(file.type)) {
      toast.error("Use a PNG, JPG, or SVG file");
      return;
    }

    if (file.size > MAX_BYTES) {
      toast.error("Logo must be 2MB or smaller");
      return;
    }

    const localPreview = URL.createObjectURL(file);
    clearLocalPreview();
    setLocalObjectUrl(localPreview);
    setPreviewUrl(localPreview);

    if (deferred || !businessId) {
      onDeferredFileChange?.(file);
      return;
    }

    setUploading(true);
    setProgressLabel("Uploading…");

    try {
      const downloadUrl = await uploadBusinessLogo(businessId, file);
      setProgressLabel("Saving…");

      const result = await updateBusinessLogoAction(downloadUrl);
      if (!result.success) {
        throw new Error(result.error);
      }

      clearLocalPreview();
      setPreviewUrl(downloadUrl);
      toast.success("Logo updated");
    } catch (error) {
      console.error("[logo-upload]", error);
      clearLocalPreview();
      setPreviewUrl(logoUrl ?? null);
      toast.error("Failed to upload logo");
    } finally {
      setUploading(false);
      setProgressLabel(null);
    }
  }

  function handleRemove() {
    if (deferred || !businessId) {
      clearLocalPreview();
      setPreviewUrl(null);
      onDeferredFileChange?.(null);
      return;
    }

    startTransition(async () => {
      const result = await removeBusinessLogoAction();
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      setPreviewUrl(null);
      toast.success("Logo removed");
    });
  }

  const busy = uploading || isPending;

  const body = (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC]">
        {previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={previewUrl}
            alt={`${businessName || "Business"} logo`}
            className="h-full w-full object-contain p-2"
          />
        ) : (
          <span className="text-2xl font-bold text-[#14B8A6]">{initial}</span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2">
        <input
          ref={inputRef}
          type="file"
          accept=".png,.jpg,.jpeg,.svg,image/png,image/jpeg,image/svg+xml"
          className="sr-only"
          onChange={(event) => void handleFileChange(event)}
        />
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={busy}
            onClick={() => inputRef.current?.click()}
          >
            {busy ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Upload className="mr-2 h-4 w-4" />
            )}
            {previewUrl ? "Replace logo" : "Upload logo"}
          </Button>
          {previewUrl ? (
            <Button
              type="button"
              variant="ghost"
              disabled={busy}
              onClick={handleRemove}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Remove
            </Button>
          ) : null}
        </div>
        {progressLabel ? (
          <p className="text-sm text-muted-foreground">{progressLabel}</p>
        ) : deferred ? (
          <p className="text-sm text-muted-foreground">
            PNG, JPG, or SVG · max 2MB. Optional  -  you can add this later in
            Settings.
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">
            Recommended square image, at least 256×256.
          </p>
        )}
      </div>
    </div>
  );

  if (compact) {
    return <div className={cn("space-y-2")}>{body}</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Business logo</CardTitle>
        <CardDescription>
          Shown on invoices. PNG, JPG, or SVG - max 2MB. Falls back to your
          business initial if none is set.
        </CardDescription>
      </CardHeader>
      <CardContent>{body}</CardContent>
    </Card>
  );
}
