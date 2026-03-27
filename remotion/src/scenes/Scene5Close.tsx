import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { loadFont } from "@remotion/google-fonts/SpaceGrotesk";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { colors } from "../theme";

const { fontFamily: displayFont } = loadFont("normal", { weights: ["600", "700"], subsets: ["latin"] });
const { fontFamily: bodyFont } = loadInter("normal", { weights: ["400", "500"], subsets: ["latin"] });

export const Scene5Close = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const mainIn = spring({ frame, fps, config: { damping: 15, stiffness: 120 } });
  const taglineIn = spring({ frame: frame - 30, fps, config: { damping: 20, stiffness: 160 } });
  const urlIn = spring({ frame: frame - 60, fps, config: { damping: 20, stiffness: 180 } });

  // Gentle breathing glow
  const glowPulse = interpolate(
    Math.sin(frame * 0.05),
    [-1, 1],
    [0.3, 0.6]
  );

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      {/* Background glow */}
      <div
        style={{
          position: "absolute",
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${colors.gold}${Math.round(glowPulse * 20).toString(16).padStart(2, "0")} 0%, transparent 70%)`,
          filter: "blur(60px)",
        }}
      />

      <div style={{ textAlign: "center", zIndex: 1 }}>
        {/* Main message */}
        <div
          style={{
            fontFamily: displayFont,
            fontSize: 64,
            fontWeight: 700,
            color: colors.cream,
            opacity: mainIn,
            transform: `scale(${interpolate(mainIn, [0, 1], [0.9, 1])})`,
            marginBottom: 24,
            lineHeight: 1.2,
          }}
        >
          Governance isn't a document.
          <br />
          <span style={{ color: colors.gold }}>It's an architecture.</span>
        </div>

        {/* Tagline */}
        <div
          style={{
            fontFamily: bodyFont,
            fontSize: 28,
            color: colors.creamMuted,
            opacity: taglineIn,
            transform: `translateY(${interpolate(taglineIn, [0, 1], [20, 0])}px)`,
            marginBottom: 50,
          }}
        >
          Start your 14-day pilot. No commitment. Full platform access.
        </div>

        {/* URL/Brand */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 20,
            opacity: urlIn,
            transform: `translateY(${interpolate(urlIn, [0, 1], [15, 0])}px)`,
          }}
        >
          <div
            style={{
              fontFamily: displayFont,
              fontSize: 40,
              fontWeight: 700,
              color: colors.gold,
              letterSpacing: 3,
            }}
          >
            HFAI
          </div>
          <div
            style={{
              width: 2,
              height: 36,
              background: colors.creamMuted,
              opacity: 0.3,
            }}
          />
          <div
            style={{
              fontFamily: bodyFont,
              fontSize: 22,
              color: colors.creamMuted,
            }}
          >
            humanfirstai.com
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
