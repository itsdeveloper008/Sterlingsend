"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { routes } from "@/config/routes";
import { getAuthErrorMessage } from "@/features/auth/lib/auth-errors";
import {
  MascotCharacter,
  type MascotState,
} from "@/features/auth/components/mascot-character";
import { cn } from "@/lib/utils";

function CompassMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={className}
      aria-hidden
      fill="currentColor"
    >
      <path d="M16 2.5 L18.2 13.8 L29.5 16 L18.2 18.2 L16 29.5 L13.8 18.2 L2.5 16 L13.8 13.8 Z" />
    </svg>
  );
}

function GoogleGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        fill="#EA4335"
        d="M12 10.2v3.6h5.1c-.2 1.2-.9 2.3-1.9 3l3.1 2.4c1.8-1.7 2.9-4.1 2.9-7 0-.7-.1-1.3-.2-1.9H12z"
      />
      <path
        fill="#34A853"
        d="M6.6 14.3l-.9.7-2.5 1.9C4.8 20 8.1 22.2 12 22.2c2.4 0 4.4-.8 5.9-2.1l-3.1-2.4c-.8.6-1.9.9-2.8.9-2.2 0-4-1.5-4.7-3.5z"
      />
      <path
        fill="#4A90E2"
        d="M3.2 7.1C2.4 8.6 2 10.2 2 12s.4 3.4 1.2 4.9l3.4-2.6C6.2 13.4 6 12.7 6 12s.2-1.4.6-2.3L3.2 7.1z"
      />
      <path
        fill="#FBBC05"
        d="M12 5.8c1.3 0 2.5.5 3.4 1.3l2.5-2.5C16.4 3.1 14.4 2.2 12 2.2 8.1 2.2 4.8 4.4 3.2 7.1l3.4 2.6C7.9 7.3 9.8 5.8 12 5.8z"
      />
    </svg>
  );
}

export function LoginForm() {
  const searchParams = useSearchParams();
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focusField, setFocusField] = useState<"email" | "password" | null>(
    null,
  );
  const [authError, setAuthError] = useState(false);
  const [success, setSuccess] = useState(false);
  const errorShakeLock = useRef(false);
  const errorClearTimer = useRef<number | null>(null);

  /**
   * Single active state - priority:
   * success > password-error > password focus/visible > email-focus > idle
   */
  const mascotState: MascotState = useMemo(() => {
    if (success) return "success";
    if (authError) return "password-error";
    if (focusField === "password") {
      return showPassword ? "password-visible" : "password-focus";
    }
    if (focusField === "email") return "email-focus";
    return "idle";
  }, [authError, focusField, showPassword, success]);

  function clearError() {
    if (!authError) return;
    setAuthError(false);
    errorShakeLock.current = false;
    if (errorClearTimer.current) {
      window.clearTimeout(errorClearTimer.current);
      errorClearTimer.current = null;
    }
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    clearError();

    try {
      const redirectTo = await signIn(email, password);
      setSuccess(true);
      toast.success("Welcome back");
      const requested = searchParams.get("redirect");
      const destination =
        requested && requested.startsWith("/")
          ? requested
          : (redirectTo ?? routes.dashboard);
      window.setTimeout(() => {
        window.location.assign(destination);
      }, 480);
    } catch (error) {
      setSuccess(false);
      // Fire shake + worried mouth once per failed attempt
      if (!errorShakeLock.current) {
        errorShakeLock.current = true;
        setAuthError(true);
        errorClearTimer.current = window.setTimeout(() => {
          setAuthError(false);
          errorShakeLock.current = false;
          errorClearTimer.current = null;
        }, 2000);
      }
      toast.error(getAuthErrorMessage(error, "Invalid email or password"));
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[100dvh] w-full bg-white">
      <div className="grid min-h-[100dvh] w-full lg:grid-cols-2">
        <aside className="relative hidden bg-[#f1f5f9] lg:block">
          <MascotCharacter state={mascotState} className="absolute inset-0" />
        </aside>

        <section className="flex flex-col justify-center bg-white px-6 py-12 sm:px-12 lg:px-16">
          <div className="mx-auto w-full max-w-[380px]">
            <div className="flex flex-col items-center text-center">
              <CompassMark className="h-8 w-8 text-primary" />
              <h1 className="mt-5 text-2xl font-semibold tracking-tight text-foreground sm:text-[1.75rem]">
                Welcome back to SterlingSend
              </h1>
            </div>

            <div className="relative mx-auto mt-6 h-28 w-full max-w-[220px] lg:hidden">
              <MascotCharacter state={mascotState} className="absolute inset-0" />
            </div>

            <form onSubmit={onSubmit} className="mt-8 space-y-6">
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="block text-xs font-medium text-muted-foreground"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onFocus={() => {
                    clearError();
                    setFocusField("email");
                  }}
                  onBlur={() =>
                    setFocusField((current) =>
                      current === "email" ? null : current,
                    )
                  }
                  onChange={(e) => {
                    clearError();
                    setEmail(e.target.value);
                  }}
                  className={cn(
                    "w-full border-0 border-b border-input bg-transparent pb-2.5 text-[15px] text-foreground",
                    "outline-none transition-colors placeholder:text-muted-foreground/40",
                    "focus:border-primary",
                  )}
                  placeholder="anna@gmail.com"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="block text-xs font-medium text-muted-foreground"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={password}
                    onFocus={() => {
                      clearError();
                      setFocusField("password");
                    }}
                    onBlur={() =>
                      setFocusField((current) =>
                        current === "password" ? null : current,
                      )
                    }
                    onChange={(e) => {
                      clearError();
                      setPassword(e.target.value);
                    }}
                    className={cn(
                      "w-full border-0 border-b border-input bg-transparent pb-2.5 pr-10 text-[15px] text-foreground",
                      "outline-none transition-colors placeholder:text-muted-foreground/40",
                      "focus:border-primary",
                    )}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      clearError();
                      setShowPassword((v) => !v);
                    }}
                    className="absolute right-0 top-1/2 -translate-y-[60%] rounded p-1 text-muted-foreground/70 transition-colors hover:text-primary"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end pt-1">
                <Link
                  href={routes.forgotPassword}
                  className="shrink-0 text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  Forgot password?
                </Link>
              </div>

              <div className="space-y-3 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className={cn(
                    "flex h-12 w-full items-center justify-center rounded-full bg-primary text-sm font-semibold text-white",
                    "transition hover:bg-[#0d9488] disabled:opacity-60",
                  )}
                >
                  {loading ? "Signing in..." : "Log in"}
                </button>

                <button
                  type="button"
                  onClick={() =>
                    toast.message("Google sign-in is coming soon")
                  }
                  className={cn(
                    "flex h-12 w-full items-center justify-center gap-2.5 rounded-full border border-border bg-white text-sm font-semibold text-foreground",
                    "transition hover:bg-muted",
                  )}
                >
                  <GoogleGlyph className="h-4 w-4" />
                  Log in with Google
                </button>
              </div>
            </form>

            <p className="mt-8 text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link
                href={routes.signup}
                className="font-semibold text-primary hover:underline"
              >
                Sign Up
              </Link>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
