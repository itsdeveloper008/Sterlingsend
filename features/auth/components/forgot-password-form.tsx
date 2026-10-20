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
          If an account exists for {email}, you will receive a password reset
          link.
        </PageDescription>
        <FormStatus
          message="Reset link sent. Check your inbox."
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
