"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { routes } from "@/config/routes";
import { getAuthErrorMessage } from "@/features/auth/lib/auth-errors";
import { GoogleGlyph } from "@/features/auth/components/google-glyph";
import { PageDescription, PageTitle } from "@/components/design-system/typography";

export function SignupForm() {
  const { signUp, signInWithGoogle } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    try {
      const redirectTo = await signUp(email, password, displayName);
      toast.success("Account created");
      window.location.assign(redirectTo ?? routes.home);
    } catch (error) {
      toast.error(
        getAuthErrorMessage(error, "Could not create account. Try a different email."),
      );
      setLoading(false);
    }
  }

  async function onGoogleSignIn() {
    if (loading || googleLoading) return;
    setGoogleLoading(true);

    try {
      const redirectTo = await signInWithGoogle();
      toast.success("Welcome to SterlingSend");
      window.location.assign(redirectTo ?? routes.home);
    } catch (error) {
      toast.error(getAuthErrorMessage(error, "Could not continue with Google"));
      setGoogleLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center lg:text-left">
        <PageTitle>Save your work</PageTitle>
        <PageDescription>
          Create an account only when you want saved invoices, customers, and
          payment history. PDF tools and invoice creation already work without
          login.
        </PageDescription>
      </div>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="displayName">Your name</Label>
          <Input
            id="displayName"
            autoComplete="name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
        </div>
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
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <Button type="submit" className="w-full" disabled={loading || googleLoading}>
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
        disabled={loading || googleLoading}
        onClick={onGoogleSignIn}
        className="flex h-11 w-full items-center justify-center gap-2.5 rounded-full border border-border bg-white text-sm font-semibold text-foreground transition hover:bg-muted disabled:opacity-60"
      >
        <GoogleGlyph className="h-5 w-5 shrink-0" />
        {googleLoading ? "Connecting..." : "Continue with Google"}
      </button>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href={routes.login} className="font-medium text-foreground">
          Log in
        </Link>
      </p>
    </div>
  );
}
