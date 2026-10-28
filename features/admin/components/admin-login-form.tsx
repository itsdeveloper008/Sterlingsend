"use client";

import { useState } from "react";
import { Eye, EyeOff, ShieldCheck } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { routes } from "@/config/routes";
import { checkAdminSession } from "@/actions/admin.actions";
import { getAuthErrorMessage } from "@/features/auth/lib/auth-errors";
import { Logo } from "@/components/design-system/logo";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function AdminLoginForm() {
  const { signIn, signOut } = useAuth();
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
      await signIn(email, password);
      if (!(await checkAdminSession())) {
        // Signed in fine, but not an admin: don't leave them logged in here.
        await signOut();
        setError("This account does not have admin access.");
        setLoading(false);
        return;
      }
      window.location.assign(routes.admin);
    } catch (err) {
      setError(getAuthErrorMessage(err, "Invalid email or password"));
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-[var(--brand-900,#0f172a)] px-4 py-12">
      <div className="w-full max-w-[400px] rounded-[var(--radius-md)] bg-card p-8 shadow-[var(--shadow-2)]">
        <div className="flex items-center gap-3">
          <Logo size={32} />
          <span className="rounded-md bg-[var(--brand-tint)] px-2 py-0.5 text-xs font-semibold text-[var(--brand-700)]">
            Admin
          </span>
        </div>

        <div className="mt-6 flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-[var(--brand-700)]" aria-hidden />
          <h1 className="text-xl font-semibold text-foreground">Admin sign in</h1>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Restricted area. Staff accounts only.
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="admin-email" className="text-sm font-medium text-foreground">
              Email
            </label>
            <Input
              id="admin-email"
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="admin-password" className="text-sm font-medium text-foreground">
              Password
            </label>
            <div className="relative">
              <Input
                id="admin-password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <p role="alert" aria-live="polite" className="min-h-5 text-sm text-destructive">
            {error ?? " "}
          </p>

          <Button type="submit" disabled={loading} className="h-11 w-full">
            {loading ? "Signing in..." : "Sign in"}
          </Button>
        </form>
      </div>
    </div>
  );
}
