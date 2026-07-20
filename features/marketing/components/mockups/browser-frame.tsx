import { cn } from "@/lib/utils";

export function BrowserFrame({
  children,
  className,
  url = "app.sterlingsend.com",
}: {
  children: React.ReactNode;
  className?: string;
  url?: string;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_25px_80px_-20px_rgba(15,23,42,0.25)]",
        className,
      )}
    >
      <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50/80 px-4 py-3">
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
        </div>
        <div className="mx-auto flex h-7 w-full max-w-xs items-center justify-center rounded-md bg-white px-3 text-[11px] text-slate-400 ring-1 ring-slate-200/80">
          {url}
        </div>
      </div>
      <div className="relative bg-white">{children}</div>
    </div>
  );
}
