import Link from "next/link";
import { routes } from "@/config/routes";
import { MotionReveal } from "@/features/marketing/lib/motion-reveal";

const POINTS = [
  {
    title: "Most tools stay on your device",
    body: "Most PDF tools run entirely in your browser. Your files stay on your device and are not uploaded to our servers for those tools.",
  },
  {
    title: "Translate PDF needs a confirm step",
    body: "Translate PDF extracts text and sends that text to a translation service. You will see a confirm step before that runs.",
  },
  {
    title: "OCR may download language data",
    body: "OCR may download language data to your browser on first use so it can recognise text in scanned pages.",
  },
] as const;

export function HomeFilesSection() {
  return (
    <section className="bg-[#07111F] px-4 py-24 text-[#CBD5E1] sm:px-6">
      <div className="bonsai-container">
        <MotionReveal>
          <h2 className="font-[family-name:var(--font-display)] text-[40px] font-bold leading-tight text-white">
            How your files are handled
          </h2>
          <p className="mt-3 max-w-2xl text-[17px] leading-relaxed text-[#CBD5E1]">
            What happens when you use a PDF tool on this site. Full detail is in
            the{" "}
            <Link
              href={routes.privacy}
              className="font-semibold text-[#5EEAD4] underline-offset-2 hover:underline"
            >
              privacy policy
            </Link>
            .
          </p>
        </MotionReveal>
        <div className="mt-12 grid gap-10 md:grid-cols-3 md:gap-8">
          {POINTS.map((point, index) => (
            <MotionReveal key={point.title} delayMs={index * 60}>
              <div>
                <h3 className="text-lg font-semibold text-white">
                  {point.title}
                </h3>
                <p className="mt-3 text-base leading-relaxed text-[#CBD5E1]">
                  {point.body}
                </p>
              </div>
            </MotionReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
