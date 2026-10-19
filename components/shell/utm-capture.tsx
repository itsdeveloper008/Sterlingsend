"use client";

import { useEffect } from "react";
import {
  captureUtmsFromUrl,
  persistUtms,
  readConsent,
} from "@/lib/consent";

/** Persist landing UTMs after analytics consent. */
export function UtmCapture() {
  useEffect(() => {
    if (readConsent() !== "accepted") return;
    persistUtms(captureUtmsFromUrl(window.location.search));
  }, []);

  return null;
}
