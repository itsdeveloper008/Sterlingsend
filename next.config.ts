import type { NextConfig } from "next";

const firebaseAuthHost = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;

const nextConfig: NextConfig = {
  outputFileTracingRoot: import.meta.dirname,
  async redirects() {
    return [
      // No dashboard / CRM / services — History lives at /invoices
      { source: "/dashboard", destination: "/invoices", permanent: true },
      { source: "/dashboard/:path*", destination: "/invoices", permanent: true },
      { source: "/customers", destination: "/invoices", permanent: true },
      { source: "/customers/:path*", destination: "/invoices", permanent: true },
      { source: "/services", destination: "/invoices", permanent: true },
      { source: "/services/:path*", destination: "/invoices", permanent: true },
      // No Pricing until a paid plan exists
      { source: "/pricing", destination: "/", permanent: true },
      { source: "/pricing/:path*", destination: "/", permanent: true },
      // Templates gallery ships in Phase 3
      { source: "/templates", destination: "/create-invoice", permanent: false },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
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

export default nextConfig;
