import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Creek's Girls Lacrosse";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background:
            "linear-gradient(135deg, #00a9b7 0%, #6b3fa0 60%, #ff4fa3 100%)",
          color: "white",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 80,
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            fontSize: 28,
            letterSpacing: 6,
            textTransform: "uppercase",
            opacity: 0.85,
          }}
        >
          Welcome to the home of
        </div>
        <div
          style={{
            fontSize: 124,
            fontWeight: 800,
            lineHeight: 1,
            marginTop: 8,
            letterSpacing: -3,
          }}
        >
          Creek&apos;s
        </div>
        <div
          style={{
            fontSize: 64,
            fontWeight: 600,
            marginTop: 6,
            letterSpacing: 4,
            textTransform: "uppercase",
          }}
        >
          Girls Lacrosse
        </div>
      </div>
    ),
    { ...size },
  );
}
