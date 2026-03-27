import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { colors } from "../theme";

export const PersistentBackground = () => {
  const frame = useCurrentFrame();

  const drift1X = interpolate(frame, [0, 1800], [0, 200]);
  const drift1Y = interpolate(frame, [0, 1800], [0, -100]);
  const drift2X = interpolate(frame, [0, 1800], [0, -150]);
  const drift2Y = interpolate(frame, [0, 1800], [0, 80]);

  return (
    <AbsoluteFill>
      {/* Subtle gradient orbs drifting */}
      <div
        style={{
          position: "absolute",
          width: 800,
          height: 800,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${colors.gold}08 0%, transparent 70%)`,
          top: -200 + drift1Y,
          right: -200 + drift1X,
          filter: "blur(80px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${colors.teal}06 0%, transparent 70%)`,
          bottom: -150 + drift2Y,
          left: -100 + drift2X,
          filter: "blur(60px)",
        }}
      />
      {/* Subtle grid pattern */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `linear-gradient(${colors.cream}03 1px, transparent 1px), linear-gradient(90deg, ${colors.cream}03 1px, transparent 1px)`,
          backgroundSize: "80px 80px",
          opacity: interpolate(frame, [0, 60], [0, 0.4], { extrapolateRight: "clamp" }),
        }}
      />
    </AbsoluteFill>
  );
};
