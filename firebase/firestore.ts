"use client";

import {
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  query,
  where,
  type Firestore,
} from "firebase/firestore";
import { getFirebaseApp } from "./client";
import { COLLECTIONS } from "./collections";

let db: Firestore | undefined;

export function getClientDb(): Firestore {
  if (!db) {
    db = getFirestore(getFirebaseApp());
  }
  return db;
}

export function collectionRef<T = unknown>(name: string) {
  return collection(getClientDb(), name) as ReturnType<typeof collection>;
}

export function documentRef<T = unknown>(name: string, id: string) {
  return doc(getClientDb(), name, id);
}

export { collection, doc, getDoc, getDocs, query, where, getFirestore };

export { COLLECTIONS };
