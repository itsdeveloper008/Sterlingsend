/**
 * Firestore collection names and index documentation.
 *
 * Relationships:
 * - users (1) ── owns ──> (1) businesses via businesses.ownerId
 * - businesses (1) ── has many ──> customers, invoices, savedServices, payments
 * - customers (1) ── optional on ──> invoices via invoices.customerId
 * - invoices (1) ── has many ──> payments via payments.invoiceId
 * - settings doc id === businessId (1:1)
 */
export const COLLECTIONS = {
  USERS: "users",
  BUSINESSES: "businesses",
  CUSTOMERS: "customers",
  INVOICES: "invoices",
  PAYMENTS: "payments",
  SAVED_SERVICES: "savedServices",
  SETTINGS: "settings",
} as const;

export const STORAGE_PATHS = {
  businessLogo: (businessId: string) => `businesses/${businessId}/logo`,
  invoicePdf: (businessId: string, invoiceId: string) =>
    `businesses/${businessId}/invoices/${invoiceId}.pdf`,
} as const;

/**
 * Required composite indexes (create in Firebase Console or firestore.indexes.json):
 *
 * customers:   businessId ASC, name ASC
 * customers:   businessId ASC, deletedAt ASC, updatedAt DESC
 * invoices:    businessId ASC, status ASC, createdAt DESC
 * invoices:    businessId ASC, createdAt DESC
 * invoices:    businessId ASC, dueDate ASC
 * invoices:    businessId ASC, customerId ASC
 * payments:    businessId ASC, createdAt DESC
 * payments:    invoiceId ASC, status ASC
 * savedServices: businessId ASC, name ASC
 * businesses:  ownerId ASC
 */
export const FIRESTORE_INDEXES = [
  {
    collectionGroup: "customers",
    fields: [
      { fieldPath: "businessId", order: "ASCENDING" },
      { fieldPath: "name", order: "ASCENDING" },
    ],
  },
  {
    collectionGroup: "invoices",
    fields: [
      { fieldPath: "businessId", order: "ASCENDING" },
      { fieldPath: "status", order: "ASCENDING" },
      { fieldPath: "createdAt", order: "DESCENDING" },
    ],
  },
  {
    collectionGroup: "invoices",
    fields: [
      { fieldPath: "businessId", order: "ASCENDING" },
      { fieldPath: "createdAt", order: "DESCENDING" },
    ],
  },
  {
    collectionGroup: "savedServices",
    fields: [
      { fieldPath: "businessId", order: "ASCENDING" },
      { fieldPath: "name", order: "ASCENDING" },
    ],
  },
] as const;
