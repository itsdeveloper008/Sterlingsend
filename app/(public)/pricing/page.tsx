import Link from "next/link";
import { Check } from "lucide-react";
import { MarketingShell } from "@/features/marketing/components/marketing-shell";
import { FinalCtaSection } from "@/features/marketing/components/sections/final-cta-section";
import { routes } from "@/config/routes";

const plans = [
  {
    name: "Guest Mode",
    price: "Free",
    blurb: "No account required",
    featured: true,
    features: [
      "Create invoices instantly",
      "Editable Teamcamp-style sheet",
      "Download PDF & print",
      "Autosave draft in browser",
    ],
    cta: "Create free invoice",
    href: routes.createInvoice,
  },
  {
    name: "Account",
    price: "Free",
    blurb: "During Phase 1 launch",
    featured: false,
    features: [
      "Save invoices & customers",
      "Online payments via Stripe",
      "Invoice tracking",
      "Logo branding & bank details",
    ],
    cta: "Create account",
    href: routes.signup,
  },
];

export default function PricingPage() {
  return (
    <MarketingShell>
      <section className="bonsai-hero border-b border-[#E5E7EB] pb-16 pt-14 sm:pb-20 sm:pt-20">
        <div className="bonsai-container mx-auto max-w-3xl text-center">
          <p className="bonsai-eyebrow">Pricing</p>
          <h1 className="bonsai-h1 mt-4">Simple pricing</h1>
          <p className="bonsai-lead mx-auto mt-5 max-w-2xl">
            Start free. Upgrade when you need saved invoices, payments, and
            tracking.
          </p>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="bonsai-container">
          <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2">
            {plans.map((plan) => (
              <article
                key={plan.name}
                className={
                  plan.featured
                    ? "bonsai-price-card bonsai-price-card--featured"
                    : "bonsai-price-card"
                }
              >
                <p className="text-sm font-semibold text-[#0D9488]">{plan.name}</p>
                <p className="mt-4 text-4xl font-bold tracking-tight text-[#111827]">
                  {plan.price}
                </p>
                <p className="mt-2 text-[#6B7280]">{plan.blurb}</p>
                <ul className="mt-8 space-y-3">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-2 text-sm text-[#4B5563]"
                    >
                      <Check
                        className="mt-0.5 h-4 w-4 shrink-0 text-[#0D9488]"
                        aria-hidden
                      />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  href={plan.href}
                  className={
                    plan.featured
                      ? "bonsai-btn-primary mt-8 w-full"
                      : "bonsai-btn-secondary mt-8 w-full"
                  }
                >
                  {plan.cta}
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <FinalCtaSection />
    </MarketingShell>
  );
}
