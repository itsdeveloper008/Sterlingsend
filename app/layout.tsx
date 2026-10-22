import type { Metadata } from "next";
import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";
import { AppProviders } from "@/providers/app-providers";
import { siteConfig } from "@/config/site";
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
      className={`${plusJakarta.variable} ${fraunces.variable} h-full antialiased`}
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
