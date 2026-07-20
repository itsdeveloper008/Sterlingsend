export function PublicPayMockup() {
  return (
    <div className="p-5 text-center">
      <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-teal-600 text-sm font-bold text-white">
        B
      </div>
      <p className="text-xs font-semibold text-slate-900">Bright Studio Ltd</p>
      <p className="mt-1 text-[10px] text-slate-500">Invoice INV-2026-0042</p>
      <p className="mt-4 text-2xl font-bold tracking-tight text-slate-900">£8,150.00</p>
      <p className="mt-1 text-[10px] text-slate-400">Due 24 Jul 2026</p>
      <div className="mx-auto mt-4 h-9 w-full max-w-[180px] rounded-lg bg-teal-600" />
      <p className="mt-3 text-[9px] text-slate-400">Secured by Stripe</p>
    </div>
  );
}
