"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { routes } from "@/config/routes";
import { PageDescription, PageTitle } from "@/components/design-system/typography";

export function ForgotPasswordForm() {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    try {
      await forgotPassword(email);
      setSent(true);
      toast.success("Password reset email sent");
    } catch {
      toast.error("Could not send reset email");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="space-y-4 text-center lg:text-left">
        <PageTitle>Check your email</PageTitle>
        <PageDescription>
          If an account exists for {email}, you will receive a password reset link.
        </PageDescription>
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
          Enter your email and we&apos;ll send you a reset link.
        </PageDescription>
      </div>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Sending..." : "Send reset link"}
        </Button>
      </form>
      <p className="text-center text-sm text-muted-foreground">
        <Link href={routes.login} className="font-medium text-foreground">
          Back to login
        </Link>
      </p>
    </div>
  );
}
