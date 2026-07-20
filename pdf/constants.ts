import { INVOICE_STATUSES, type InvoiceStatus } from "@/types";

export const VALIX_BRAND = {
  primary: "#14B8A6",
  primaryHover: "#0D9488",
  text: "#111827",
  muted: "#6B7280",
  border: "#E5E7EB",
  background: "#FFFFFF",
} as const;

export const PDF_STATUS_COLORS: Record<
  InvoiceStatus,
  { background: string; text: string; label: string }
> = {
  [INVOICE_STATUSES.DRAFT]: {
    background: "#F3F4F6",
    text: "#4B5563",
    label: "Draft",
  },
  [INVOICE_STATUSES.SENT]: {
    background: "#DBEAFE",
    text: "#1D4ED8",
    label: "Sent",
  },
  [INVOICE_STATUSES.VIEWED]: {
    background: "#FEF3C7",
    text: "#B45309",
    label: "Viewed",
  },
  [INVOICE_STATUSES.PAID]: {
    background: "#D1FAE5",
    text: "#047857",
    label: "Paid",
  },
  [INVOICE_STATUSES.OVERDUE]: {
    background: "#FEE2E2",
    text: "#B91C1C",
    label: "Overdue",
  },
  [INVOICE_STATUSES.CANCELLED]: {
    background: "#F1F5F9",
    text: "#475569",
    label: "Cancelled",
  },
};

export const PDF_PAGE_WIDTH_PX = 794;
export const PDF_TEMPLATE_NAME = "SterlingSend Classic";
