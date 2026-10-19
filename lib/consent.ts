export const CONSENT_KEY = "ss_consent";
export const UTM_SESSION_KEY = "ss_utm";

/** Re-prompt after one year */
export const CONSENT_MAX_AGE_MS = 365 * 24 * 60 * 60 * 1000;

export type ConsentValue = "accepted" | "rejected";

export type ConsentRecord = {
  value: ConsentValue;
  at: string;
};

export type UtmParams = {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
};

const UTM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
] as const;

export function parseConsentRecord(
  raw: string | null,
  nowMs: number = Date.now(),
): ConsentValue | null {
  if (!raw) return null;
  if (raw === "accepted" || raw === "rejected") {
    // Legacy bare string - treat as still valid until rewritten
    return raw;
  }
  try {
    const parsed = JSON.parse(raw) as ConsentRecord;
    if (parsed.value !== "accepted" && parsed.value !== "rejected") return null;
    const at = Date.parse(parsed.at);
    if (!Number.isFinite(at)) return null;
    if (nowMs - at > CONSENT_MAX_AGE_MS) return null;
    return parsed.value;
  } catch {
    return null;
  }
}

export function readConsent(): ConsentValue | null {
  if (typeof window === "undefined") return null;
  try {
    return parseConsentRecord(localStorage.getItem(CONSENT_KEY));
  } catch {
    return null;
  }
}

export function writeConsent(value: ConsentValue, at: Date = new Date()) {
  try {
    const record: ConsentRecord = { value, at: at.toISOString() };
    localStorage.setItem(CONSENT_KEY, JSON.stringify(record));
    window.dispatchEvent(new Event("ss-consent"));
  } catch {
    // ignore
  }
}

export function clearConsent() {
  try {
    localStorage.removeItem(CONSENT_KEY);
    window.dispatchEvent(new Event("ss-consent"));
  } catch {
    // ignore
  }
}

export function captureUtmsFromUrl(search: string): UtmParams {
  let query = search;
  const qIndex = search.indexOf("?");
  if (qIndex >= 0) {
    query = search.slice(qIndex + 1);
  } else if (search.startsWith("/") || search.length === 0) {
    return {};
  }
  const params = new URLSearchParams(query);
  const out: UtmParams = {};
  for (const key of UTM_KEYS) {
    const value = params.get(key);
    if (value) out[key] = value;
  }
  return out;
}

export function persistUtms(utms: UtmParams) {
  if (Object.keys(utms).length === 0) return;
  try {
    sessionStorage.setItem(UTM_SESSION_KEY, JSON.stringify(utms));
  } catch {
    // ignore
  }
}

export function readPersistedUtms(): UtmParams {
  try {
    const raw = sessionStorage.getItem(UTM_SESSION_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as UtmParams;
  } catch {
    return {};
  }
}
