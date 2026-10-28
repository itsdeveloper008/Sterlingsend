import { ImageResponse } from "next/og";
import { siteConfig } from "@/config/site";
import { getToolBySlug, PDF_TOOLS } from "@/features/pdf-tools";

export const alt = "PDF tool";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return PDF_TOOLS.map((tool) => ({ slug: tool.slug }));
}

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tool = getToolBySlug(slug);
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "64px",
          background: "#ffffff",
          color: "#0f172a",
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
        }}
      >
        <div style={{ fontSize: 28, fontWeight: 700, color: "#0b7480" }}>
          {`${siteConfig.name} · Free PDF tools`}
        </div>
        <div style={{ marginTop: 24, fontSize: 64, fontWeight: 700, lineHeight: 1.1 }}>
          {tool?.title ?? "PDF tools"}
        </div>
        <div style={{ marginTop: 20, fontSize: 28, color: "#64748b", maxWidth: 960 }}>
          {tool?.description ?? "Merge, split, compress and convert in your browser"}
        </div>
      </div>
    ),
    { ...size },
  );
}
