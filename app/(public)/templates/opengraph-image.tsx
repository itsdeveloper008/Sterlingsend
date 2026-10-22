import { ImageResponse } from "next/og";
import { siteConfig } from "@/config/site";

export const runtime = "edge";
export const alt = "Invoice templates";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
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
        <div style={{ fontSize: 28, fontWeight: 700, color: "#0f766e" }}>
          {siteConfig.name}
        </div>
        <div
          style={{
            marginTop: 24,
            fontSize: 56,
            fontWeight: 700,
            lineHeight: 1.15,
          }}
        >
          Invoice templates
        </div>
        <div style={{ marginTop: 20, fontSize: 28, color: "#64748b", maxWidth: 900 }}>
          Layouts and colours for your PDF invoice
        </div>
      </div>
    ),
    { ...size },
  );
}
