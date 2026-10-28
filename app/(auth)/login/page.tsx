import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/features/auth";

export const metadata: Metadata = {
  robots: { index: false, follow: true },
  title: "Log in",
  description:
    "Log in to SterlingSend to keep your invoice history, saved PDF files and business details. Creating invoices and using the PDF tools stays free without one.",
  alternates: { canonical: "/login" },
};

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="text-sm text-muted-foreground">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
