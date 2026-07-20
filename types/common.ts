import type { Timestamp } from "firebase/firestore";

export type FirestoreTimestamp = Timestamp | Date;

export interface BaseDocument {
  id: string;
  createdAt: FirestoreTimestamp;
  updatedAt: FirestoreTimestamp;
}

export interface SoftDeletable {
  deletedAt?: FirestoreTimestamp | null;
}

export type CurrencyCode = "GBP" | "EUR" | "USD";

export interface Address {
  line1: string;
  line2?: string;
  city: string;
  county?: string;
  postcode: string;
  country: string;
}

export interface BankDetails {
  accountName: string;
  accountNumber: string;
  sortCode: string;
  /** Optional display name of the bank (invoice builder / PDF). */
  bankName?: string;
}
