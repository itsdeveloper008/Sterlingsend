"use client";

import { useEffect, useRef, useState } from "react";
import { Eraser, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SignaturePad({
  value,
  onChange,
}: {
  value: string;
  onChange: (dataUrl: string) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const ready = useRef(false);
  const [hasInk, setHasInk] = useState(Boolean(value));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || ready.current) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const ratio = window.devicePixelRatio || 1;
    const width = canvas.clientWidth || 480;
    const height = canvas.clientHeight || 144;
    canvas.width = Math.floor(width * ratio);
    canvas.height = Math.floor(height * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.lineWidth = 2.2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#0f172a";
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
    ready.current = true;

    if (value) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, width, height);
        setHasInk(true);
      };
      img.src = value;
    }
    // Intentionally mount-only so drawing does not reset the canvas.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function point(event: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  }

  function emit() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    onChange(canvas.toDataURL("image/png"));
    setHasInk(true);
  }

  function clear() {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    onChange("");
    setHasInk(false);
  }

  function onUpload(file: File | null) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result || "");
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!canvas || !ctx) {
        onChange(dataUrl);
        setHasInk(true);
        return;
      }
      const img = new Image();
      img.onload = () => {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);
        ctx.drawImage(img, 0, 0, canvas.clientWidth, canvas.clientHeight);
        onChange(canvas.toDataURL("image/png"));
        setHasInk(true);
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="space-y-3">
      <div
        className={cn(
          "overflow-hidden rounded-xl border border-border bg-white shadow-xs",
          "ring-offset-background focus-within:ring-2 focus-within:ring-primary/40",
        )}
      >
        <canvas
          ref={canvasRef}
          className="h-36 w-full touch-none cursor-crosshair"
          onPointerDown={(e) => {
            const canvas = canvasRef.current;
            const ctx = canvas?.getContext("2d");
            if (!canvas || !ctx) return;
            drawing.current = true;
            canvas.setPointerCapture(e.pointerId);
            const { x, y } = point(e);
            ctx.beginPath();
            ctx.moveTo(x, y);
          }}
          onPointerMove={(e) => {
            if (!drawing.current) return;
            const ctx = canvasRef.current?.getContext("2d");
            if (!ctx) return;
            const { x, y } = point(e);
            ctx.lineTo(x, y);
            ctx.stroke();
          }}
          onPointerUp={() => {
            drawing.current = false;
            emit();
          }}
          onPointerLeave={() => {
            if (drawing.current) {
              drawing.current = false;
              emit();
            }
          }}
        />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" size="sm" variant="outline" onClick={clear}>
          <Eraser className="mr-1.5 h-3.5 w-3.5" />
          Clear
        </Button>
        <label className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-md border border-input bg-background px-3 text-xs font-medium hover:bg-accent">
          <Upload className="h-3.5 w-3.5" />
          Upload image
          <input
            type="file"
            accept="image/png,image/jpeg,image/jpg"
            className="sr-only"
            onChange={(e) => {
              onUpload(e.target.files?.[0] ?? null);
              e.target.value = "";
            }}
          />
        </label>
        <span className="text-xs text-muted-foreground">
          {hasInk ? "Signature ready" : "Draw above or upload a PNG/JPG"}
        </span>
      </div>
    </div>
  );
}
