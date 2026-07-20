"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";

export function GuestInvoiceEditor() {
  return (
    <Card className="border-2 shadow-lg">
      <CardHeader>
        <CardTitle>Create an invoice - no signup required</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Guest mode foundation. Inline editor, PDF export, and local draft
          persistence will be implemented in Epic 3.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border p-3 text-sm">Business details</div>
          <div className="rounded-lg border p-3 text-sm">Client details</div>
          <div className="rounded-lg border p-3 text-sm sm:col-span-2">
            Line items · {siteConfig.defaultCurrency} · {siteConfig.defaultVatRate}% VAT
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button">Download PDF</Button>
          <Button type="button" variant="outline">
            Print
          </Button>
          <Button type="button" variant="secondary">
            Sign up to save
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
