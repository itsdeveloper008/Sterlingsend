"use client";

import Link from "next/link";
import { MoreHorizontal, Pencil, Eye, Trash2 } from "lucide-react";
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
import { formatCustomerDate } from "@/features/customers/lib/format";
import type { SerializedCustomer } from "@/features/customers/lib/format";
import { routes } from "@/config/routes";
import { DataSurface } from "@/components/design-system";

export function CustomerTable({
  customers,
  onDelete,
}: {
  customers: SerializedCustomer[];
  onDelete: (customer: SerializedCustomer) => void;
}) {
  return (
    <>
      <div className="hidden md:block">
        <DataSurface>
          <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-[70px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell className="font-medium">
                  <Link
                    href={routes.customer(customer.id)}
                    className="hover:text-primary"
                  >
                    {customer.name}
                  </Link>
                </TableCell>
                <TableCell>{customer.companyName || "-"}</TableCell>
                <TableCell>{customer.email}</TableCell>
                <TableCell>{customer.phone || "-"}</TableCell>
                <TableCell>{formatCustomerDate(customer.createdAt)}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button variant="ghost" size="icon-sm" aria-label="Actions" />
                      }
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        className="cursor-pointer"
                        onClick={() => {
                          window.location.href = routes.customer(customer.id);
                        }}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="cursor-pointer"
                        onClick={() => {
                          window.location.href = routes.customerEdit(customer.id);
                        }}
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="cursor-pointer text-destructive"
                        onClick={() => onDelete(customer)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        </DataSurface>
      </div>

      <div className="grid gap-3 md:hidden">
        {customers.map((customer) => (
          <div
            key={customer.id}
            className="valix-surface p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <Link
                  href={routes.customer(customer.id)}
                  className="font-medium hover:text-primary"
                >
                  {customer.name}
                </Link>
                <p className="text-sm text-muted-foreground">
                  {customer.companyName || "No company"}
                </p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button variant="ghost" size="icon-sm" aria-label="Actions" />
                  }
                >
                  <MoreHorizontal className="h-4 w-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => {
                      window.location.href = routes.customerEdit(customer.id);
                    }}
                  >
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="cursor-pointer text-destructive"
                    onClick={() => onDelete(customer)}
                  >
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="mt-3 space-y-1 text-sm text-muted-foreground">
              <p>{customer.email}</p>
              {customer.phone ? <p>{customer.phone}</p> : null}
              <p>Added {formatCustomerDate(customer.createdAt)}</p>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
