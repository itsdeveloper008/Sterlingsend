import Link from "next/link";
import { routes } from "@/config/routes";
import {
  Building2,
  CreditCard,
  FileText,
  Palette,
  Shield,
} from "lucide-react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PageHeader, PageShell } from "@/components/design-system";

const links = [
  {
    href: routes.settingsBusiness,
    label: "Business",
    description: "Company details and address",
    icon: Building2,
  },
  {
    href: routes.settingsInvoices,
    label: "Invoices",
    description: "Numbering and defaults",
    icon: FileText,
  },
  {
    href: routes.settingsBranding,
    label: "Branding",
    description: "Logo and colours",
    icon: Palette,
  },
  {
    href: routes.settingsPayments,
    label: "Payments",
    description: "Stripe and online payments",
    icon: CreditCard,
  },
  {
    href: routes.settingsSecurity,
    label: "Security",
    description: "Password and account",
    icon: Shield,
  },
];

export default function SettingsPage() {
  return (
    <PageShell>
      <PageHeader
        title="Settings"
        description="Manage your business, invoices, and payments."
      />
      <div className="grid gap-4 sm:grid-cols-2">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <Link key={link.href} href={link.href} className="group block">
              <Card className="h-full transition-colors hover:border-primary/20 hover:bg-muted/20">
                <CardHeader className="flex flex-row items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/8 text-primary transition-colors group-hover:bg-primary/12">
                    <Icon className="h-4 w-4" aria-hidden />
                  </div>
                  <div className="space-y-1">
                    <CardTitle className="text-base">{link.label}</CardTitle>
                    <CardDescription>{link.description}</CardDescription>
                  </div>
                </CardHeader>
              </Card>
            </Link>
          );
        })}
      </div>
    </PageShell>
  );
}
