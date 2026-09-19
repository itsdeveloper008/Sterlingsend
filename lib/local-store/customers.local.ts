"use client";

import { createId } from "@/lib/id";
import { LOCAL_BUSINESS_ID, LOCAL_STORE_KEYS } from "@/lib/local-store/keys";
import { readJson, writeJson } from "@/lib/local-store/storage";
import type { CustomerFormData } from "@/lib/validations/customer";
import type { SerializedCustomer } from "@/features/customers/lib/format";

function nowIso() {
  return new Date().toISOString();
}

function loadAll(): SerializedCustomer[] {
  return readJson<SerializedCustomer[]>(LOCAL_STORE_KEYS.customers, []).filter(
    (c) => !c.deletedAt,
  );
}

function saveAll(customers: SerializedCustomer[]) {
  writeJson(LOCAL_STORE_KEYS.customers, customers);
}

export function listLocalCustomers(): SerializedCustomer[] {
  return loadAll().sort((a, b) => a.name.localeCompare(b.name));
}

export function searchLocalCustomers(term: string): SerializedCustomer[] {
  const q = term.trim().toLowerCase();
  if (!q) return listLocalCustomers();
  return listLocalCustomers().filter(
    (c) =>
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      (c.companyName ?? "").toLowerCase().includes(q),
  );
}

export function getLocalCustomer(id: string): SerializedCustomer | null {
  return loadAll().find((c) => c.id === id) ?? null;
}

export function createLocalCustomer(
  data: CustomerFormData,
): SerializedCustomer {
  const stamp = nowIso();
  const customer: SerializedCustomer = {
    id: createId(),
    businessId: LOCAL_BUSINESS_ID,
    name: data.name.trim(),
    companyName: data.companyName?.trim() || undefined,
    email: data.email.trim(),
    phone: data.phone?.trim() || undefined,
    addressLine1: data.addressLine1?.trim() || undefined,
    addressLine2: data.addressLine2?.trim() || undefined,
    city: data.city?.trim() || undefined,
    postcode: data.postcode?.trim() || undefined,
    country: data.country.trim() || "United Kingdom",
    vatNumber: data.vatNumber?.trim() || undefined,
    notes: data.notes?.trim() || undefined,
    nameLower: data.name.trim().toLowerCase(),
    emailLower: data.email.trim().toLowerCase(),
    createdAt: stamp,
    updatedAt: stamp,
    deletedAt: null,
  };

  const all = readJson<SerializedCustomer[]>(LOCAL_STORE_KEYS.customers, []);
  all.unshift(customer);
  saveAll(all);
  return customer;
}

export function updateLocalCustomer(
  id: string,
  data: CustomerFormData,
): SerializedCustomer | null {
  const all = readJson<SerializedCustomer[]>(LOCAL_STORE_KEYS.customers, []);
  const index = all.findIndex((c) => c.id === id && !c.deletedAt);
  if (index < 0) return null;

  const updated: SerializedCustomer = {
    ...all[index],
    name: data.name.trim(),
    companyName: data.companyName?.trim() || undefined,
    email: data.email.trim(),
    phone: data.phone?.trim() || undefined,
    addressLine1: data.addressLine1?.trim() || undefined,
    addressLine2: data.addressLine2?.trim() || undefined,
    city: data.city?.trim() || undefined,
    postcode: data.postcode?.trim() || undefined,
    country: data.country.trim() || "United Kingdom",
    vatNumber: data.vatNumber?.trim() || undefined,
    notes: data.notes?.trim() || undefined,
    nameLower: data.name.trim().toLowerCase(),
    emailLower: data.email.trim().toLowerCase(),
    updatedAt: nowIso(),
  };
  all[index] = updated;
  saveAll(all);
  return updated;
}

export function deleteLocalCustomer(id: string): boolean {
  const all = readJson<SerializedCustomer[]>(LOCAL_STORE_KEYS.customers, []);
  const index = all.findIndex((c) => c.id === id);
  if (index < 0) return false;
  all[index] = {
    ...all[index],
    deletedAt: nowIso(),
    updatedAt: nowIso(),
  };
  saveAll(all);
  return true;
}

export function peekAllLocalCustomersIncludingDeleted(): SerializedCustomer[] {
  return readJson<SerializedCustomer[]>(LOCAL_STORE_KEYS.customers, []);
}

export function clearLocalCustomers() {
  writeJson(LOCAL_STORE_KEYS.customers, []);
}
