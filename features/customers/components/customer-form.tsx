"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  defaultCustomerFormValues,
  type CustomerFormData,
} from "@/lib/validations/customer";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-sm text-destructive">{message}</p>;
}

export function CustomerForm({
  initialValues = defaultCustomerFormValues,
  errors = {},
  onSubmit,
  submitLabel,
  loading,
}: {
  initialValues?: CustomerFormData;
  errors?: Record<string, string>;
  onSubmit: (data: CustomerFormData) => void | Promise<void>;
  submitLabel: string;
  loading?: boolean;
}) {
  const [values, setValues] = useState<CustomerFormData>(initialValues);

  function updateField<K extends keyof CustomerFormData>(
    key: K,
    value: CustomerFormData[K],
  ) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSubmit(values);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <section className="space-y-4">
        <div>
          <h2 className="text-sm font-semibold">Customer information</h2>
          <p className="text-sm text-muted-foreground">
            Basic details used on invoices and customer records.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="name">Customer name *</Label>
            <Input
              id="name"
              value={values.name}
              onChange={(e) => updateField("name", e.target.value)}
              placeholder="Jane Smith"
              aria-invalid={Boolean(errors.name)}
              required
            />
            <FieldError message={errors.name} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="companyName">Company name</Label>
            <Input
              id="companyName"
              value={values.companyName}
              onChange={(e) => updateField("companyName", e.target.value)}
              placeholder="Smith Consulting Ltd"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={values.email}
              onChange={(e) => updateField("email", e.target.value)}
              placeholder="jane@example.com"
              aria-invalid={Boolean(errors.email)}
              required
            />
            <FieldError message={errors.email} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={values.phone}
              onChange={(e) => updateField("phone", e.target.value)}
              placeholder="+44 7700 900000"
            />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-sm font-semibold">Address</h2>
          <p className="text-sm text-muted-foreground">
            Optional billing address for invoices.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="addressLine1">Address line 1</Label>
            <Input
              id="addressLine1"
              value={values.addressLine1}
              onChange={(e) => updateField("addressLine1", e.target.value)}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="addressLine2">Address line 2</Label>
            <Input
              id="addressLine2"
              value={values.addressLine2}
              onChange={(e) => updateField("addressLine2", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              value={values.city}
              onChange={(e) => updateField("city", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="postcode">Postcode</Label>
            <Input
              id="postcode"
              value={values.postcode}
              onChange={(e) => updateField("postcode", e.target.value)}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="country">Country</Label>
            <Input
              id="country"
              value={values.country}
              onChange={(e) => updateField("country", e.target.value)}
              aria-invalid={Boolean(errors.country)}
            />
            <FieldError message={errors.country} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="vatNumber">VAT number</Label>
            <Input
              id="vatNumber"
              value={values.vatNumber}
              onChange={(e) => updateField("vatNumber", e.target.value)}
              placeholder="GB123456789"
            />
          </div>
        </div>
      </section>

      <section className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={values.notes}
          onChange={(e) => updateField("notes", e.target.value)}
          placeholder="Payment terms, preferences, or internal notes"
          className="min-h-24"
        />
      </section>

      <div className="flex justify-end">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
