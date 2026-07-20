import { PaymentLayout } from "@/components/layouts/payment-layout";

export default function PaymentRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PaymentLayout>{children}</PaymentLayout>;
}
