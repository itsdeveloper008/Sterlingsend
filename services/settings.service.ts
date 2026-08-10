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
      branding: {
        ...DEFAULT_SETTINGS.branding,
        ...(snap.data()?.branding ?? {}),
      },
      invoice: {
        ...DEFAULT_SETTINGS.invoice,
        ...(snap.data()?.invoice ?? {}),
      },
      notifications: {
        ...DEFAULT_SETTINGS.notifications,
        ...(snap.data()?.notifications ?? {}),
      },
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
    let payload = input;
    if (input.branding) {
      const current = await this.getByBusinessId(businessId);
      payload = {
        ...input,
        branding: {
          ...current.branding,
          ...input.branding,
        },
      };
    }

    await this.db
      .collection(COLLECTIONS.SETTINGS)
      .doc(businessId)
      .set(withUpdatedAt(payload), { merge: true });
  }
}

export const settingsService = new SettingsService();
