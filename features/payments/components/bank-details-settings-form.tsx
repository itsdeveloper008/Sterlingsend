"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { updateBankDetailsAction } from "@/actions/business.actions";
import {
  bankDetailsToFormData,
  type BankDetailsFormData,
} from "@/lib/validations/business";
import type { BankDetails } from "@/types";

export function BankDetailsSettingsForm({
  bankDetails,
}: {
  bankDetails?: BankDetails | null;
}) {
  const [values, setValues] = useState<BankDetailsFormData>(
    bankDetailsToFormData(bankDetails),
  );
  const [isPending, startTransition] = useTransition();

  function patch(field: keyof BankDetailsFormData, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    startTransition(async () => {
      const result = await updateBankDetailsAction(values);

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success("Bank details saved");
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bank details</CardTitle>
        <CardDescription>
          Shown on public invoices and PDF exports when configured.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="accountName">Account name</Label>
            <Input
              id="accountName"
              value={values.accountName ?? ""}
              onChange={(event) => patch("accountName", event.target.value)}
              placeholder="Bright Studio Ltd"
              disabled={isPending}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="bankName">Bank name</Label>
              <Input
                id="bankName"
                value={values.bankName ?? ""}
                onChange={(event) => patch("bankName", event.target.value)}
                placeholder="Global Bank"
                disabled={isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="accountNumber">Account number</Label>
              <Input
                id="accountNumber"
                value={values.accountNumber ?? ""}
                onChange={(event) => patch("accountNumber", event.target.value)}
                placeholder="12345678"
                disabled={isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sortCode">Sort code</Label>
              <Input
                id="sortCode"
                value={values.sortCode ?? ""}
                onChange={(event) => patch("sortCode", event.target.value)}
                placeholder="12-34-56"
                disabled={isPending}
              />
            </div>
          </div>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Saving..." : "Save bank details"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
