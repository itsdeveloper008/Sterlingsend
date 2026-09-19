import type { NextConfig } from "next";

const firebaseAuthHost = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;

const nextConfig: NextConfig = {
  outputFileTracingRoot: import.meta.dirname,
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
