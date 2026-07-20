import "server-only";

import { getAdminDb } from "@/firebase/admin";
import { COLLECTIONS } from "@/firebase/collections";
import { docToData, withTimestamps, withUpdatedAt } from "@/lib/firestore-utils";
import type {
  CreateSavedServiceInput,
  SavedService,
  UpdateSavedServiceInput,
} from "@/types";

export class SavedServiceService {
  private get db() {
    return getAdminDb();
  }

  async listByBusiness(businessId: string): Promise<SavedService[]> {
    const snap = await this.db
      .collection(COLLECTIONS.SAVED_SERVICES)
      .where("businessId", "==", businessId)
      .where("deletedAt", "==", null)
      .orderBy("name")
      .get();

    return snap.docs.map((doc) => docToData<SavedService>(doc.id, doc.data())!);
  }

  async create(input: CreateSavedServiceInput): Promise<SavedService> {
    const ref = this.db.collection(COLLECTIONS.SAVED_SERVICES).doc();
    const payload = withTimestamps({ ...input, deletedAt: null });
    await ref.set(payload);
    return { id: ref.id, ...payload } as SavedService;
  }

  async update(
    serviceId: string,
    input: UpdateSavedServiceInput,
  ): Promise<void> {
    await this.db
      .collection(COLLECTIONS.SAVED_SERVICES)
      .doc(serviceId)
      .update(withUpdatedAt(input));
  }

  async softDelete(serviceId: string): Promise<void> {
    await this.db
      .collection(COLLECTIONS.SAVED_SERVICES)
      .doc(serviceId)
      .update(withUpdatedAt({ deletedAt: new Date() }));
  }
}

export const savedServiceService = new SavedServiceService();
