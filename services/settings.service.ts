import "server-only";

import { getAdminDb } from "@/firebase/admin";
import { COLLECTIONS } from "@/firebase/collections";
import { docToData, withTimestamps, withUpdatedAt } from "@/lib/firestore-utils";
import { DEFAULT_SETTINGS, type Settings } from "@/types";

export class SettingsService {
  private get db() {
    return getAdminDb();
  }

  async getByBusinessId(businessId: string): Promise<Settings> {
    const snap = await this.db
      .collection(COLLECTIONS.SETTINGS)
      .doc(businessId)
      .get();

    if (!snap.exists) {
      const payload = withTimestamps({
        businessId,
        ...DEFAULT_SETTINGS,
      });
      await this.db.collection(COLLECTIONS.SETTINGS).doc(businessId).set(payload);
      return { id: businessId, ...payload } as Settings;
    }

    return {
      id: businessId,
      ...DEFAULT_SETTINGS,
      ...docToData<Settings>(snap.id, snap.data()),
      stripe: {
        ...DEFAULT_SETTINGS.stripe,
        ...(snap.data()?.stripe ?? {}),
      },
    } as Settings;
  }

  async update(
    businessId: string,
    input: Partial<Omit<Settings, "id" | "businessId" | "createdAt" | "updatedAt">>,
  ): Promise<void> {
    await this.db
      .collection(COLLECTIONS.SETTINGS)
      .doc(businessId)
      .set(withUpdatedAt(input), { merge: true });
  }
}

export const settingsService = new SettingsService();
