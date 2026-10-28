import type { Metadata } from "next";
import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";
import { AppProviders } from "@/providers/app-providers";
import { siteConfig } from "@/config/site";
import { JsonLd } from "@/components/seo/json-ld";
import "./globals.css";

/**
 * UI body. Variable file (no static weight list). Not preloaded — marketing LCP
 * is Fraunces display text; Jakarta swaps in with matched fallback metrics.
 */
const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  display: "swap",
  style: ["normal"],
  preload: false,
  adjustFontFallback: true,
});

/** Display headings (LCP on marketing): opsz axis; preload this face only. */
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "optional",
  style: ["normal"],
  axes: ["opsz"],
  preload: true,
  adjustFontFallback: true,
});

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  metadataBase: new URL(siteConfig.canonicalUrl),
  applicationName: siteConfig.name,
  keywords: [
    "invoice generator",
    "free invoice maker UK",
    "VAT invoice template",
    "invoice PDF",
    "PDF tools",
    "merge PDF",
    "compress PDF",
    "PDF converter",
  ],
  authors: [{ name: siteConfig.name, url: siteConfig.canonicalUrl }],
  creator: siteConfig.name,
  publisher: siteConfig.name,
  formatDetection: { telephone: false, email: false, address: false },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    siteName: siteConfig.name,
    locale: "en_GB",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
  icons: {
    icon: [
      { url: "/brand/icon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/brand/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/brand/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/brand/apple-touch-icon.png", sizes: "180x180" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang={siteConfig.locale}
      className={`${plusJakarta.variable} ${fraunces.variable} h-full antialiased`}
      style={{ colorScheme: "light" }}
    >
      <body
        className="min-h-full font-sans"
        style={
          {
            colorScheme: "light",
            ["--font-sans" as string]: "var(--font-plus-jakarta)",
            ["--font-display" as string]: "var(--font-fraunces)",
          } as React.CSSProperties
        }
      >
        <JsonLd
          data={[
            {
              "@context": "https://schema.org",
              "@type": "Organization",
              name: siteConfig.name,
              url: siteConfig.canonicalUrl,
              logo: `${siteConfig.canonicalUrl}/brand/icon-512.png`,
              email: siteConfig.supportEmail,
              areaServed: "GB",
            },
            {
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: siteConfig.name,
              url: siteConfig.canonicalUrl,
              inLanguage: "en-GB",
            },
          ]}
        />
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
