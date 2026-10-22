import { permanentRedirect } from "next/navigation";
import { routes } from "@/config/routes";

/** 308 every /settings/* path to /account. */
export default function SettingsSlugRedirectPage() {
  permanentRedirect(routes.account);
}
