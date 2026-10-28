import type { Metadata } from "next";
import { Suspense } from "react";
import { SignupForm } from "@/features/auth";

export const metadata: Metadata = {
  robots: { index: false, follow: true },
  title: "Create your account",
  description:
    "Create a free SterlingSend account to save invoices, keep PDF tool files in your history and store your business details. Sign up with email or Google.",
  alternates: { canonical: "/signup" },
};

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="text-sm text-muted-foreground">Loading…</div>
      }
    >
      <SignupForm />
    </Suspense>
  );
}
