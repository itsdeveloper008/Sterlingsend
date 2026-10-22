import Link from "next/link";
import { siteConfig } from "@/config/site";
import { routes } from "@/config/routes";
import { Logo } from "@/components/design-system/logo";

const columns = [
  {
    title: "Product",
    links: [
      { href: routes.createInvoice, label: "Create invoice" },
      { href: routes.templates, label: "Templates" },
      { href: routes.tools, label: "PDF tools" },
    ],
  },
  {
    title: "PDF Toolkit",
    links: [
      { href: routes.tools, label: "All PDF tools" },
      { href: `${routes.tools}#optimize`, label: "Optimize" },
      { href: `${routes.tools}#convert`, label: "Convert" },
      { href: `${routes.tools}#security`, label: "Security" },
    ],
  },
  {
    title: "Account",
    links: [
      { href: routes.signup, label: "Create account" },
      { href: routes.login, label: "Log in" },
      { href: routes.invoices, label: "Invoice history" },
    ],
  },
  {
    title: "Guides",
    links: [
      { href: routes.guideUkInvoice, label: "UK invoice checklist" },
      { href: routes.calcVat, label: "VAT calculator" },
      { href: routes.calcLateInterest, label: "Late payment interest" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: routes.privacy, label: "Privacy Policy" },
      { href: routes.terms, label: "Terms of Service" },
      { href: routes.cookies, label: "Cookies" },
    ],
  },
];

export function MarketingFooter() {
  return (
    <footer className="bonsai-footer">
      <div className="bonsai-container">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_2.5fr]">
          <div className="space-y-4">
            <Logo href={routes.home} size={48} />
            <p className="max-w-xs text-[0.9375rem] leading-relaxed text-[var(--body-text)]">
              Invoicing and a full PDF toolkit, free without login. Create an
              account only when you want to save your data.
            </p>
            <Link
              href={routes.createInvoice}
              className="bonsai-btn-primary bonsai-btn-primary--sm"
            >
              Create an invoice
            </Link>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {columns.map((col) => (
              <div key={col.title}>
                <p className="bonsai-footer-title">{col.title}</p>
                <ul className="space-y-2.5">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <Link href={link.href}>{link.label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="ss-legal-row mt-12 flex flex-col gap-3 border-t border-[var(--border-ui)] pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="ss-legal">
            © {new Date().getFullYear()} {siteConfig.name}
          </p>
          <p className="ss-legal max-w-xl sm:text-right">
            SterlingSend is invoicing software, not accounting or legal advice.
          </p>
        </div>
      </div>
    </footer>
  );
}
