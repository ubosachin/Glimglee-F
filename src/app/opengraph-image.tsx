import { ImageResponse } from "next/og";

export const alt = "Glimglee — Modern Gifting, Made Personal";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          height: "100%",
          width: "100%",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "60px 80px",
          background: "radial-gradient(circle at 15% 15%, #292524 0%, #0c0a09 100%)",
          color: "#fafaf9",
          fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Glow Accent */}
        <div
          style={{
            position: "absolute",
            top: "-150px",
            right: "-150px",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(225, 29, 72, 0.25) 0%, rgba(225, 29, 72, 0) 70%)",
            filter: "blur(60px)",
          }}
        />

        {/* Top Header / Brand Tag */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "16px",
                background: "linear-gradient(135deg, #e11d48, #fb7185)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 10px 25px -5px rgba(225, 29, 72, 0.4)",
              }}
            >
              <div
                style={{
                  width: "20px",
                  height: "20px",
                  border: "3px solid white",
                  borderRadius: "50%",
                  borderTopColor: "transparent",
                  transform: "rotate(45deg)",
                }}
              />
            </div>
            <span
              style={{
                fontSize: "36px",
                fontWeight: 800,
                letterSpacing: "-0.04em",
                background: "linear-gradient(to right, #ffffff, #fecdd3)",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              Glimglee
            </span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 22px",
              borderRadius: "9999px",
              background: "rgba(255, 255, 255, 0.08)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              fontSize: "16px",
              fontWeight: 600,
              color: "#fda4af",
              letterSpacing: "0.05em",
              textTransform: "uppercase",
            }}
          >
            Hand-Finished in India
          </div>
        </div>

        {/* Center Main Message */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "900px" }}>
          <h1
            style={{
              fontSize: "68px",
              fontWeight: 900,
              lineHeight: 1.1,
              letterSpacing: "-0.03em",
              margin: 0,
              color: "#ffffff",
            }}
          >
            Modern Gifting, <br />
            <span
              style={{
                background: "linear-gradient(135deg, #fb7185 0%, #e11d48 50%, #f43f5e 100%)",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              Made Personal.
            </span>
          </h1>

          <p
            style={{
              fontSize: "24px",
              lineHeight: 1.45,
              color: "#a8a29e",
              margin: 0,
              maxWidth: "780px",
            }}
          >
            Handcrafted luxury hampers, scented soy candles, floating glass keepsakes, and personalized frames crafted with love.
          </p>
        </div>

        {/* Bottom Feature Badges */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "24px",
            paddingTop: "24px",
            borderTop: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "17px", color: "#d6d3d1" }}>
            <span style={{ color: "#fb7185", fontWeight: 900 }}>•</span> Premium Gift Box Packaging
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "17px", color: "#d6d3d1" }}>
            <span style={{ color: "#fb7185", fontWeight: 900 }}>•</span> 100% Happiness Guarantee
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "17px", color: "#d6d3d1" }}>
            <span style={{ color: "#fb7185", fontWeight: 900 }}>•</span> Pan-India Express Delivery
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
