"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Copy, ExternalLink, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { InvoiceStatusBadge } from "@/components/shared/invoice-status-badge";
import {
  ensureInvoicePublicLinkAction,
  markInvoiceSentAction,
} from "@/actions/payment.actions";
import type { SerializedInvoice } from "@/features/invoices/lib/format";
import { routes } from "@/config/routes";
import { INVOICE_STATUSES } from "@/types";

function PaymentStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    unpaid: "bg-muted text-muted-foreground",
    pending: "bg-amber-100 text-amber-800",
    paid: "bg-emerald-100 text-emerald-800",
    failed: "bg-red-100 text-red-800",
    refunded: "bg-slate-100 text-slate-700",
  };

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize ${styles[status] ?? styles.unpaid}`}
    >
      {status}
    </span>
  );
}

export function InvoicePaymentSection({
  invoice,
  onUpdated,
}: {
  invoice: SerializedInvoice;
  onUpdated?: () => void;
}) {
  const [publicUrl, setPublicUrl] = useState(invoice.publicUrl ?? "");
  const [loading, setLoading] = useState(false);

  async function handleCopyLink() {
    setLoading(true);
    const result = publicUrl
      ? { success: true as const, data: { publicUrl } }
      : await ensureInvoicePublicLinkAction(invoice.id);
    setLoading(false);

    if (!result.success || !result.data?.publicUrl) {
      toast.error("error" in result ? result.error : "Failed to get payment link");
      return;
    }

    setPublicUrl(result.data.publicUrl);
    await navigator.clipboard.writeText(result.data.publicUrl);
    toast.success("Payment link copied");
    onUpdated?.();
  }

  async function handleMarkSent() {
    setLoading(true);
    const result = await markInvoiceSentAction(invoice.id);
    setLoading(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }
    if (!result.data) {
      toast.error("Failed to mark invoice as sent");
      return;
    }

    setPublicUrl(result.data.publicUrl);
    toast.success("Invoice marked as sent");
    onUpdated?.();
  }

  const displayUrl = publicUrl || invoice.publicUrl;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment information</CardTitle>
        <CardDescription>
          Share a secure link so customers can view and pay online.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">Payment status</span>
          <PaymentStatusBadge status={invoice.paymentStatus ?? "unpaid"} />
          <InvoiceStatusBadge status={invoice.status} />
        </div>

        {displayUrl ? (
          <div className="rounded-lg border bg-muted/20 p-3 text-sm break-all">
            {displayUrl}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Mark this invoice as sent to generate a customer payment link.
          </p>
        )}

        <div className="flex flex-wrap gap-2">
          {invoice.status === INVOICE_STATUSES.DRAFT ? (
            <Button onClick={handleMarkSent} disabled={loading}>
              <Send className="mr-2 h-4 w-4" />
              Mark as sent
            </Button>
          ) : null}
          <Button variant="outline" onClick={handleCopyLink} disabled={loading}>
            <Copy className="mr-2 h-4 w-4" />
            Copy payment link
          </Button>
          {displayUrl ? (
            <ButtonLink href={displayUrl} variant="outline" target="_blank">
              <ExternalLink className="mr-2 h-4 w-4" />
              Open public page
            </ButtonLink>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
