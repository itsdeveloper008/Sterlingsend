"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import {
  FloatingLabelField,
  FormStatus,
} from "@/components/ui/form-field";
import { useAuth } from "@/hooks/use-auth";
import { routes } from "@/config/routes";
import { getAuthErrorMessage } from "@/features/auth/lib/auth-errors";
import { PageDescription, PageTitle } from "@/components/design-system/typography";
import type { PasswordResetCheck } from "@/features/auth/lib/password-reset";

export function ForgotPasswordForm() {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [fieldError, setFieldError] = useState<string | undefined>();
  const [formError, setFormError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    if (!email.trim()) {
      setFieldError("Enter your email.");
      return;
    }
    setLoading(true);

    try {
      const check = await fetch("/api/auth/password-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const result = (await check.json()) as {
        status?: PasswordResetCheck;
        error?: string;
      };
      if (!check.ok || !result.status) {
        setFormError(result.error ?? "Could not send reset email. Try again.");
        return;
      }
      if (result.status === "no-account") {
        setFormError(
          "We couldn't find an account with that email. Check the spelling or create a new account.",
        );
        return;
      }
      if (result.status === "google-only") {
        setFormError(
          "This account signs in with Google, so it has no password to reset. Use “Log in with Google” instead.",
        );
        return;
      }

      await forgotPassword(email);
      setSent(true);
      toast.success("Password reset email sent");
    } catch (error) {
      setFormError(
        getAuthErrorMessage(error, "Could not send reset email. Try again."),
      );
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="space-y-4 text-center lg:text-left">
        <PageTitle>Check your email</PageTitle>
        <PageDescription>
          We sent a password reset link to {email}. It can take a few
          minutes to arrive.
        </PageDescription>
        <FormStatus
          message="Not in your inbox? Check your spam or junk folder for an email from SterlingSend."
          tone="success"
        />
        <ButtonLink href={routes.login} variant="outline" className="w-full">
          Back to login
        </ButtonLink>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center lg:text-left">
        <PageTitle>Reset password</PageTitle>
        <PageDescription>
          Enter your email and we will send you a reset link.
        </PageDescription>
      </div>
      <form onSubmit={onSubmit} className="space-y-3" noValidate>
        <FloatingLabelField
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(v) => {
            setEmail(v);
            setFieldError(undefined);
            setFormError(null);
          }}
          error={fieldError}
        />
        <FormStatus message={formError} />
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Sending..." : "Send reset link"}
        </Button>
      </form>
      <p className="text-center text-sm text-muted-foreground">
        <Link href={routes.login} className="ss-link-underline font-medium text-foreground">
          Back to login
        </Link>
      </p>
    </div>
  );
}
