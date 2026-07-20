import type { BaseDocument, CurrencyCode } from "./common";

export const PAYMENT_STATUSES = {
  UNPAID: "unpaid",
  PENDING: "pending",
  PAID: "paid",
  FAILED: "failed",
  REFUNDED: "refunded",
} as const;

export type PaymentStatus =
  (typeof PAYMENT_STATUSES)[keyof typeof PAYMENT_STATUSES];

export interface Payment extends BaseDocument {
  businessId: string;
  invoiceId: string;
  stripeSessionId: string;
  stripePaymentIntentId?: string;
  amount: number;
  currency: CurrencyCode;
  status: PaymentStatus;
  customerEmail?: string;
  paidAt?: Date;
  failureMessage?: string;
  refundedAt?: Date;
  webhookEventIds?: string[];
}

export type CreatePaymentInput = Omit<
  Payment,
  "id" | "createdAt" | "updatedAt" | "paidAt" | "refundedAt" | "webhookEventIds"
>;

export interface StripeCheckoutSessionResult {
  sessionId: string;
  url: string;
  paymentId: string;
}
