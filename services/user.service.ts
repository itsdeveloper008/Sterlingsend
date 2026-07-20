import "server-only";

import { getAdminDb } from "@/firebase/admin";
import { COLLECTIONS } from "@/firebase/collections";
import { docToData, withTimestamps, withUpdatedAt } from "@/lib/firestore-utils";
import type { CreateUserInput, UpdateUserInput, User } from "@/types";

export class UserService {
  private get db() {
    return getAdminDb();
  }

  async getById(userId: string): Promise<User | null> {
    const snap = await this.db.collection(COLLECTIONS.USERS).doc(userId).get();
    return docToData<User>(snap.id, snap.data());
  }

  async create(input: CreateUserInput): Promise<User> {
    const payload = withTimestamps({
      email: input.email,
      displayName: input.displayName ?? "",
      businessId: undefined,
    });

    await this.db.collection(COLLECTIONS.USERS).doc(input.id).set(payload);
    return { id: input.id, ...payload } as User;
  }

  async update(userId: string, input: UpdateUserInput): Promise<void> {
    await this.db
      .collection(COLLECTIONS.USERS)
      .doc(userId)
      .update(withUpdatedAt(input));
  }

  async getByEmail(email: string): Promise<User | null> {
    const snap = await this.db
      .collection(COLLECTIONS.USERS)
      .where("email", "==", email)
      .limit(1)
      .get();

    if (snap.empty) return null;
    const doc = snap.docs[0];
    return docToData<User>(doc.id, doc.data());
  }
}

export const userService = new UserService();
