import type { Metadata } from "next";
import { Fraunces, Geist, Plus_Jakarta_Sans } from "next/font/google";
import { AppProviders } from "@/providers/app-providers";
import { siteConfig } from "@/config/site";
import "./globals.css";

/** UI body: weights actually used in components (regular/medium/semibold/bold). */
const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  display: "swap",
  style: ["normal"],
  weight: ["400", "500", "600", "700"],
  preload: true,
  adjustFontFallback: true,
});

/** Display headings: opsz axis only (no unused italic). */
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
  style: ["normal"],
  axes: ["opsz"],
  preload: true,
  adjustFontFallback: true,
});

/** Invoice sheet only — not preloaded on marketing first paint. */
const invoiceSheetSans = Geist({
  variable: "--font-invoice-sheet",
  subsets: ["latin"],
  display: "swap",
  preload: false,
  adjustFontFallback: true,
});

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  metadataBase: new URL(siteConfig.url),
  applicationName: siteConfig.name,
  icons: {
    icon: [{ url: "/brand/sterlingsend-logo.png", type: "image/png" }],
    apple: [{ url: "/brand/sterlingsend-logo.png", type: "image/png" }],
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
      className={`${plusJakarta.variable} ${fraunces.variable} ${invoiceSheetSans.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('ss_theme');var d=window.matchMedia('(prefers-color-scheme: dark)').matches;var r=t==='dark'||(t!=='light'&&d);if(r)document.documentElement.classList.add('dark');}catch(e){}})();`,
          }}
        />
      </head>
      <body
        className="min-h-full font-sans"
        style={
          {
            ["--font-sans" as string]: "var(--font-plus-jakarta)",
            ["--font-display" as string]: "var(--font-fraunces)",
          } as React.CSSProperties
        }
      >
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
