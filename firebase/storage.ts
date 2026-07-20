"use client";

import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytes,
  deleteObject,
  type FirebaseStorage,
} from "firebase/storage";
import { getFirebaseApp } from "./client";
import { STORAGE_PATHS } from "./collections";

let storage: FirebaseStorage | undefined;

export function getFirebaseStorage(): FirebaseStorage {
  if (!storage) {
    storage = getStorage(getFirebaseApp());
  }
  return storage;
}

export async function uploadBusinessLogo(businessId: string, file: File) {
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "png";
  const path = `${STORAGE_PATHS.businessLogo(businessId)}/logo.${extension}`;
  const storageRef = ref(getFirebaseStorage(), path);
  await uploadBytes(storageRef, file, {
    contentType: file.type,
    cacheControl: "public,max-age=31536000",
  });
  return getDownloadURL(storageRef);
}

export async function deleteBusinessLogo(path: string) {
  const storageRef = ref(getFirebaseStorage(), path);
  await deleteObject(storageRef);
}

export { getDownloadURL, ref, uploadBytes, deleteObject };
