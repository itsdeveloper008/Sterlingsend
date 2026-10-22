import { permanentRedirect } from "next/navigation";
import { routes } from "@/config/routes";

/** 308: settings hub moved to Account. */
export default function SettingsRedirectPage() {
  permanentRedirect(routes.account);
}
