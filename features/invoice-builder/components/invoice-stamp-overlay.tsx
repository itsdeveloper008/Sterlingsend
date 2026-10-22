"use client";

import { useCallback, useEffect, useRef, type CSSProperties } from "react";
import {
  DEFAULT_STAMP_POSITION,
  STAMP_SIZE_PCT,
  getStampMeta,
  type InvoiceStamp,
  type InvoiceStampSize,
} from "@/features/invoice-builder/lib/stamps";
import { cn } from "@/lib/utils";

export function InvoiceStampOverlay({
  stamp,
  repositioning,
  onChange,
  onExitReposition,
  animate,
}: {
  stamp: InvoiceStamp;
  repositioning: boolean;
  onChange: (next: InvoiceStamp) => void;
  onExitReposition: () => void;
  animate: boolean;
}) {
  const meta = getStampMeta(stamp.type);
  const rootRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ ox: number; oy: number; sx: number; sy: number } | null>(
    null,
  );

  const widthPct = STAMP_SIZE_PCT[stamp.size];

  const clampToSheet = useCallback((x: number, y: number) => {
    const sheet = rootRef.current?.offsetParent as HTMLElement | null;
    const el = rootRef.current;
    if (!sheet || !el) return { x, y };
    const maxX = Math.max(0, 100 - (el.offsetWidth / sheet.offsetWidth) * 100);
    const maxY = Math.max(0, 100 - (el.offsetHeight / sheet.offsetHeight) * 100);
    return {
      x: Math.min(maxX, Math.max(0, x)),
      y: Math.min(maxY, Math.max(0, y)),
    };
  }, []);

  useEffect(() => {
    if (!repositioning) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onExitReposition();
        return;
      }
      if (event.key === "Delete" || event.key === "Backspace") {
        // parent handles remove via None
        return;
      }
      const step = event.shiftKey ? 40 : 10;
      const sheet = rootRef.current?.offsetParent as HTMLElement | null;
      if (!sheet) return;
      let dx = 0;
      let dy = 0;
      if (event.key === "ArrowLeft") dx = -step;
      if (event.key === "ArrowRight") dx = step;
      if (event.key === "ArrowUp") dy = -step;
      if (event.key === "ArrowDown") dy = step;
      if (!dx && !dy) return;
      event.preventDefault();
      const nx = stamp.x + (dx / sheet.offsetWidth) * 100;
      const ny = stamp.y + (dy / sheet.offsetHeight) * 100;
      const clamped = clampToSheet(nx, ny);
      onChange({ ...stamp, ...clamped });
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [repositioning, stamp, onChange, onExitReposition, clampToSheet]);

  function onPointerDown(event: React.PointerEvent) {
    if (!repositioning) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = {
      ox: event.clientX,
      oy: event.clientY,
      sx: stamp.x,
      sy: stamp.y,
    };
  }

  function onPointerMove(event: React.PointerEvent) {
    if (!drag.current || !repositioning) return;
    const sheet = rootRef.current?.offsetParent as HTMLElement | null;
    if (!sheet) return;
    const dx = event.clientX - drag.current.ox;
    const dy = event.clientY - drag.current.oy;
    const nx = drag.current.sx + (dx / sheet.offsetWidth) * 100;
    const ny = drag.current.sy + (dy / sheet.offsetHeight) * 100;
    onChange({ ...stamp, ...clampToSheet(nx, ny) });
  }

  function onPointerUp() {
    drag.current = null;
  }

  return (
    <div
      ref={rootRef}
      className={cn(
        "builder-stamp",
        repositioning && "builder-stamp--reposition",
        animate && "builder-stamp--animate",
      )}
      style={
        {
          left: `${stamp.x}%`,
          top: `${stamp.y}%`,
          width: `${widthPct}%`,
          "--stamp-rot": `${meta.rotation}deg`,
          transform: `rotate(${meta.rotation}deg)`,
        } as CSSProperties
      }
      role="img"
      aria-label={`Stamp: ${meta.label}`}
      tabIndex={repositioning ? 0 : undefined}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={meta.src} alt="" draggable={false} />
      {repositioning ? (
        <button
          type="button"
          className="builder-stamp-done no-print"
          onClick={onExitReposition}
        >
          Done
        </button>
      ) : null}
    </div>
  );
}

export function createStamp(
  type: InvoiceStamp["type"],
  size: InvoiceStampSize = "M",
): InvoiceStamp {
  return {
    type,
    size,
    x: DEFAULT_STAMP_POSITION.x,
    y: DEFAULT_STAMP_POSITION.y,
  };
}
