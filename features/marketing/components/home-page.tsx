import { HomeHeroSection } from "./sections/home-hero-section";
import { HomePopularToolsSection } from "./sections/home-popular-tools-section";
import { HomeTemplatesSection } from "./sections/home-templates-section";
import { HomeFilesSection } from "./sections/home-files-section";
import { HomeFaqSection } from "./sections/home-faq-section";
import { HomeCtaSection } from "./sections/home-cta-section";

export function HomePage() {
  return (
    <>
      <HomeHeroSection />
      <HomePopularToolsSection />
      <HomeTemplatesSection />
      <HomeFilesSection />
      <HomeFaqSection />
      <HomeCtaSection />
    </>
  );
}
