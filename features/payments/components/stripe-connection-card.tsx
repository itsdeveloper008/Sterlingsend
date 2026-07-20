import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { StripeConnectionSummary } from "@/features/payments/lib/types";
import { StripeTestModeBanner } from "@/features/payments/components/stripe-test-mode-banner";

export function StripeConnectionCard({
  connection,
}: {
  connection: StripeConnectionSummary;
}) {
  const isTestMode = connection.environment === "test";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Stripe integration</CardTitle>
        <CardDescription>
          Accept card payments through secure Stripe Checkout.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        {isTestMode ? <StripeTestModeBanner /> : null}

        <div className="flex items-center justify-between gap-3">
          <span className="text-muted-foreground">Connection status</span>
          <Badge variant={connection.connected ? "default" : "secondary"}>
            {connection.connected ? "Connected" : "Not configured"}
          </Badge>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-muted-foreground">Environment</span>
          <div className="flex items-center gap-2">
            <span className="font-medium capitalize">{connection.environment}</span>
            {isTestMode ? (
              <Badge
                variant="outline"
                className="border-amber-300 bg-amber-100 text-amber-900"
              >
                Test
              </Badge>
            ) : null}
          </div>
        </div>
        {connection.accountId ? (
          <div className="flex items-center justify-between gap-3">
            <span className="text-muted-foreground">Account ID</span>
            <span className="font-mono text-xs">{connection.accountId}</span>
          </div>
        ) : null}
        {connection.connectedAt ? (
          <div className="flex items-center justify-between gap-3">
            <span className="text-muted-foreground">Connected</span>
            <span>{new Date(connection.connectedAt).toLocaleDateString("en-GB")}</span>
          </div>
        ) : null}
        <p className="rounded-lg border bg-muted/20 p-3 text-muted-foreground">
          Payments use hosted Stripe Checkout. Card details are never collected
          on SterlingSend servers. Configure Stripe API keys via environment variables
          (use <code className="text-xs">pk_test_</code> and{" "}
          <code className="text-xs">sk_test_</code> during development).
        </p>
      </CardContent>
    </Card>
  );
}
