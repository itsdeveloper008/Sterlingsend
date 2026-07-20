import Link from "next/link";
import { Mail, Phone, Building2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatCustomerAddress, formatCustomerDate } from "@/features/customers/lib/format";
import type { SerializedCustomer } from "@/features/customers/lib/format";
import { routes } from "@/config/routes";

export function CustomerCard({ customer }: { customer: SerializedCustomer }) {
  return (
    <Link href={routes.customer(customer.id)}>
      <Card className="transition-colors hover:border-primary/40 hover:bg-muted/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{customer.name}</CardTitle>
          <CardDescription>
            {customer.companyName || "No company name"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 shrink-0" />
            <span className="truncate">{customer.email}</span>
          </div>
          {customer.phone ? (
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 shrink-0" />
              <span>{customer.phone}</span>
            </div>
          ) : null}
          <div className="flex items-start gap-2">
            <Building2 className="mt-0.5 h-4 w-4 shrink-0" />
            <span className="line-clamp-2">{formatCustomerAddress(customer)}</span>
          </div>
          <p className="text-xs">Added {formatCustomerDate(customer.createdAt)}</p>
        </CardContent>
      </Card>
    </Link>
  );
}
