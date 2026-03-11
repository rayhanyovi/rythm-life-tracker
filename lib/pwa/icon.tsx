import { ImageResponse } from "next/og";

type RythmIconOptions = {
  size: number;
  dark?: boolean;
};

export function createRythmIcon({
  size,
  dark = false,
}: RythmIconOptions) {
  const background = dark ? "#111111" : "#fafafa";
  const foreground = dark ? "#fafafa" : "#111111";
  const accent = dark ? "#2a2a2a" : "#e7e7e7";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background,
          color: foreground,
          position: "relative",
          overflow: "hidden",
          fontFamily:
            "Geist, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: size * 0.08,
            borderRadius: size * 0.26,
            background: accent,
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: size * 0.16,
            borderRadius: size * 0.22,
            border: `${Math.max(4, size * 0.028)}px solid ${foreground}`,
          }}
        />
        <div
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: size * 0.46,
            height: size * 0.46,
            borderRadius: size * 0.16,
            background: foreground,
            color: background,
            fontSize: size * 0.23,
            fontWeight: 700,
            letterSpacing: `${-size * 0.012}px`,
          }}
        >
          R
        </div>
      </div>
    ),
    {
      width: size,
      height: size,
    },
  );
}
