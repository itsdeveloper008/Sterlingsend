import Link from "next/link";
import { routes } from "@/config/routes";
import { AtmosphereImage } from "@/components/media/atmosphere-image";

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
    <section className="ss-section bg-[var(--dark-band)] px-4 text-[#CBD5E1] sm:px-6">
      <div className="bonsai-container">
        <p className="ss-eyebrow" style={{ color: "#6FD9DD" }}>
          Privacy
        </p>
        <h2 className="type-h2 mt-6 text-white">How your files are handled</h2>
        <p className="ss-measure mt-6 text-[17px] leading-[1.7] text-[#CBD5E1]">
          What happens when you use a PDF tool on this site. Full detail is in
          the{" "}
          <Link
            href={routes.privacy}
            className="font-semibold text-[#6FD9DD] underline-offset-2 hover:underline"
          >
            privacy policy
          </Link>
          .
        </p>
        <div
          className="mt-12 grid items-start gap-10 md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]"
          style={{ gap: "28px" }}
        >
          <ul className="grid gap-8 sm:grid-cols-3 md:grid-cols-1">
            {POINTS.map((point) => (
              <li
                key={point.title}
                className="pt-6"
                style={{ borderTop: "1px solid var(--band-divider)" }}
              >
                <h3 className="text-lg font-semibold text-white">
                  {point.title}
                </h3>
                <p className="mt-4 text-[15px] leading-[1.7] text-[#94A3B8]">
                  {point.body}
                </p>
              </li>
            ))}
          </ul>
          <AtmosphereImage
            file="how-it-works-hands.webp"
            alt="Hands reviewing documents on a desk"
            aspect="3 / 2"
            className="md:mt-6"
          />
        </div>
      </div>
    </section>
  );
}
