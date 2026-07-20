"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  Copy,
  Pencil,
  Send,
  Trash2,
  BadgeCheck,
  Ban,
  Download,
  Eye,
  Printer,
} from "lucide-react";
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
import { DeleteInvoiceModal } from "@/features/invoices/components/delete-invoice-modal";
import { InvoicePaymentSection } from "@/features/payments";
import { InvoiceDocumentView } from "@/features/invoices/components/invoice-document-view";
import {
  deleteInvoiceAction,
  duplicateInvoiceAction,
  updateInvoiceStatusAction,
} from "@/actions/invoice.actions";
import type { SerializedInvoice } from "@/features/invoices/lib/format";
import { routes } from "@/config/routes";
import type { BankDetails } from "@/types";
import { INVOICE_STATUSES } from "@/types";
import { PageDescription, PageShell, PageTitle } from "@/components/design-system";
import "@/features/invoices/styles/invoice-document.css";

export function InvoiceDetailPage({
  invoice,
  currency,
  business,
}: {
  invoice: SerializedInvoice;
  currency: string;
  business: {
    name: string;
    email?: string;
    logoUrl?: string;
    bankDetails?: BankDetails;
  };
}) {
  const router = useRouter();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    const result = await deleteInvoiceAction(invoice.id);
    setDeleting(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success("Invoice deleted");
    router.push(routes.invoices);
    router.refresh();
  }

  async function handleDuplicate() {
    const result = await duplicateInvoiceAction(invoice.id);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    if (!result.data) {
      toast.error("Failed to duplicate invoice");
      return;
    }

    toast.success("Invoice duplicated");
    router.push(routes.invoiceEdit(result.data.id));
    router.refresh();
  }

  async function handleStatusChange(status: typeof invoice.status) {
    setUpdatingStatus(true);
    const result = await updateInvoiceStatusAction(invoice.id, status);
    setUpdatingStatus(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success(`Invoice marked as ${status}`);
    router.refresh();
  }

  const canEdit =
    invoice.status !== INVOICE_STATUSES.PAID &&
    invoice.status !== INVOICE_STATUSES.CANCELLED;

  return (
    <PageShell>
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-4">
          <Link
            href={routes.invoices}
            className="inline-flex items-center text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to invoices
          </Link>
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <PageTitle>{invoice.invoiceNumber}</PageTitle>
              <InvoiceStatusBadge status={invoice.status} />
            </div>
            <PageDescription>{invoice.clientName}</PageDescription>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <ButtonLink href={routes.invoicePdf(invoice.id)} variant="outline">
            <Eye className="mr-2 h-4 w-4" />
            Preview PDF
          </ButtonLink>
          <ButtonLink
            href={`${routes.invoicePdf(invoice.id)}?action=download`}
            variant="outline"
          >
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </ButtonLink>
          <ButtonLink
            href={`${routes.invoicePdf(invoice.id)}?action=print`}
            variant="outline"
          >
            <Printer className="mr-2 h-4 w-4" />
            Print PDF
          </ButtonLink>
          {canEdit ? (
            <ButtonLink href={routes.invoiceEdit(invoice.id)} variant="outline">
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </ButtonLink>
          ) : null}
          <Button variant="outline" onClick={handleDuplicate}>
            <Copy className="mr-2 h-4 w-4" />
            Duplicate
          </Button>
          <Button variant="destructive" onClick={() => setDeleteOpen(true)}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <InvoiceDocumentView
          data={{
            invoiceNumber: invoice.invoiceNumber,
            issueDate: invoice.issueDate,
            dueDate: invoice.dueDate,
            status: invoice.status,
            currency,
            items: invoice.items,
            totals: invoice.totals,
            notes: invoice.notes,
            business: {
              name: business.name,
              email: business.email,
              logoUrl: business.logoUrl,
              bankDetails: business.bankDetails,
            },
            customer: {
              name: invoice.clientName,
              email: invoice.clientEmail,
            },
          }}
        />

        <div className="space-y-4">
          <InvoicePaymentSection
            invoice={invoice}
            onUpdated={() => router.refresh()}
          />

          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
              <CardDescription>Update invoice status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                className="w-full justify-start"
                variant="outline"
                disabled={updatingStatus || invoice.status !== INVOICE_STATUSES.DRAFT}
                onClick={() => handleStatusChange(INVOICE_STATUSES.SENT)}
              >
                <Send className="mr-2 h-4 w-4" />
                Mark sent
              </Button>
              <Button
                className="w-full justify-start"
                variant="outline"
                disabled={
                  updatingStatus ||
                  invoice.status === INVOICE_STATUSES.PAID ||
                  invoice.status === INVOICE_STATUSES.CANCELLED
                }
                onClick={() => handleStatusChange(INVOICE_STATUSES.PAID)}
              >
                <BadgeCheck className="mr-2 h-4 w-4" />
                Mark paid
              </Button>
              <Button
                className="w-full justify-start"
                variant="outline"
                disabled={
                  updatingStatus || invoice.status === INVOICE_STATUSES.CANCELLED
                }
                onClick={() => handleStatusChange(INVOICE_STATUSES.CANCELLED)}
              >
                <Ban className="mr-2 h-4 w-4" />
                Mark cancelled
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <DeleteInvoiceModal
        invoice={invoice}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={handleDelete}
        loading={deleting}
      />
    </PageShell>
  );
}
