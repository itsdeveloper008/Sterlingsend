/*
 * Homepage layout modelled on hellobonsai.com:
 * announce → hero → product pills → pillars → social proof →
 * feature showcases (tabs/chips) → testimonials → work smarter →
 * roles → enterprise → final CTA.
 */
import { HeroSection } from "./sections/hero-section";
import { ProductPillsSection } from "./sections/product-pills-section";
import { PillarsSection } from "./sections/pillars-section";
import { SocialProofStrip } from "./sections/social-proof-strip";
import { FeatureTabsSection } from "./sections/feature-tabs-section";
import { TestimonialsSection } from "./sections/testimonials-section";
import { WorkSmarterSection } from "./sections/work-smarter-section";
import { RolesSection } from "./sections/roles-section";
import { EnterpriseSection } from "./sections/enterprise-section";
import { FinalCtaSection } from "./sections/final-cta-section";

export function HomePage() {
  return (
    <>
      <HeroSection />
      <ProductPillsSection />
      <PillarsSection />
      <SocialProofStrip />
      <FeatureTabsSection />
      <TestimonialsSection />
      <WorkSmarterSection />
      <RolesSection />
      <EnterpriseSection />
      <FinalCtaSection />
    </>
  );
}
