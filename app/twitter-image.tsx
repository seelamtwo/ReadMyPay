import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt =
  "Read My Pay — pay stubs, tax forms, and bank statements explained in plain English";

export const size = { width: 1200, height: 630 };

export const contentType = "image/png";

/** Matches Open Graph card for consistent Reddit / X / Facebook previews. */
export default function TwitterImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          background: "linear-gradient(145deg, #ecfdf5 0%, #ffffff 55%, #f8fafc 100%)",
          padding: 72,
        }}
      >
        <div
          style={{
            fontSize: 58,
            fontWeight: 700,
            color: "#0f172a",
            letterSpacing: "-0.02em",
            lineHeight: 1.1,
          }}
        >
          Read My Pay
        </div>
        <div
          style={{
            marginTop: 28,
            fontSize: 30,
            fontWeight: 500,
            color: "#334155",
            maxWidth: 920,
            lineHeight: 1.35,
          }}
        >
          Pay stubs, W-2s, 1099s, and bank statements — explained in plain English.
          Privacy-first; your files are not stored on our servers.
        </div>
        <div
          style={{
            marginTop: 40,
            fontSize: 22,
            fontWeight: 600,
            color: "#047857",
          }}
        >
          readmypay.com
        </div>
      </div>
    ),
    { ...size }
  );
}
