"use client";

import Link from "next/link";
import {
  CheckCircle2,
  Circle,
  Copy,
  Download,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  formatInvoiceCurrency,
  formatInvoiceDate,
  type SerializedInvoice,
} from "@/features/invoices/lib/format";
import {
  getHistoryDisplayStatus,
  historyDisplayLabel,
} from "@/features/invoices/lib/display-status";
import { routes } from "@/config/routes";
import { cn } from "@/lib/utils";

function StatusPill({ invoice }: { invoice: SerializedInvoice }) {
  const status = getHistoryDisplayStatus(invoice);
  return (
    <span
      className={cn(
        "inline-flex rounded-[var(--radius-sm)] px-2 py-0.5 text-xs font-medium",
        status === "paid" && "bg-[var(--brand-tint)] text-[var(--brand-700)]",
        status === "overdue" && "bg-destructive/10 text-destructive",
        status === "unpaid" && "bg-muted text-muted-foreground",
      )}
    >
      {historyDisplayLabel(status)}
    </span>
  );
}

export function InvoiceTable({
  invoices,
  currency,
  onDelete,
  onDuplicate,
  onMarkPaid,
  onMarkUnpaid,
  onDownloadPdf,
  readOnly = false,
}: {
  invoices: SerializedInvoice[];
  currency: string;
  onDelete?: (invoice: SerializedInvoice) => void;
  onDuplicate?: (invoice: SerializedInvoice) => void;
  onMarkPaid?: (invoice: SerializedInvoice) => void;
  onMarkUnpaid?: (invoice: SerializedInvoice) => void;
  onDownloadPdf?: (invoice: SerializedInvoice) => void;
  /** Hide row actions (e.g. dashboard snippets). */
  readOnly?: boolean;
}) {
  return (
    <>
      <div className="hidden md:block overflow-x-auto rounded-[var(--radius-lg)] border border-border-subtle">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Number</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Issue date</TableHead>
              <TableHead>Due date</TableHead>
              <TableHead>Status</TableHead>
              {readOnly ? null : (
                <TableHead className="w-[70px] text-right">Actions</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((invoice) => {
              const display = getHistoryDisplayStatus(invoice);
              return (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">
                    <Link
                      href={`${routes.createInvoice}?edit=${invoice.id}`}
                      className="ss-link-underline"
                    >
                      {invoice.invoiceNumber}
                    </Link>
                  </TableCell>
                  <TableCell>{invoice.clientName || "No client"}</TableCell>
                  <TableCell>
                    {formatInvoiceCurrency(
                      invoice.totals.total,
                      invoice.currency || currency,
                    )}
                  </TableCell>
                  <TableCell>{formatInvoiceDate(invoice.issueDate)}</TableCell>
                  <TableCell>{formatInvoiceDate(invoice.dueDate)}</TableCell>
                  <TableCell>
                    <StatusPill invoice={invoice} />
                  </TableCell>
                  {readOnly ? null : (
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              aria-label={`Actions for ${invoice.invoiceNumber}`}
                            />
                          }
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            className="cursor-pointer"
                            onClick={() => {
                              window.location.href = `${routes.createInvoice}?edit=${invoice.id}`;
                            }}
                          >
                            <Pencil className="mr-2 h-4 w-4" />
                            Open
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="cursor-pointer"
                            onClick={() => onDuplicate?.(invoice)}
                          >
                            <Copy className="mr-2 h-4 w-4" />
                            Duplicate
                          </DropdownMenuItem>
                          {display === "paid" ? (
                            <DropdownMenuItem
                              className="cursor-pointer"
                              onClick={() => onMarkUnpaid?.(invoice)}
                            >
                              <Circle className="mr-2 h-4 w-4" />
                              Mark as unpaid
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              className="cursor-pointer"
                              onClick={() => onMarkPaid?.(invoice)}
                            >
                              <CheckCircle2 className="mr-2 h-4 w-4" />
                              Mark as paid
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            className="cursor-pointer"
                            onClick={() => onDownloadPdf?.(invoice)}
                          >
                            <Download className="mr-2 h-4 w-4" />
                            Download PDF
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="cursor-pointer text-destructive"
                            onClick={() => onDelete?.(invoice)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <div className="grid gap-3 md:hidden">
        {invoices.map((invoice) => {
          const display = getHistoryDisplayStatus(invoice);
          return (
            <div
              key={invoice.id}
              className="rounded-[var(--radius-lg)] border border-border-subtle bg-card p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <Link
                    href={`${routes.createInvoice}?edit=${invoice.id}`}
                    className="font-medium ss-link-underline"
                  >
                    {invoice.invoiceNumber}
                  </Link>
                  <p className="text-sm text-muted-foreground">
                    {invoice.clientName || "No client"}
                  </p>
                </div>
                <StatusPill invoice={invoice} />
              </div>
              <div className="mt-3 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  Due {formatInvoiceDate(invoice.dueDate)}
                </span>
                <span className="font-medium">
                  {formatInvoiceCurrency(
                    invoice.totals.total,
                    invoice.currency || currency,
                  )}
                </span>
              </div>
              {readOnly ? null : (
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      window.location.href = `${routes.createInvoice}?edit=${invoice.id}`;
                    }}
                  >
                    Open
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDuplicate?.(invoice)}
                  >
                    Duplicate
                  </Button>
                  {display === "paid" ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onMarkUnpaid?.(invoice)}
                    >
                      Unpaid
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onMarkPaid?.(invoice)}
                    >
                      Paid
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDownloadPdf?.(invoice)}
                  >
                    PDF
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive"
                    onClick={() => onDelete?.(invoice)}
                  >
                    Delete
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
