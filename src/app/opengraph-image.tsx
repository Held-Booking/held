import { ImageResponse } from "next/og";
import { BRAND } from "@/lib/constants";

export const alt = `${BRAND.name}. ${BRAND.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#07080a",
          color: "#f3f4f6",
          padding: 72,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            {[0, 1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                style={{
                  width: i === 3 ? 22 : 14,
                  height: i === 3 ? 22 : 14,
                  borderRadius: 999,
                  background: i === 3 ? "#7eb4ff" : "#7a808a",
                }}
              />
            ))}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 92, fontWeight: 800, letterSpacing: -3 }}>
            {BRAND.name}
            <span style={{ color: "#7eb4ff" }}>.</span>
          </div>
          <div style={{ marginTop: 18, fontSize: 36, color: "#c5c8d0" }}>
            {BRAND.tagline}
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}