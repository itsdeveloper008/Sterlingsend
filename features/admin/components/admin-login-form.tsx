"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowRight, Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { routes } from "@/config/routes";
import { siteConfig } from "@/config/site";
import { getAuthErrorMessage } from "@/features/auth/lib/auth-errors";
import { cn } from "@/lib/utils";

const fieldClass = cn(
  "h-12 w-full rounded-xl border border-[#E3E8E6] bg-[#F4F6F5] pl-11 pr-4 text-[15px] text-[#0B2E35]",
  "outline-none transition-[border-color,box-shadow,background-color] placeholder:text-[#8A9A99]",
  "focus:border-[#0E7C86] focus:bg-white focus:shadow-[0_0_0_4px_rgba(14,124,134,0.12)]",
);

export function AdminLoginForm() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // The session API refuses non-admin accounts on this form.
      await signIn(email, password, { admin: true });
      window.location.assign(routes.admin);
    } catch (err) {
      setError(getAuthErrorMessage(err, "Invalid email or password"));
      setLoading(false);
    }
  }

  return (
    <div
      className="relative flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden px-4 py-12"
      style={{
        backgroundColor: "#0A3A43",
        backgroundImage: [
          "radial-gradient(ellipse at 50% 0%, rgba(20,160,170,0.28), transparent 60%)",
          "repeating-linear-gradient(135deg, rgba(255,255,255,0.035) 0 2px, transparent 2px 28px)",
        ].join(","),
      }}
    >
      <div className="flex flex-col items-center text-center">
        <span className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white shadow-[0_12px_32px_rgba(0,0,0,0.25)] ring-4 ring-white/10">
          <Image
            src={siteConfig.logo}
            alt={siteConfig.logoAlt}
            width={48}
            height={48}
            className="h-12 w-12 object-contain"
            priority
          />
        </span>
        <p className="mt-6 text-xl font-medium tracking-[0.28em] text-white sm:text-2xl">
          STERLINGSEND
        </p>
        <p className="mt-2 text-[11px] font-semibold tracking-[0.32em] text-[#7DD8DD]">
          INVOICES · PDF TOOLS · CONTROL
        </p>
      </div>

      <div className="mt-8 w-full max-w-[440px] rounded-[22px] bg-[#FBFCFB] p-7 shadow-[0_30px_80px_rgba(0,0,0,0.35)] sm:p-9">
        <span className="inline-flex rounded-full bg-[#0A3A43] px-3 py-1 text-[11px] font-bold tracking-[0.18em] text-[#7DD8DD]">
          ADMIN ACCESS
        </span>
        <h1 className="mt-4 text-[32px] font-semibold leading-tight tracking-tight text-[#0B2E35]">
          Welcome back
        </h1>
        <p className="mt-1 text-sm text-[#5B6B6A]">
          Sign in to view users and business details.
        </p>

        <form onSubmit={onSubmit} className="mt-7 space-y-5" noValidate>
          <div className="space-y-2">
            <label htmlFor="admin-email" className="text-sm font-medium text-[#0B2E35]">
              Email
            </label>
            <div className="relative">
              <Mail
                className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8A9A99]"
                aria-hidden
              />
              <input
                id="admin-email"
                type="email"
                autoComplete="username"
                required
                placeholder="Email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError(null);
                }}
                className={fieldClass}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="admin-password" className="text-sm font-medium text-[#0B2E35]">
              Password
            </label>
            <div className="relative">
              <Lock
                className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8A9A99]"
                aria-hidden
              />
              <input
                id="admin-password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                placeholder="Password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(null);
                }}
                className={cn(fieldClass, "pr-12")}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-[#8A9A99] transition-colors hover:text-[#0B2E35]"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {error ? (
            <p
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700"
            >
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={loading || !email || !password}
            className={cn(
              "flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#0A3A43] text-[15px] font-semibold text-white",
              "transition-[background-color,transform] hover:bg-[#0E4D58] active:translate-y-px disabled:opacity-60",
            )}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                Signing in…
              </>
            ) : (
              <>
                Sign in
                <ArrowRight className="h-4 w-4" aria-hidden />
              </>
            )}
          </button>
        </form>

        <div className="mt-7 border-t border-[#E6EBE9] pt-5">
          <p className="flex items-center justify-center gap-2 text-sm text-[#6B7B7A]">
            <Lock className="h-3.5 w-3.5" aria-hidden />
            Authorized personnel only
          </p>
        </div>
      </div>
    </div>
  );
}
