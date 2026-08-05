import { MarketingShell } from "@/features/marketing/components/marketing-shell";
import { FinalCtaSection } from "@/features/marketing/components/sections/final-cta-section";
import { FeatureTabsSection } from "@/features/marketing/components/sections/feature-tabs-section";
import { PillarsSection } from "@/features/marketing/components/sections/pillars-section";
import { WorkSmarterSection } from "@/features/marketing/components/sections/work-smarter-section";
import { FaqSection } from "@/features/marketing/components/sections/faq-section";

export default function FeaturesPage() {
  return (
    <MarketingShell>
      <section className="bonsai-hero border-b border-[#E5E7EB] pb-16 pt-14 sm:pb-20 sm:pt-20">
        <div className="bonsai-container mx-auto max-w-3xl text-center">
          <p className="bonsai-eyebrow">Product</p>
          <h1 className="bonsai-h1 mt-4">
            Everything you need to invoice & get paid
          </h1>
          <p className="bonsai-lead mx-auto mt-5 max-w-2xl">
            Invoicing, PDF tools, and payments, free to use without an account.
            Log in when you want saved clients and invoice history.
          </p>
        </div>
      </section>
      <PillarsSection />
      <FeatureTabsSection />
      <WorkSmarterSection />
      <FaqSection />
      <FinalCtaSection />
    </MarketingShell>
  );
}
