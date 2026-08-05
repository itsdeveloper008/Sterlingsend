"use client";

import Link from "next/link";
import {
  Copy,
  Eye,
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
import { ButtonLink } from "@/components/ui/button-link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { InvoiceStatusBadge } from "@/components/shared/invoice-status-badge";
import {
  formatInvoiceCurrency,
  formatInvoiceDate,
  type SerializedInvoice,
} from "@/features/invoices/lib/format";
import { routes } from "@/config/routes";
import { DataSurface } from "@/components/design-system";

export function InvoiceTable({
  invoices,
  currency,
  onDelete,
  onDuplicate,
  readOnly = false,
}: {
  invoices: SerializedInvoice[];
  currency: string;
  onDelete?: (invoice: SerializedInvoice) => void;
  onDuplicate?: (invoice: SerializedInvoice) => void;
  /** Hide row actions - used on the dashboard needs-attention / recent list. */
  readOnly?: boolean;
}) {
  return (
    <>
      <div className="hidden md:block">
        <DataSurface>
          <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice number</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Issue date</TableHead>
              <TableHead>Due date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Total</TableHead>
                {readOnly ? null : (
                  <TableHead className="w-[70px] text-right">Actions</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">
                    <Link
                      href={routes.invoice(invoice.id)}
                      className="hover:text-primary"
                    >
                      {invoice.invoiceNumber}
                    </Link>
                  </TableCell>
                  <TableCell>{invoice.clientName}</TableCell>
                  <TableCell>{formatInvoiceDate(invoice.issueDate)}</TableCell>
                  <TableCell>{formatInvoiceDate(invoice.dueDate)}</TableCell>
                  <TableCell>
                    <InvoiceStatusBadge status={invoice.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    {formatInvoiceCurrency(invoice.totals.total, currency)}
                  </TableCell>
                  {readOnly ? null : (
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label="Actions"
                          />
                        }
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          className="cursor-pointer"
                          onClick={() => {
                            window.location.href = routes.invoice(invoice.id);
                          }}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="cursor-pointer"
                          onClick={() => {
                            window.location.href = routes.invoiceEdit(invoice.id);
                          }}
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="cursor-pointer"
                          onClick={() => onDuplicate?.(invoice)}
                        >
                          <Copy className="mr-2 h-4 w-4" />
                          Duplicate
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
              ))}
            </TableBody>
          </Table>
        </DataSurface>
      </div>

      <div className="grid gap-3 md:hidden">
        {invoices.map((invoice) => (
          <div
            key={invoice.id}
            className="valix-surface p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <Link
                  href={routes.invoice(invoice.id)}
                  className="font-medium hover:text-primary"
                >
                  {invoice.invoiceNumber}
                </Link>
                <p className="text-sm text-muted-foreground">
                  {invoice.clientName}
                </p>
              </div>
              <InvoiceStatusBadge status={invoice.status} />
            </div>
            <div className="mt-3 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Due {formatInvoiceDate(invoice.dueDate)}
              </span>
              <span className="font-medium">
                {formatInvoiceCurrency(invoice.totals.total, currency)}
              </span>
            </div>
            {readOnly ? (
              <div className="mt-3">
                <ButtonLink
                  href={routes.invoice(invoice.id)}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  View
                </ButtonLink>
              </div>
            ) : (
            <div className="mt-3 flex gap-2">
              <ButtonLink
                href={routes.invoiceEdit(invoice.id)}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                Edit
              </ButtonLink>
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => onDuplicate?.(invoice)}
              >
                Duplicate
              </Button>
            </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
