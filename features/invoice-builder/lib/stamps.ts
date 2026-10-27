export type InvoiceStampType =
  | "draft"
  | "paid"
  | "pending"
  | "approved"
  | "declined"
  | "cancelled";

export type InvoiceStampSize = "S" | "M" | "L";

export type InvoiceStamp = {
  type: InvoiceStampType;
  /** Percent of sheet width (0–100). */
  x: number;
  /** Percent of sheet height (0–100). */
  y: number;
  size: InvoiceStampSize;
};

/** Add a stamp type here as a one-line addition. */
export const INVOICE_STAMPS = [
  {
    type: "draft" as const,
    label: "Draft",
    color: "#475569",
    rotation: -10,
    src: "/stamps/draft.svg",
  },
  {
    type: "paid" as const,
    label: "Paid",
    color: "#0B7480",
    rotation: -10,
    src: "/stamps/paid.svg",
  },
  {
    type: "pending" as const,
    label: "Pending",
    color: "#B45309",
    rotation: -8,
    src: "/stamps/pending.svg",
  },
  {
    type: "approved" as const,
    label: "Approved",
    color: "#15803D",
    rotation: -12,
    src: "/stamps/approved.svg",
  },
  {
    type: "declined" as const,
    label: "Declined",
    color: "#B91C1C",
    rotation: -9,
    src: "/stamps/declined.svg",
  },
  {
    type: "cancelled" as const,
    label: "Cancelled",
    color: "#1F2937",
    rotation: -11,
    src: "/stamps/cancelled.svg",
  },
] as const;

export const STAMP_SIZE_PCT: Record<InvoiceStampSize, number> = {
  S: 14,
  M: 20,
  L: 28,
};

export const DEFAULT_STAMP_POSITION = { x: 72, y: 8 } as const;

export function getStampMeta(type: InvoiceStampType) {
  return INVOICE_STAMPS.find((s) => s.type === type)!;
}
