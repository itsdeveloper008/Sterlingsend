import "server-only";

import { Timestamp } from "firebase-admin/firestore";
import { getAdminDb } from "@/firebase/admin";
import { COLLECTIONS } from "@/firebase/collections";
import { docToData, withTimestamps, withUpdatedAt } from "@/lib/firestore-utils";
import type { CreatePaymentInput, Payment, PaymentStatus } from "@/types";
import { PAYMENT_STATUSES } from "@/types";

export class PaymentService {
  private get db() {
    return getAdminDb();
  }

  async getPayment(paymentId: string, businessId: string): Promise<Payment | null> {
    const snap = await this.db.collection(COLLECTIONS.PAYMENTS).doc(paymentId).get();
    const payment = docToData<Payment>(snap.id, snap.data());
    if (!payment || payment.businessId !== businessId) return null;
    return payment;
  }

  async getByInvoiceId(invoiceId: string): Promise<Payment | null> {
    const snap = await this.db
      .collection(COLLECTIONS.PAYMENTS)
      .where("invoiceId", "==", invoiceId)
      .orderBy("createdAt", "desc")
      .limit(1)
      .get();

    if (snap.empty) return null;
    const doc = snap.docs[0];
    return docToData<Payment>(doc.id, doc.data());
  }

  async getByStripeSessionId(sessionId: string): Promise<Payment | null> {
    const snap = await this.db
      .collection(COLLECTIONS.PAYMENTS)
      .where("stripeSessionId", "==", sessionId)
      .limit(1)
      .get();

    if (snap.empty) return null;
    const doc = snap.docs[0];
    return docToData<Payment>(doc.id, doc.data());
  }

  async getByPaymentIntentId(paymentIntentId: string): Promise<Payment | null> {
    const snap = await this.db
      .collection(COLLECTIONS.PAYMENTS)
      .where("stripePaymentIntentId", "==", paymentIntentId)
      .limit(1)
      .get();

    if (snap.empty) return null;
    const doc = snap.docs[0];
    return docToData<Payment>(doc.id, doc.data());
  }

  async getPayments(businessId: string, limit = 50): Promise<Payment[]> {
    const snap = await this.db
      .collection(COLLECTIONS.PAYMENTS)
      .where("businessId", "==", businessId)
      .orderBy("createdAt", "desc")
      .limit(limit)
      .get();

    return snap.docs.map((doc) => docToData<Payment>(doc.id, doc.data())!);
  }

  async createPayment(input: CreatePaymentInput): Promise<Payment> {
    const ref = this.db.collection(COLLECTIONS.PAYMENTS).doc();
    const payload = withTimestamps({
      ...input,
      webhookEventIds: [],
    });
    await ref.set(payload);
    return { id: ref.id, ...payload } as unknown as Payment;
  }

  async updatePayment(
    paymentId: string,
    updates: Partial<Payment>,
  ): Promise<void> {
    await this.db
      .collection(COLLECTIONS.PAYMENTS)
      .doc(paymentId)
      .update(withUpdatedAt(updates));
  }

  async updatePaymentStatus(
    paymentId: string,
    status: PaymentStatus,
    extra: Partial<Payment> = {},
  ): Promise<void> {
    return this.updatePayment(paymentId, { status, ...extra });
  }

  async appendWebhookEventId(paymentId: string, eventId: string): Promise<boolean> {
    const ref = this.db.collection(COLLECTIONS.PAYMENTS).doc(paymentId);
    const snap = await ref.get();
    if (!snap.exists) return false;

    const existing = (snap.data()?.webhookEventIds ?? []) as string[];
    if (existing.includes(eventId)) {
      return false;
    }

    await ref.update(
      withUpdatedAt({
        webhookEventIds: [...existing, eventId],
      }),
    );

    return true;
  }

  /** @deprecated Use createPayment */
  async create(input: CreatePaymentInput): Promise<Payment> {
    return this.createPayment(input);
  }
}

export const paymentService = new PaymentService();
