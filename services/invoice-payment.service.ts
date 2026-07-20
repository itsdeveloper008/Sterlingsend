import "server-only";

import { Timestamp } from "firebase-admin/firestore";
import { getAdminDb } from "@/firebase/admin";
import { COLLECTIONS } from "@/firebase/collections";
import { businessService } from "@/services/business.service";
import { customerService } from "@/services/customer.service";
import { docToData, withUpdatedAt } from "@/lib/firestore-utils";
import {
  buildPublicInvoiceUrl,
  generatePublicToken,
} from "@/lib/stripe/utils";
import { formatAddressLines } from "@/pdf/utils/address";
import type { Invoice } from "@/types";
import type { PublicInvoiceView } from "@/types/public-invoice";
import { INVOICE_PAYMENT_STATUSES } from "@/types/public-invoice";
import { INVOICE_STATUSES } from "@/types";

const PAYABLE_STATUSES = new Set<string>([
  INVOICE_STATUSES.SENT,
  INVOICE_STATUSES.VIEWED,
  INVOICE_STATUSES.OVERDUE,
]);

export class InvoicePaymentService {
  private get db() {
    return getAdminDb();
  }

  async ensurePublicLink(
    invoiceId: string,
    businessId: string,
  ): Promise<{ publicToken: string; publicUrl: string }> {
    const invoice = await this.getOwnedInvoice(invoiceId, businessId);
    if (!invoice) {
      throw new Error("Invoice not found");
    }

    if (invoice.publicToken && invoice.publicUrl) {
      return {
        publicToken: invoice.publicToken,
        publicUrl: invoice.publicUrl,
      };
    }

    const publicToken = generatePublicToken();
    const publicUrl = buildPublicInvoiceUrl(publicToken);

    await this.db.collection(COLLECTIONS.INVOICES).doc(invoiceId).update(
      withUpdatedAt({
        publicToken,
        publicUrl,
        paymentEnabled: true,
        paymentLinkUrl: publicUrl,
      }),
    );

    return { publicToken, publicUrl };
  }

  async getInvoiceByPublicToken(publicToken: string): Promise<Invoice | null> {
    const snap = await this.db
      .collection(COLLECTIONS.INVOICES)
      .where("publicToken", "==", publicToken)
      .where("deletedAt", "==", null)
      .limit(1)
      .get();

    if (snap.empty) return null;
    const doc = snap.docs[0];
    return docToData<Invoice>(doc.id, doc.data());
  }

  async buildPublicInvoiceView(publicToken: string): Promise<PublicInvoiceView | null> {
    const invoice = await this.getInvoiceByPublicToken(publicToken);
    if (!invoice) return null;

    const business = await businessService.getById(invoice.businessId);
    if (!business) return null;

    const customer = await customerService.getCustomer(
      invoice.customerId,
      invoice.businessId,
    );

    const canPay =
      invoice.paymentEnabled &&
      PAYABLE_STATUSES.has(invoice.status) &&
      invoice.paymentStatus !== INVOICE_PAYMENT_STATUSES.PAID &&
      invoice.paymentStatus !== INVOICE_PAYMENT_STATUSES.REFUNDED &&
      invoice.status !== INVOICE_STATUSES.CANCELLED &&
      invoice.status !== INVOICE_STATUSES.DRAFT &&
      invoice.status !== INVOICE_STATUSES.PAID;

    return {
      invoiceNumber: invoice.invoiceNumber,
      issueDate: invoice.issueDate,
      dueDate: invoice.dueDate,
      status: invoice.status,
      paymentStatus: invoice.paymentStatus ?? INVOICE_PAYMENT_STATUSES.UNPAID,
      paymentEnabled: invoice.paymentEnabled ?? false,
      currency: invoice.currency,
      items: invoice.items,
      totals: invoice.totals,
      notes: invoice.notes,
      publicToken,
      canPay,
      business: {
        name: business.businessName,
        email: business.email,
        phone: business.phone,
        website: business.website,
        vatNumber: business.vatNumber,
        logoUrl: business.logoUrl,
        bankDetails: business.bankDetails,
        addressLines: formatAddressLines([
          business.addressLine1,
          business.addressLine2,
          business.city,
          business.postcode,
          business.country,
        ]),
      },
      customer: {
        name: customer?.name ?? invoice.clientName,
        email: customer?.email ?? invoice.clientEmail,
        addressLines: formatAddressLines([
          customer?.addressLine1,
          customer?.addressLine2,
          customer?.city,
          customer?.postcode,
          customer?.country,
        ]),
      },
    };
  }

  async recordPublicView(publicToken: string): Promise<void> {
    const invoice = await this.getInvoiceByPublicToken(publicToken);
    if (!invoice) return;

    if (invoice.status !== INVOICE_STATUSES.SENT) {
      return;
    }

    await this.db.collection(COLLECTIONS.INVOICES).doc(invoice.id).update(
      withUpdatedAt({
        status: INVOICE_STATUSES.VIEWED,
        viewedAt: Timestamp.now(),
      }),
    );
  }

  async markPaymentPending(invoiceId: string, businessId: string): Promise<void> {
    await this.db.collection(COLLECTIONS.INVOICES).doc(invoiceId).update(
      withUpdatedAt({
        paymentStatus: INVOICE_PAYMENT_STATUSES.PENDING,
      }),
    );
  }

  async markPaymentSucceeded(
    invoiceId: string,
    businessId: string,
    stripePaymentIntentId: string,
  ): Promise<boolean> {
    const invoice = await this.getOwnedInvoice(invoiceId, businessId);
    if (!invoice) return false;

    if (
      invoice.paymentStatus === INVOICE_PAYMENT_STATUSES.PAID &&
      invoice.status === INVOICE_STATUSES.PAID
    ) {
      return false;
    }

    await this.db.collection(COLLECTIONS.INVOICES).doc(invoiceId).update(
      withUpdatedAt({
        status: INVOICE_STATUSES.PAID,
        paymentStatus: INVOICE_PAYMENT_STATUSES.PAID,
        paidAt: Timestamp.now(),
        stripePaymentIntentId,
      }),
    );

    return true;
  }

  async markPaymentFailed(invoiceId: string, businessId: string): Promise<void> {
    const invoice = await this.getOwnedInvoice(invoiceId, businessId);
    if (!invoice) return;

    if (invoice.paymentStatus === INVOICE_PAYMENT_STATUSES.PAID) {
      return;
    }

    await this.db.collection(COLLECTIONS.INVOICES).doc(invoiceId).update(
      withUpdatedAt({
        paymentStatus: INVOICE_PAYMENT_STATUSES.FAILED,
      }),
    );
  }

  async markPaymentRefunded(invoiceId: string, businessId: string): Promise<void> {
    await this.db.collection(COLLECTIONS.INVOICES).doc(invoiceId).update(
      withUpdatedAt({
        paymentStatus: INVOICE_PAYMENT_STATUSES.REFUNDED,
      }),
    );
  }

  private async getOwnedInvoice(
    invoiceId: string,
    businessId: string,
  ): Promise<Invoice | null> {
    const snap = await this.db
      .collection(COLLECTIONS.INVOICES)
      .doc(invoiceId)
      .get();

    const invoice = docToData<Invoice>(snap.id, snap.data());
    if (!invoice || invoice.businessId !== businessId || invoice.deletedAt) {
      return null;
    }

    return invoice;
  }
}

export const invoicePaymentService = new InvoicePaymentService();
