"use client";

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  where,
  type Timestamp,
} from "firebase/firestore";
import { deleteObject, getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { getClientDb } from "./firestore";
import { getFirebaseStorage } from "./storage";
import { COLLECTIONS, STORAGE_PATHS } from "./collections";

/** Must match the size limit in storage.rules. */
export const PDF_HISTORY_MAX_BYTES = 25 * 1024 * 1024;

export type PdfHistoryItem = {
  id: string;
  name: string;
  toolSlug: string;
  toolTitle: string;
  size: number;
  mime: string;
  storagePath: string;
  createdAt: Date | null;
};

function safeFileName(name: string) {
  return name.replace(/[^\w.\- ]+/g, "_").slice(0, 120) || "document.pdf";
}

export async function savePdfToHistory(
  userId: string,
  file: { name: string; bytes: Uint8Array; mime: string },
  tool: { slug: string; title: string },
) {
  if (file.bytes.byteLength > PDF_HISTORY_MAX_BYTES) {
    throw new Error("Files over 25 MB cannot be saved to history.");
  }
  const id = crypto.randomUUID();
  const storagePath = STORAGE_PATHS.pdfHistory(userId, id, safeFileName(file.name));
  const copy = new Uint8Array(file.bytes.byteLength);
  copy.set(file.bytes);
  // Attachment disposition so the download link saves with the real name
  // (a cross-origin <a download> would ignore it).
  const asciiName = safeFileName(file.name).replace(/"/g, "");
  await uploadBytes(ref(getFirebaseStorage(), storagePath), copy, {
    contentType: file.mime,
    contentDisposition: `attachment; filename="${asciiName}"; filename*=UTF-8''${encodeURIComponent(file.name)}`,
  });
  try {
    await addDoc(collection(getClientDb(), COLLECTIONS.PDF_HISTORY), {
      userId,
      name: file.name,
      toolSlug: tool.slug,
      toolTitle: tool.title,
      size: file.bytes.byteLength,
      mime: file.mime,
      storagePath,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    // Do not leave an orphaned file behind when the record fails.
    await deleteObject(ref(getFirebaseStorage(), storagePath)).catch(() => {});
    throw error;
  }
}

export async function listPdfHistory(userId: string, max = 100) {
  const snap = await getDocs(
    query(
      collection(getClientDb(), COLLECTIONS.PDF_HISTORY),
      where("userId", "==", userId),
      orderBy("createdAt", "desc"),
      limit(max),
    ),
  );
  return snap.docs.map((d): PdfHistoryItem => {
    const data = d.data();
    return {
      id: d.id,
      name: String(data.name ?? "document.pdf"),
      toolSlug: String(data.toolSlug ?? ""),
      toolTitle: String(data.toolTitle ?? ""),
      size: Number(data.size ?? 0),
      mime: String(data.mime ?? "application/pdf"),
      storagePath: String(data.storagePath ?? ""),
      createdAt: (data.createdAt as Timestamp | null)?.toDate() ?? null,
    };
  });
}

export function getPdfHistoryUrl(item: PdfHistoryItem) {
  return getDownloadURL(ref(getFirebaseStorage(), item.storagePath));
}

export async function deletePdfHistoryItem(item: PdfHistoryItem) {
  await deleteObject(ref(getFirebaseStorage(), item.storagePath)).catch(
    (error: { code?: string }) => {
      if (error?.code !== "storage/object-not-found") throw error;
    },
  );
  await deleteDoc(doc(getClientDb(), COLLECTIONS.PDF_HISTORY, item.id));
}
