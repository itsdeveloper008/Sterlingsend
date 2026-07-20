export type StripeMode = "test" | "live";

export interface StripeKeyConfig {
  mode: StripeMode;
  publishableKey?: string;
  secretKey?: string;
  webhookSecret?: string;
  accountId?: string;
  enforceTestMode: boolean;
}

function modeFromSecretKey(key: string): StripeMode | null {
  if (key.startsWith("sk_test_")) return "test";
  if (key.startsWith("sk_live_")) return "live";
  return null;
}

function modeFromPublishableKey(key: string): StripeMode | null {
  if (key.startsWith("pk_test_")) return "test";
  if (key.startsWith("pk_live_")) return "live";
  return null;
}

export function isStripeEnforceTestMode() {
  const value = process.env.STRIPE_ENFORCE_TEST_MODE;
  if (value === undefined || value === "") {
    return true;
  }
  return value !== "false";
}

export function getStripeKeyConfig(): StripeKeyConfig {
  return {
    mode: getStripeMode(),
    publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    secretKey: process.env.STRIPE_SECRET_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    accountId: process.env.STRIPE_ACCOUNT_ID,
    enforceTestMode: isStripeEnforceTestMode(),
  };
}

export function getStripeMode(): StripeMode {
  const secretKey = process.env.STRIPE_SECRET_KEY ?? "";
  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "";

  const secretMode = secretKey ? modeFromSecretKey(secretKey) : null;
  const publishableMode = publishableKey
    ? modeFromPublishableKey(publishableKey)
    : null;

  if (secretMode) return secretMode;
  if (publishableMode) return publishableMode;
  return "test";
}

export function isStripeTestMode() {
  return getStripeMode() === "test";
}

export function isStripeLiveMode() {
  return getStripeMode() === "live";
}

export function validateStripeKeys(options?: { requireWebhook?: boolean }) {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const enforceTestMode = isStripeEnforceTestMode();

  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY is not configured");
  }

  const secretMode = modeFromSecretKey(secretKey);
  if (!secretMode) {
    throw new Error(
      "STRIPE_SECRET_KEY must start with sk_test_ or sk_live_",
    );
  }

  if (publishableKey) {
    const publishableMode = modeFromPublishableKey(publishableKey);
    if (!publishableMode) {
      throw new Error(
        "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY must start with pk_test_ or pk_live_",
      );
    }

    if (publishableMode !== secretMode) {
      throw new Error(
        "Stripe key mismatch: publishable and secret keys must use the same mode (test or live)",
      );
    }
  }

  if (enforceTestMode && secretMode === "live") {
    throw new Error(
      "Live Stripe keys are disabled. Use sk_test_ and pk_test_ keys, or set STRIPE_ENFORCE_TEST_MODE=false when ready for production.",
    );
  }

  if (options?.requireWebhook && !webhookSecret) {
    throw new Error("STRIPE_WEBHOOK_SECRET is not configured");
  }

  return {
    mode: secretMode,
    enforceTestMode,
  };
}
