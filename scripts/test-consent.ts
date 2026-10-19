/**
 * Lightweight unit checks for consent / UTM helpers.
 * Run: npx tsx scripts/test-consent.ts
 */
import assert from "node:assert/strict";
import {
  CONSENT_MAX_AGE_MS,
  captureUtmsFromUrl,
  parseConsentRecord,
} from "../lib/consent";

function testCaptureUtms() {
  const full = captureUtmsFromUrl(
    "?utm_source=google&utm_medium=cpc&utm_campaign=spring&utm_term=invoice&utm_content=ad1&other=x",
  );
  assert.deepEqual(full, {
    utm_source: "google",
    utm_medium: "cpc",
    utm_campaign: "spring",
    utm_term: "invoice",
    utm_content: "ad1",
  });

  const empty = captureUtmsFromUrl("/path");
  assert.deepEqual(empty, {});

  const partial = captureUtmsFromUrl("utm_source=newsletter");
  assert.deepEqual(partial, { utm_source: "newsletter" });
}

function testParseConsent() {
  assert.equal(parseConsentRecord(null), null);
  assert.equal(parseConsentRecord("accepted"), "accepted");
  assert.equal(parseConsentRecord("rejected"), "rejected");
  assert.equal(parseConsentRecord("garbage"), null);

  const now = Date.parse("2026-09-19T12:00:00.000Z");
  const fresh = JSON.stringify({
    value: "accepted",
    at: "2026-03-19T12:00:00.000Z",
  });
  assert.equal(parseConsentRecord(fresh, now), "accepted");

  const expired = JSON.stringify({
    value: "rejected",
    at: new Date(now - CONSENT_MAX_AGE_MS - 1000).toISOString(),
  });
  assert.equal(parseConsentRecord(expired, now), null);

  const bad = JSON.stringify({ value: "maybe", at: "2026-01-01T00:00:00.000Z" });
  assert.equal(parseConsentRecord(bad, now), null);
}

testCaptureUtms();
testParseConsent();
console.log("test-consent: pass");
