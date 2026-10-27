"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  FloatingLabelField,
  FormStatus,
} from "@/components/ui/form-field";
import { useAuth } from "@/hooks/use-auth";
import { routes } from "@/config/routes";
import { getAuthErrorMessage } from "@/features/auth/lib/auth-errors";
import { GoogleGlyph } from "@/features/auth/components/google-glyph";
import { PageDescription, PageTitle } from "@/components/design-system/typography";
import { AUTH_POST_LOGIN_KEY } from "@/firebase/auth";
import { safeRedirectPath } from "@/lib/auth-hint";

export function SignupForm() {
  const searchParams = useSearchParams();
  const { signUp, signInWithGoogle } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function validate(): boolean {
    const next: Record<string, string> = {};
    if (!email.trim()) next.email = "Enter your email.";
    if (password.length < 8) next.password = "Password must be at least 8 characters.";
    setFieldErrors(next);
    return Object.keys(next).length === 0;
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    if (!validate()) return;
    setLoading(true);

    try {
      const redirectTo = await signUp(email, password, displayName);
      setSuccess(true);
      toast.success("Account created");
      const destination =
        safeRedirectPath(searchParams.get("redirect")) ??
        redirectTo ??
        routes.home;
      window.setTimeout(() => {
        window.location.assign(destination);
      }, 400);
    } catch (error) {
      setFormError(
        getAuthErrorMessage(
          error,
          "Could not create account. Try a different email.",
        ),
      );
      setLoading(false);
    }
  }

  async function onGoogleSignIn() {
    if (loading || googleLoading) return;
    setGoogleLoading(true);
    setFormError(null);

    try {
      const requested = safeRedirectPath(searchParams.get("redirect"));
      if (requested) {
        sessionStorage.setItem(AUTH_POST_LOGIN_KEY, requested);
      } else {
        sessionStorage.removeItem(AUTH_POST_LOGIN_KEY);
      }
      const result = await signInWithGoogle();
      if (result === "redirecting") return;

      setSuccess(true);
      toast.success("Welcome to SterlingSend");
      window.location.assign(
        requested ?? result ?? routes.home,
      );
    } catch (error) {
      setFormError(getAuthErrorMessage(error, "Could not continue with Google"));
      setGoogleLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center lg:text-left">
        <PageTitle>Save your work</PageTitle>
        <PageDescription>
          Create an account only when you want saved invoice history and
          payment details. PDF tools and invoice creation already work without
          login.
        </PageDescription>
      </div>
      <form onSubmit={onSubmit} className="space-y-3" noValidate>
        <FloatingLabelField
          id="displayName"
          label="Your name"
          autoComplete="name"
          value={displayName}
          onChange={(v) => {
            setDisplayName(v);
            setFieldErrors((e) => ({ ...e, displayName: "" }));
          }}
          error={fieldErrors.displayName}
        />
        <FloatingLabelField
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(v) => {
            setEmail(v);
            setFieldErrors((e) => ({ ...e, email: "" }));
            setFormError(null);
          }}
          error={fieldErrors.email}
        />
        <FloatingLabelField
          id="password"
          label="Password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
          showPasswordToggle
          value={password}
          onChange={(v) => {
            setPassword(v);
            setFieldErrors((e) => ({ ...e, password: "" }));
            setFormError(null);
          }}
          error={fieldErrors.password}
        />
        <FormStatus
          message={success ? "Account created. Taking you in..." : formError}
          tone={success ? "success" : "error"}
        />
        <Button
          type="submit"
          className="w-full"
          disabled={loading || googleLoading || success}
        >
          {loading ? "Creating account..." : "Create account"}
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">or</span>
        </div>
      </div>

      <button
        type="button"
        disabled={loading || googleLoading || success}
        onClick={() => void onGoogleSignIn()}
        className="flex h-11 w-full items-center justify-center gap-2.5 rounded-[var(--radius-md)] border border-border bg-white text-sm font-semibold text-foreground transition-[transform,box-shadow,background-color] duration-[var(--duration-150)] hover-fine:hover:-translate-y-0.5 hover-fine:hover:bg-muted disabled:opacity-60"
      >
        <GoogleGlyph className="h-5 w-5 shrink-0" />
        {googleLoading ? "Connecting..." : "Continue with Google"}
      </button>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href={routes.login} className="ss-link-underline font-medium text-foreground">
          Log in
        </Link>
      </p>
    </div>
  );
}
