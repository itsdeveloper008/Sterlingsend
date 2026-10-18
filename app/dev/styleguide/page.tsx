import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { StyleguideClient } from "./styleguide-client";

export const metadata: Metadata = {
  title: "Styleguide (dev)",
  robots: { index: false, follow: false },
};

export default function StyleguidePage() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  return <StyleguideClient />;
}
