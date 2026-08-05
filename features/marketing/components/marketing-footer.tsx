import Link from "next/link";
import { siteConfig } from "@/config/site";
import { routes } from "@/config/routes";
import { Logo } from "@/components/design-system/logo";

const toolsLogin = `${routes.login}?redirect=${encodeURIComponent(routes.tools)}`;

const columns = [
  {
    title: "Product",
    links: [
      { href: routes.createInvoice, label: "Create invoice" },
      { href: toolsLogin, label: "PDF Tools" },
      { href: routes.features, label: "Features" },
      { href: routes.pricing, label: "Pricing" },
    ],
  },
  {
    title: "PDF Toolkit",
    links: [
      { href: toolsLogin, label: "Merge & split" },
      { href: toolsLogin, label: "Compress & protect" },
      { href: toolsLogin, label: "Convert images" },
      { href: toolsLogin, label: "Watermark & redact" },
    ],
  },
  {
    title: "Resources",
    links: [
      { href: routes.signup, label: "Sign up" },
      { href: routes.login, label: "Login" },
      { href: routes.features, label: "Help centre" },
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
            <p className="max-w-xs text-sm text-[#6B7280]">
              Invoicing, payments, and a full PDF toolkit, one account for
              service businesses.
            </p>
            <Link href={routes.createInvoice} className="bonsai-btn-primary h-10 text-sm">
              Try SterlingSend for free
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

        <div className="mt-12 flex flex-col gap-3 border-t border-[#E5E7EB] pt-6 text-sm text-[#9CA3AF] sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {siteConfig.name}
          </p>
          <p className="max-w-xl sm:text-right">
            Payments powered by Stripe. SterlingSend is invoicing software - not
            accounting or legal advice.
          </p>
        </div>
      </div>
    </footer>
  );
}
