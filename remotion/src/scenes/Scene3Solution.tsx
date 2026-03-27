import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { loadFont } from "@remotion/google-fonts/SpaceGrotesk";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { colors } from "../theme";

const { fontFamily: displayFont } = loadFont("normal", { weights: ["600", "700"], subsets: ["latin"] });
const { fontFamily: bodyFont } = loadInter("normal", { weights: ["400", "500"], subsets: ["latin"] });

const features = [
  { label: "Real-time monitoring", icon: "📡" },
  { label: "Automated rule evaluation", icon: "🛡️" },
  { label: "Human-in-the-loop review", icon: "👤" },
  { label: "Full audit trail", icon: "📊" },
  { label: "EU AI Act mapping", icon: "🇪🇺" },
];

export const Scene3Solution = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoIn = spring({ frame, fps, config: { damping: 15, stiffness: 150 } });
  const logoScale = interpolate(logoIn, [0, 1], [0.7, 1]);

  const subtitleIn = spring({ frame: frame - 30, fps, config: { damping: 20, stiffness: 180 } });

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      <div style={{ textAlign: "center", maxWidth: 1200 }}>
        {/* HFAI Brand intro */}
        <div
          style={{
            fontFamily: displayFont,
            fontSize: 80,
            fontWeight: 700,
            color: colors.gold,
            opacity: logoIn,
            transform: `scale(${logoScale})`,
            marginBottom: 16,
            letterSpacing: 4,
          }}
        >
          HFAI
        </div>

        <div
          style={{
            fontFamily: displayFont,
            fontSize: 36,
            fontWeight: 600,
            color: colors.cream,
            opacity: subtitleIn,
            transform: `translateY(${interpolate(subtitleIn, [0, 1], [20, 0])}px)`,
            marginBottom: 12,
          }}
        >
          Human-First AI Governance
        </div>

        <div
          style={{
            fontFamily: bodyFont,
            fontSize: 24,
            color: colors.creamMuted,
            opacity: subtitleIn,
            marginBottom: 70,
          }}
        >
          Audit the system, not the person.
        </div>

        {/* Feature pills */}
        <div style={{ display: "flex", gap: 20, justifyContent: "center", flexWrap: "wrap" }}>
          {features.map((f, i) => {
            const pillIn = spring({ frame: frame - 60 - i * 15, fps, config: { damping: 18, stiffness: 160 } });
            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  background: `${colors.bgCard}`,
                  border: `1px solid ${colors.gold}20`,
                  borderRadius: 40,
                  padding: "16px 28px",
                  opacity: pillIn,
                  transform: `translateY(${interpolate(pillIn, [0, 1], [20, 0])}px)`,
                }}
              >
                <span style={{ fontSize: 24 }}>{f.icon}</span>
                <span
                  style={{
                    fontFamily: bodyFont,
                    fontSize: 19,
                    fontWeight: 500,
                    color: colors.cream,
                  }}
                >
                  {f.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
