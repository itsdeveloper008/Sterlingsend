import { DEFAULT_INVOICE_TEMPLATE_ID } from "@/pdf/templates/catalog";

export const TEMPLATE_SESSION_KEY = "ss_template";

export function readSessionTemplateId(): string {
  if (typeof window === "undefined") return DEFAULT_INVOICE_TEMPLATE_ID;
  try {
    const value = sessionStorage.getItem(TEMPLATE_SESSION_KEY);
    return value && value.length > 0 ? value : DEFAULT_INVOICE_TEMPLATE_ID;
  } catch {
    return DEFAULT_INVOICE_TEMPLATE_ID;
  }
}

export function writeSessionTemplateId(templateId: string) {
  try {
    sessionStorage.setItem(TEMPLATE_SESSION_KEY, templateId);
  } catch {
    // ignore
  }
}
