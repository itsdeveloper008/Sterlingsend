import { Suspense } from "react";
import { SignupForm } from "@/features/auth";

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
