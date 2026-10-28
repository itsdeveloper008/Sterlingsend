import "server-only";

import type { UserRecord } from "firebase-admin/auth";
import { getAdminAuth, getAdminDb } from "@/firebase/admin";
import { COLLECTIONS } from "@/firebase/collections";
import { getAdminEmails } from "@/config/admin";
import { toDate } from "@/lib/firestore-utils";
import type { Business, User } from "@/types";

export type AdminUserRow = {
  uid: string;
  email: string;
  name: string;
  signInMethod: string;
  emailVerified: boolean;
  joinedAt: string | null;
  lastSignInAt: string | null;
  businessName: string;
  businessType: string;
  phone: string;
  businessEmail: string;
  location: string;
  invoiceCount: number;
};

export type AdminOverview = {
  rows: AdminUserRow[];
  totals: {
    users: number;
    withBusiness: number;
    withPhone: number;
    invoices: number;
  };
  byType: { type: string; count: number }[];
};

/** True when the decoded session belongs to a verified admin email. */
export function isAdminSession(session: {
  email?: string;
  email_verified?: boolean;
}): boolean {
  const email = session.email?.trim().toLowerCase();
  return Boolean(
    email && session.email_verified && getAdminEmails().includes(email),
  );
}

async function listAllAuthUsers(): Promise<UserRecord[]> {
  const auth = getAdminAuth();
  const users: UserRecord[] = [];
  let pageToken: string | undefined;
  do {
    const page = await auth.listUsers(1000, pageToken);
    users.push(...page.users);
    pageToken = page.pageToken;
  } while (pageToken);
  return users;
}

const PROVIDER_LABELS: Record<string, string> = {
  "google.com": "Google",
  password: "Email",
};

function isoOrNull(value: string | undefined): string | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

export async function getAdminOverview(): Promise<AdminOverview> {
  const db = getAdminDb();
  const [authUsers, userSnap, businessSnap, invoiceSnap] = await Promise.all([
    listAllAuthUsers(),
    db.collection(COLLECTIONS.USERS).get(),
    db.collection(COLLECTIONS.BUSINESSES).get(),
    db.collection(COLLECTIONS.INVOICES).select("businessId").get(),
  ]);

  const userDocs = new Map(
    userSnap.docs.map((doc) => [doc.id, doc.data() as Partial<User>]),
  );
  const businessesById = new Map<string, Partial<Business>>();
  const businessesByOwner = new Map<string, Partial<Business>>();
  for (const doc of businessSnap.docs) {
    const data = { ...(doc.data() as Partial<Business>), id: doc.id };
    businessesById.set(doc.id, data);
    if (data.ownerId) businessesByOwner.set(data.ownerId, data);
  }
  const invoiceCounts = new Map<string, number>();
  for (const doc of invoiceSnap.docs) {
    const businessId = doc.get("businessId") as string | undefined;
    if (businessId) {
      invoiceCounts.set(businessId, (invoiceCounts.get(businessId) ?? 0) + 1);
    }
  }

  const adminEmails = new Set(getAdminEmails());
  const customers = authUsers.filter(
    (authUser) => !adminEmails.has(authUser.email?.toLowerCase() ?? ""),
  );

  const rows: AdminUserRow[] = customers.map((authUser) => {
    const userDoc = userDocs.get(authUser.uid);
    const business =
      (userDoc?.businessId
        ? businessesById.get(userDoc.businessId)
        : undefined) ?? businessesByOwner.get(authUser.uid);
    const location = [business?.city, business?.postcode]
      .map((part) => part?.trim())
      .filter(Boolean)
      .join(", ");
    const joined =
      isoOrNull(authUser.metadata.creationTime) ??
      (userDoc?.createdAt ? toDate(userDoc.createdAt).toISOString() : null);

    return {
      uid: authUser.uid,
      email: authUser.email ?? userDoc?.email ?? "",
      name: authUser.displayName ?? userDoc?.displayName ?? "",
      signInMethod:
        authUser.providerData
          .map((p) => PROVIDER_LABELS[p.providerId] ?? p.providerId)
          .join(", ") || "Email",
      emailVerified: authUser.emailVerified,
      joinedAt: joined,
      lastSignInAt: isoOrNull(
        authUser.metadata.lastRefreshTime ?? authUser.metadata.lastSignInTime,
      ),
      businessName: business?.businessName ?? "",
      businessType: business?.businessType ?? "",
      phone: business?.phone ?? authUser.phoneNumber ?? "",
      businessEmail: business?.email ?? "",
      location,
      invoiceCount: business?.id ? (invoiceCounts.get(business.id) ?? 0) : 0,
    };
  });

  rows.sort((a, b) => (b.joinedAt ?? "").localeCompare(a.joinedAt ?? ""));

  const typeCounts = new Map<string, number>();
  for (const row of rows) {
    const key = row.businessType || "Not set";
    typeCounts.set(key, (typeCounts.get(key) ?? 0) + 1);
  }

  return {
    rows,
    totals: {
      users: rows.length,
      withBusiness: rows.filter((r) => r.businessName).length,
      withPhone: rows.filter((r) => r.phone).length,
      invoices: invoiceSnap.size,
    },
    byType: [...typeCounts.entries()]
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count),
  };
}
