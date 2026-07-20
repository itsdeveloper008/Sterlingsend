import { routes } from "@/config/routes";

export const marketingAnchors = {
  features: "features",
  guestMode: "guest-mode",
  howItWorks: "how-it-works",
  scope: "scope",
  faq: "faq",
} as const;

export function homeAnchor(id: string) {
  return `${routes.home}#${id}`;
}
