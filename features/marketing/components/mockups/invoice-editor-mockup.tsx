import Image from "next/image";

/** Static Classic invoice preview for auth side panel. */
export function InvoiceEditorMockup() {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_24px_60px_-20px_rgba(15,23,42,0.45)]">
      <div className="space-y-4 p-4 sm:p-5">
        <header className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Image
              src="/brand/sterlingsend-logo.png"
              alt="SterlingSend"
              width={36}
              height={36}
              className="h-9 w-9 object-contain"
            />
            <p className="mt-2 text-lg font-bold tracking-tight text-slate-900">
              INVOICE
            </p>
            <p className="text-xs font-semibold text-teal-600">SS-1092</p>
          </div>
          <div className="max-w-[55%] text-right text-[10px] leading-relaxed text-slate-500">
            <p className="font-semibold text-slate-800">Sterlingsend</p>
            <p>Sterlingsend@gmail.com</p>
            <p>+44 7700 900123</p>
            <p>VAT: GB123456789</p>
          </div>
        </header>

        <div className="grid grid-cols-3 gap-2 rounded-lg bg-slate-50 px-3 py-2.5 ring-1 ring-slate-100">
          <div>
            <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">
              Billed To
            </p>
            <p className="mt-1 text-[11px] font-semibold text-slate-900">
              Onixs.ai
            </p>
            <p className="text-[10px] text-slate-500">onixs@gmail.com</p>
          </div>
          <div>
            <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">
              Issue Date
            </p>
            <p className="mt-1 text-[11px] font-medium text-slate-900">
              2026-08-05
            </p>
          </div>
          <div>
            <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">
              Due Date
            </p>
            <p className="mt-1 text-[11px] font-medium text-slate-900">
              2026-08-19
            </p>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg ring-1 ring-slate-100">
          <div className="grid grid-cols-[1.4fr_0.4fr_0.7fr_0.55fr_0.55fr_0.8fr] gap-1 bg-slate-50 px-2 py-1.5 text-[8px] font-semibold uppercase tracking-wide text-slate-400">
            <span>Description</span>
            <span className="text-right">Qty</span>
            <span className="text-right">Price</span>
            <span className="text-right">Disc</span>
            <span className="text-right">VAT</span>
            <span className="text-right">Total</span>
          </div>
          {[
            ["web development", "1", "8,000.00", "10%", "8%", "£7,776.00"],
            ["Digital marketing", "1", "7,800.00", "10%", "8%", "£7,581.60"],
          ].map((row) => (
            <div
              key={row[0]}
              className="grid grid-cols-[1.4fr_0.4fr_0.7fr_0.55fr_0.55fr_0.8fr] gap-1 border-t border-slate-100 px-2 py-2 text-[9px] text-slate-700"
            >
              <span className="font-medium text-slate-900">{row[0]}</span>
              <span className="text-right">{row[1]}</span>
              <span className="text-right">{row[2]}</span>
              <span className="text-right">{row[3]}</span>
              <span className="text-right">{row[4]}</span>
              <span className="text-right font-semibold text-slate-900">
                {row[5]}
              </span>
            </div>
          ))}
        </div>

        <div className="ml-auto w-full max-w-[220px] space-y-1.5 text-[10px]">
          <div className="flex justify-between text-slate-600">
            <span>Subtotal</span>
            <span className="font-medium text-slate-900">£14,220.00</span>
          </div>
          <div className="flex justify-between text-rose-500">
            <span>Discount</span>
            <span className="font-medium">- £1,580.00</span>
          </div>
          <div className="flex justify-between text-teal-600">
            <span>VAT (8%)</span>
            <span className="font-medium">+ £1,137.60</span>
          </div>
          <div className="mt-2 flex items-center justify-between rounded-md bg-teal-50 px-2.5 py-2 ring-1 ring-teal-100">
            <span className="text-[10px] font-semibold text-slate-800">
              GBP (£)
            </span>
            <span className="text-sm font-bold text-teal-700">£15,357.60</span>
          </div>
        </div>

        <div className="grid gap-3 border-t border-slate-100 pt-3 sm:grid-cols-2">
          <div>
            <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">
              Notes
            </p>
            <p className="mt-1 text-[10px] text-slate-600">
              Thank you for your business!
            </p>
          </div>
          <div>
            <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">
              Payment Details
            </p>
            <div className="mt-1 space-y-0.5 text-[10px] text-slate-600">
              <p>
                <span className="text-slate-400">Account Holder:</span> Falak
                Sher
              </p>
              <p>
                <span className="text-slate-400">Bank Name:</span> Bank of
                Scotland
              </p>
              <p>
                <span className="text-slate-400">IBAN:</span>{" "}
                BOS29NWBK60161331926819
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-end justify-between border-t border-slate-100 pt-3">
          <div className="flex items-center gap-2">
            <Image
              src="/brand/sterlingsend-logo.png"
              alt=""
              width={20}
              height={20}
              className="h-5 w-5 object-contain opacity-80"
            />
            <p className="text-[9px] text-slate-400">Sterlingsend@gmail.com</p>
          </div>
          <div className="text-right">
            <p className="text-[8px] font-semibold uppercase tracking-wide text-slate-400">
              Invoice No.
            </p>
            <p className="text-xs font-bold text-teal-600">SS-1092</p>
          </div>
        </div>
      </div>
    </div>
  );
}
