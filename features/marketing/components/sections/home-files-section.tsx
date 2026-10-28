import Link from "next/link";
import { routes } from "@/config/routes";

const POINTS = [
  {
    where: "Stays on your device",
    title: "Most PDF tools",
    body: "Merge, split, compress, convert, sign and the rest run in your browser. The file is never uploaded to us.",
  },
  {
    where: "Leaves your device, after you confirm",
    title: "Translate PDF",
    body: "Only the extracted text is sent to a translation service, and you confirm before it goes.",
  },
  {
    where: "One-off download",
    title: "OCR PDF",
    body: "The first time you use it, your browser downloads language data so it can read scanned pages.",
  },
] as const;

export function HomeFilesSection() {
  return (
    <section className="ss-section border-y border-[#E7E2D8] bg-[#FAF8F3] px-4 sm:px-6">
      <div className="bonsai-container grid gap-12 md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] md:gap-16">
        <div>
          <h2 className="type-h2 text-[var(--ink)]">Where your files go</h2>
          <p className="mt-6 max-w-sm text-[17px] leading-[1.7] text-[#57534E]">
            Short version: almost nowhere. The full detail is in the{" "}
            <Link
              href={routes.privacy}
              className="font-semibold text-[var(--brand-700)] underline underline-offset-4"
            >
              privacy policy
            </Link>
            .
          </p>
        </div>
        <dl className="divide-y divide-[#E7E2D8] border-y border-[#E7E2D8]">
          {POINTS.map((point) => (
            <div
              key={point.title}
              className="grid gap-2 py-6 sm:grid-cols-[180px_minmax(0,1fr)] sm:gap-8"
            >
              <dt className="text-[15px] font-semibold text-[var(--ink)]">
                {point.title}
              </dt>
              <dd>
                <p className="text-sm font-medium text-[var(--brand-700)]">
                  {point.where}
                </p>
                <p className="mt-1.5 text-[15px] leading-[1.65] text-[#57534E]">
                  {point.body}
                </p>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
