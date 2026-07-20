export interface StripeConnectionSummary {
  connected: boolean;
  enabled: boolean;
  accountId?: string;
  connectedAt?: string;
  environment: "test" | "live";
}
