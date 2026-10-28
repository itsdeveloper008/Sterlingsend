"use client";

import dynamic from "next/dynamic";
import { routes } from "@/config/routes";
import { Logo } from "@/components/design-system/logo";

const MascotCharacter = dynamic(
  () =>
    import("@/features/auth/components/mascot-character").then((m) => ({
      default: m.MascotCharacter,
    })),
  { ssr: false },
);

/** Signup / forgot-password: form left, the cursor-following characters right, one screen tall. */
export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-[100dvh] lg:h-[100dvh] lg:grid-cols-2 lg:overflow-hidden">
      <div className="flex flex-col bg-white p-6 sm:p-10 lg:overflow-y-auto lg:px-12 lg:py-6">
        <Logo href={routes.home} size={44} />
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-8 lg:py-4">
          {children}
        </div>
        <p className="text-sm text-slate-500 lg:hidden">
          © {new Date().getFullYear()} SterlingSend
        </p>
      </div>

      <aside className="relative hidden flex-col bg-[#f1f5f9] lg:flex">
        <div className="relative z-10 px-12 pt-14 xl:px-16">
          <p className="text-sm font-semibold uppercase tracking-wider text-[var(--brand-700)]">
            SterlingSend
          </p>
          <p className="mt-3 max-w-md text-3xl font-semibold tracking-tight text-foreground">
            Create invoices. Download PDFs. Move on.
          </p>
          <p className="mt-3 max-w-md text-base leading-relaxed text-muted-foreground">
            The fastest way for UK businesses to invoice clients, without
            accounting complexity.
          </p>
        </div>
        <MascotCharacter
          state="idle"
          className="absolute inset-x-0 bottom-0 top-[240px]"
        />
      </aside>
    </div>
  );
}
