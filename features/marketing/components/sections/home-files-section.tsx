"use client";

import Link from "next/link";
import { routes } from "@/config/routes";
import { MotionReveal } from "@/features/marketing/lib/motion-reveal";

export function HomeFilesSection() {
  return (
    <section className="border-b border-border-subtle bg-background py-16 sm:py-20">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 sm:px-6 md:grid-cols-2 md:gap-12">
        <MotionReveal>
          <h2 className="type-h2 text-foreground">How your files are handled</h2>
          <p className="mt-2 text-muted-foreground">
            What happens when you use a PDF tool on this site.
          </p>
        </MotionReveal>
        <MotionReveal delayMs={60}>
          <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
            <p>
              Most PDF tools run entirely in your browser. Your files stay on your
              device and are not uploaded to our servers for those tools.
            </p>
            <p>
              Translate PDF is different: it extracts text and sends that text to a
              translation service. You will see a confirm step before that runs.
            </p>
            <p>
              OCR may download language data to your browser on first use so it can
              recognise text in scanned pages.
            </p>
            <p>
              Full detail is in the{" "}
              <Link
                href={routes.privacy}
                className="ss-link-underline font-medium text-foreground"
              >
                privacy policy
              </Link>
              .
            </p>
          </div>
        </MotionReveal>
      </div>
    </section>
  );
}
