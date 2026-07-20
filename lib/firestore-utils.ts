import { Timestamp } from "firebase-admin/firestore";

export function toDate(value: unknown): Date {
  if (value instanceof Date) return value;
  if (value instanceof Timestamp) return value.toDate();
  if (typeof value === "string" || typeof value === "number") {
    return new Date(value);
  }
  return new Date();
}

export function serializeTimestamps<T extends Record<string, unknown>>(
  data: T,
): T {
  const result = { ...data };

  for (const [key, value] of Object.entries(result)) {
    if (value instanceof Timestamp) {
      (result as Record<string, unknown>)[key] = value.toDate().toISOString();
    } else if (value && typeof value === "object" && !Array.isArray(value)) {
      (result as Record<string, unknown>)[key] = serializeTimestamps(
        value as Record<string, unknown>,
      );
    }
  }

  return result;
}

export function withTimestamps<T extends object>(data: T) {
  const now = Timestamp.now();
  return {
    ...data,
    createdAt: now,
    updatedAt: now,
  };
}

export function withUpdatedAt<T extends object>(data: T) {
  return {
    ...data,
    updatedAt: Timestamp.now(),
  };
}

export function docToData<T extends { id: string }>(
  id: string,
  data: FirebaseFirestore.DocumentData | undefined,
): T | null {
  if (!data) return null;
  return { id, ...data } as T;
}
