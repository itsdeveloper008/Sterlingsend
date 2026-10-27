import type { NextConfig } from "next";
import bundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const firebaseAuthHost = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;

const nextConfig: NextConfig = {
  // Hide the Next.js "N" badge so design screenshots stay clean.
  devIndicators: false,
  outputFileTracingRoot: import.meta.dirname,
  webpack: (config, { isServer, webpack }) => {
    // pptxgenjs references node: builtins; strip the scheme and stub them out.
    if (!isServer) {
      config.plugins.push(
        new webpack.NormalModuleReplacementPlugin(/^node:/, (resource: {
          request: string;
        }) => {
          resource.request = resource.request.replace(/^node:/, "");
        }),
      );
      config.resolve = config.resolve ?? {};
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        https: false,
        http: false,
        path: false,
        stream: false,
        crypto: false,
        net: false,
        tls: false,
        child_process: false,
        os: false,
        url: false,
        util: false,
        zlib: false,
      };
    }
    return config;
  },
  async redirects() {
    return [
      // No dashboard / CRM / services - History lives at /invoices
      { source: "/dashboard", destination: "/invoices", permanent: true },
      { source: "/dashboard/:path*", destination: "/invoices", permanent: true },
      { source: "/customers", destination: "/invoices", permanent: true },
      { source: "/customers/:path*", destination: "/invoices", permanent: true },
      { source: "/services", destination: "/invoices", permanent: true },
      { source: "/services/:path*", destination: "/invoices", permanent: true },
      // No Pricing until a paid plan exists
      { source: "/pricing", destination: "/", permanent: true },
      { source: "/pricing/:path*", destination: "/", permanent: true },
      // Features marketing page retired in Phase 2
      { source: "/features", destination: "/", permanent: true },
      { source: "/features/:path*", destination: "/", permanent: true },
    ];
  },
  async headers() {
    return [
      {
        // Skip the proxied /__/auth helpers: COOP there severs the Google popup
        // from the opener, so Firebase reports the sign-in as cancelled.
        source: "/((?!__/auth/).*)",
        headers: [
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin-allow-popups",
          },
        ],
      },
    ];
  },
  async rewrites() {
    // Proxy Firebase auth helpers onto this origin so Google sign-in can use
    // first-party storage (required in Chrome after 3P cookie partitioning).
    // @see https://firebase.google.com/docs/auth/web/redirect-best-practices
    if (!firebaseAuthHost) return [];
    return [
      {
        source: "/__/auth/:path*",
        destination: `https://${firebaseAuthHost}/__/auth/:path*`,
      },
    ];
  },
};

export default withBundleAnalyzer(nextConfig);
