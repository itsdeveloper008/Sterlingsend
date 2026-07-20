import Link from "next/link";
import { routes } from "@/config/routes";
import { Logo } from "@/components/design-system/logo";
import { ButtonLink } from "@/components/ui/button-link";

export function GuestShell({
  children,
  step,
}: {
  children: React.ReactNode;
  step?: 1 | 2;
}) {
  return (
    <div className="min-h-screen bg-[#F4F7FB]">
      <header className="sticky top-0 z-40 border-b border-[#E2E8F0]/80 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Logo href={routes.home} />
          <div className="hidden items-center gap-6 sm:flex">
            {step ? (
              <div className="flex items-center gap-2 text-sm">
                <span
                  className={
                    step >= 1
                      ? "font-medium text-teal-600"
                      : "text-slate-400"
                  }
                >
                  1. Create
                </span>
                <span className="text-slate-300">→</span>
                <span
                  className={
                    step >= 2
                      ? "font-medium text-teal-600"
                      : "text-slate-400"
                  }
                >
                  2. Preview
                </span>
              </div>
            ) : null}
            <Link
              href={routes.login}
              className="text-sm font-medium text-slate-600 hover:text-slate-900"
            >
              Log in
            </Link>
            <ButtonLink href={routes.signup} variant="outline" size="sm">
              Save invoices
            </ButtonLink>
          </div>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
