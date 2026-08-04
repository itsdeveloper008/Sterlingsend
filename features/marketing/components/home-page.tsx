/*
 * Dual-product homepage:
 * hero (invoice kept) → product switcher → PDF tools promo →
 * invoice pillars → social proof → feature tabs → testimonials → CTA.
 */
import { HeroSection } from "./sections/hero-section";
import { ProductSwitcherSection } from "./sections/product-switcher-section";
import { PdfToolsPromoSection } from "./sections/pdf-tools-promo-section";
import { PillarsSection } from "./sections/pillars-section";
import { SocialProofStrip } from "./sections/social-proof-strip";
import { FeatureTabsSection } from "./sections/feature-tabs-section";
import { TestimonialsSection } from "./sections/testimonials-section";
import { FinalCtaSection } from "./sections/final-cta-section";

export function HomePage() {
  return (
    <>
      <HeroSection />
      <ProductSwitcherSection />
      <PdfToolsPromoSection />
      <PillarsSection />
      <SocialProofStrip />
      <FeatureTabsSection />
      <TestimonialsSection />
      <FinalCtaSection />
    </>
  );
}
