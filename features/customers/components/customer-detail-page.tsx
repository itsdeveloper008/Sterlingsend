"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail, MapPin, Phone, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DeleteCustomerModal } from "@/features/customers/components/delete-customer-modal";
import { deleteCustomerAction } from "@/actions/customer.actions";
import {
  formatCustomerAddress,
  formatCustomerDate,
  type SerializedCustomer,
} from "@/features/customers/lib/format";
import { routes } from "@/config/routes";

export function CustomerDetailPage({
  customer,
}: {
  customer: SerializedCustomer;
}) {
  const router = useRouter();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    const result = await deleteCustomerAction(customer.id);
    setDeleting(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success("Customer deleted");
    router.push(routes.customers);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <Link
            href={routes.customers}
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to customers
          </Link>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {customer.name}
            </h1>
            <p className="text-sm text-muted-foreground">
              {customer.companyName || "No company name"}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <ButtonLink href={routes.customerEdit(customer.id)} variant="outline">
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </ButtonLink>
          <Button variant="destructive" onClick={() => setDeleteOpen(true)}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Customer information</CardTitle>
            <CardDescription>Primary contact details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{customer.email}</span>
            </div>
            {customer.phone ? (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{customer.phone}</span>
              </div>
            ) : (
              <p className="text-muted-foreground">No phone number</p>
            )}
            {customer.vatNumber ? (
              <p>
                <span className="text-muted-foreground">VAT:</span>{" "}
                {customer.vatNumber}
              </p>
            ) : null}
            <p className="text-muted-foreground">
              Added {formatCustomerDate(customer.createdAt)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Address information</CardTitle>
            <CardDescription>Billing address on invoices</CardDescription>
          </CardHeader>
          <CardContent className="text-sm">
            <div className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
              <span>{formatCustomerAddress(customer)}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {customer.notes || "No notes added for this customer."}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Invoices</CardTitle>
            <CardDescription>Coming in Epic 5</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">0</p>
            <p className="text-sm text-muted-foreground">Total invoices</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue</CardTitle>
            <CardDescription>Coming in Epic 5</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">£0.00</p>
            <p className="text-sm text-muted-foreground">Lifetime revenue</p>
          </CardContent>
        </Card>
      </div>

      <DeleteCustomerModal
        customer={customer}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  );
}
