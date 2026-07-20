export function DashboardMockup() {
  return (
    <div className="p-4">
      <p className="text-xs font-semibold text-slate-900">Good morning, Bright Studio</p>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {[
          ["Invoices", "24"],
          ["Paid", "£18.2k"],
          ["Pending", "3"],
        ].map(([label, value]) => (
          <div key={label} className="rounded-lg bg-slate-50 p-2.5 ring-1 ring-slate-100">
            <p className="text-[9px] text-slate-400">{label}</p>
            <p className="text-sm font-bold text-slate-900">{value}</p>
          </div>
        ))}
      </div>
      <div className="mt-3 space-y-1.5">
        {["INV-0042 · Oakfield", "INV-0041 · Meridian", "INV-0040 · Cedar Co"].map(
          (row) => (
            <div
              key={row}
              className="flex items-center justify-between rounded-md bg-slate-50 px-2.5 py-2 text-[10px] ring-1 ring-slate-100"
            >
              <span className="font-medium text-slate-700">{row}</span>
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-medium text-emerald-700">
                Paid
              </span>
            </div>
          ),
        )}
      </div>
    </div>
  );
}
