import Image from "next/image";

const AUDIENCES = [
  {
    src: "/marketing/audience-freelancer.jpg",
    alt: "Two people working at laptops in a bright office",
    title: "Freelancers & contractors",
    body: "Send a clean, branded invoice the moment a job is done, with VAT worked out for you.",
  },
  {
    src: "/marketing/audience-team.jpg",
    alt: "A small team chatting around laptops at a café table",
    title: "Small teams",
    body: "Keep numbering, logo and bank details consistent on every invoice your business sends.",
  },
  {
    src: "/marketing/audience-owner.jpg",
    alt: "Smiling business owner standing in an office",
    position: "50% 22%",
    title: "Business owners",
    body: "Save your history, reuse client details and download a polished PDF in seconds.",
  },
] as const;

export function HomeAudienceSection() {
  return (
    <section className="ss-section px-4 sm:px-6">
      <div className="bonsai-container">
        <h2 className="type-h2 mt-6">Made for people who send invoices</h2>
        <p className="ss-measure mt-6 text-[17px] leading-[1.7] text-[var(--secondary-text)]">
          From sole traders to growing UK businesses, SterlingSend keeps
          invoicing quick and professional.
        </p>
        <ul className="mt-12 grid gap-6 md:grid-cols-3">
          {AUDIENCES.map((item) => (
            <li
              key={item.title}
              className="overflow-hidden rounded-[var(--radius-lg)] border border-border-subtle bg-card"
            >
              <div className="relative aspect-[4/3] bg-[var(--brand-tint)]">
                <Image
                  src={item.src}
                  alt={item.alt}
                  fill
                  sizes="(min-width: 768px) 33vw, 100vw"
                  className="object-cover"
                  style={
                    "position" in item
                      ? { objectPosition: item.position }
                      : undefined
                  }
                />
              </div>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-foreground">
                  {item.title}
                </h3>
                <p className="mt-2 text-[15px] leading-[1.7] text-[var(--secondary-text)]">
                  {item.body}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
