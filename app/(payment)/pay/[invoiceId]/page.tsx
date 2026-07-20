import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function PayInvoicePage({
  params,
}: {
  params: Promise<{ invoiceId: string }>;
}) {
  const { invoiceId } = await params;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pay invoice</CardTitle>
        <CardDescription>Invoice ID: {invoiceId}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Stripe PaymentElement and webhook sync will be implemented in Epic 6.
        </p>
      </CardContent>
    </Card>
  );
}
