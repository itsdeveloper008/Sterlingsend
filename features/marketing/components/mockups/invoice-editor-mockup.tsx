export function InvoiceEditorMockup() {
  return (
    <div className="p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-wider text-teal-600">
            New invoice
          </p>
          <p className="text-sm font-semibold text-slate-900">INV-2026-0042</p>
        </div>
        <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-medium text-amber-700 ring-1 ring-amber-200/80">
          Draft
        </span>
      </div>

      <div className="mb-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg bg-slate-50 p-3 ring-1 ring-slate-100">
          <p className="text-[10px] font-medium text-slate-400">From</p>
          <p className="mt-1 text-xs font-semibold text-slate-900">Bright Studio Ltd</p>
          <p className="text-[10px] text-slate-500">hello@brightstudio.co.uk</p>
        </div>
        <div className="rounded-lg bg-slate-50 p-3 ring-1 ring-slate-100">
          <p className="text-[10px] font-medium text-slate-400">Bill to</p>
          <p className="mt-1 text-xs font-semibold text-slate-900">Oakfield Consulting</p>
          <p className="text-[10px] text-slate-500">accounts@oakfield.com</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg ring-1 ring-slate-100">
        <div className="grid grid-cols-[1fr_56px_64px] gap-2 bg-slate-50 px-3 py-2 text-[9px] font-medium uppercase tracking-wide text-slate-400">
          <span>Description</span>
          <span className="text-right">Qty</span>
          <span className="text-right">Total</span>
        </div>
        {[
          ["Brand identity design", "1", "£2,400"],
          ["Website development", "1", "£4,800"],
          ["Monthly retainer", "1", "£950"],
        ].map(([desc, qty, total]) => (
          <div
            key={desc}
            className="grid grid-cols-[1fr_56px_64px] gap-2 border-t border-slate-100 px-3 py-2.5 text-[11px]"
          >
            <span className="font-medium text-slate-800">{desc}</span>
            <span className="text-right text-slate-500">{qty}</span>
            <span className="text-right font-semibold text-slate-900">{total}</span>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-end justify-between">
        <div className="h-8 w-24 rounded-lg bg-teal-600/90" />
        <div className="text-right">
          <p className="text-[10px] text-slate-400">Total due</p>
          <p className="text-lg font-bold tracking-tight text-slate-900">£8,150.00</p>
        </div>
      </div>
    </div>
  );
}
