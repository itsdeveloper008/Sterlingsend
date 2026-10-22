import { Geist } from "next/font/google";

/** Invoice sheet face — loaded only on the builder, not marketing first paint. */
const invoiceSheetSans = Geist({
  variable: "--font-invoice-sheet",
  subsets: ["latin"],
  display: "swap",
  preload: true,
  adjustFontFallback: true,
});

export default function CreateInvoiceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className={invoiceSheetSans.variable}>{children}</div>;
}
