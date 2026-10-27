import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/features/auth";

export const metadata: Metadata = {
  title: "Reset your password",
  description:
    "Forgot your SterlingSend password? Enter the email you signed up with and we will send you a secure link to reset it and get back to your saved invoices.",
  alternates: { canonical: "/forgot-password" },
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
