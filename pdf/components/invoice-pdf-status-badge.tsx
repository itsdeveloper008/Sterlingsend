import { PDF_STATUS_COLORS } from "@/pdf/constants";
import type { InvoiceStatus } from "@/types";

export function InvoicePdfStatusBadge({ status }: { status: InvoiceStatus }) {
  const styles = PDF_STATUS_COLORS[status];

  return (
    <span
      className="invoice-pdf-status-badge"
      style={{
        backgroundColor: styles.background,
        color: styles.text,
      }}
    >
      {styles.label}
    </span>
  );
}
