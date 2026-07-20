import "server-only";

import { getAdminDb } from "@/firebase/admin";
import { COLLECTIONS } from "@/firebase/collections";
import { docToData, withTimestamps, withUpdatedAt } from "@/lib/firestore-utils";
import type { Business, CreateBusinessInput, UpdateBusinessInput } from "@/types";

export class BusinessService {
  private get db() {
    return getAdminDb();
  }

  async getById(businessId: string): Promise<Business | null> {
    const snap = await this.db
      .collection(COLLECTIONS.BUSINESSES)
      .doc(businessId)
      .get();
    return docToData<Business>(snap.id, snap.data());
  }

  async getByOwnerId(ownerId: string): Promise<Business | null> {
    const snap = await this.db
      .collection(COLLECTIONS.BUSINESSES)
      .where("ownerId", "==", ownerId)
      .limit(1)
      .get();

    if (snap.empty) return null;
    const doc = snap.docs[0];
    return docToData<Business>(doc.id, doc.data());
  }

  async create(input: CreateBusinessInput): Promise<Business> {
    const ref = this.db.collection(COLLECTIONS.BUSINESSES).doc();
    const payload = withTimestamps(input);

    await ref.set(payload);
    return { id: ref.id, ...payload } as Business;
  }

  async update(businessId: string, input: UpdateBusinessInput): Promise<void> {
    await this.db
      .collection(COLLECTIONS.BUSINESSES)
      .doc(businessId)
      .update(withUpdatedAt(input));
  }
}

export const businessService = new BusinessService();
