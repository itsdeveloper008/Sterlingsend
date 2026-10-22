import { ImageResponse } from "next/og";
import { siteConfig } from "@/config/site";

export const runtime = "edge";
export const alt = siteConfig.name;
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
          SterlingSend
        </div>
        <div style={{ marginTop: 24, fontSize: 56, fontWeight: 700, lineHeight: 1.15 }}>
          Free invoice maker and PDF tools
        </div>
        <div style={{ marginTop: 20, fontSize: 28, color: "#64748b", maxWidth: 900 }}>
          UK invoices with VAT. Browser PDF tools. No signup required.
        </div>
      </div>
    ),
    { ...size },
  );
}
