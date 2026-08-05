import { routes } from "@/config/routes";
import { Logo } from "@/components/design-system/logo";
import { InvoiceEditorMockup } from "@/features/marketing/components/mockups/invoice-editor-mockup";

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex flex-col justify-between bg-white p-6 sm:p-10 lg:p-12">
        <Logo href={routes.home} size={56} />
        <div className="mx-auto w-full max-w-md flex-1 py-10 lg:py-16">{children}</div>
        <p className="text-sm text-slate-500">
          © {new Date().getFullYear()} SterlingSend
        </p>
      </div>

      <div className="relative hidden flex-col justify-center overflow-hidden bg-slate-950 p-10 xl:p-12 lg:flex">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(20,184,166,0.15),transparent_50%)]" />
        <div className="relative z-10 max-w-xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-teal-400">
            SterlingSend
          </p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white">
            Create invoices. Get paid. Move on.
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-slate-400">
            The fastest way for UK businesses to invoice clients - without
            accounting complexity.
          </p>
        </div>
        <div className="relative z-10 mt-10 w-full max-w-xl">
          <InvoiceEditorMockup />
        </div>
      </div>
    </div>
  );
}
