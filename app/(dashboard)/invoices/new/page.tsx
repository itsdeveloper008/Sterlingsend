import { permanentRedirect } from "next/navigation";
import { routes } from "@/config/routes";

export default function NewInvoiceRedirectPage() {
  permanentRedirect(routes.createInvoice);
}
