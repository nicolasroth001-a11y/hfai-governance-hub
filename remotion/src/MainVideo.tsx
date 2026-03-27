import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { loadFont } from "@remotion/google-fonts/SpaceGrotesk";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { LaptopFrame } from "./components/LaptopFrame";
import { DashboardScreen } from "./scenes/DashboardScreen";
import { EventArrival } from "./scenes/EventArrival";
import { ViolationDetected } from "./scenes/ViolationDetected";
import { ReviewerAction } from "./scenes/ReviewerAction";
import { AuditTrailScene } from "./scenes/AuditTrailScene";
import { Cursor } from "./components/Cursor";
import { colors } from "./theme";

// Preload fonts
loadFont("normal", { weights: ["400", "500", "600", "700"], subsets: ["latin"] });
loadInter("normal", { weights: ["400", "500"], subsets: ["latin"] });

export const MainVideo = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Laptop entrance animation
  const laptopIn = spring({ frame, fps, config: { damping: 20, stiffness: 80 } });
  const laptopY = interpolate(laptopIn, [0, 1], [120, 0]);
  const laptopScale = interpolate(laptopIn, [0, 1], [0.92, 1]);

  // Subtle floating
  const float = Math.sin(frame * 0.015) * 3;

  // Scene phases (frame ranges)
  // 0-300: Dashboard overview
  // 300-660: Event arrives
  // 660-1020: Violation detected
  // 1020-1440: Reviewer action
  // 1440-1800: Audit trail + close

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse at 50% 40%, ${colors.bgWarm} 0%, ${colors.bgDeep} 70%)`,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {/* Subtle ambient light */}
      <div
        style={{
          position: "absolute",
          width: 1200,
          height: 600,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${colors.gold}06 0%, transparent 70%)`,
          top: "10%",
          left: "20%",
          filter: "blur(80px)",
        }}
      />

      <div
        style={{
          transform: `translateY(${laptopY + float}px) scale(${laptopScale})`,
          width: 1600,
          height: 960,
        }}
      >
        <LaptopFrame>
          {/* All dashboard content renders here */}
          <DashboardScreen frame={frame} />
          {frame >= 300 && <EventArrival frame={frame - 300} />}
          {frame >= 660 && <ViolationDetected frame={frame - 660} />}
          {frame >= 1020 && <ReviewerAction frame={frame - 1020} />}
          {frame >= 1440 && <AuditTrailScene frame={frame - 1440} />}
        </LaptopFrame>

        {/* Animated cursor */}
        <Cursor frame={frame} />
      </div>
    </AbsoluteFill>
  );
};
