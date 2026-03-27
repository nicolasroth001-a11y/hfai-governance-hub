import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { loadFont } from "@remotion/google-fonts/SpaceGrotesk";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { colors } from "../theme";

const { fontFamily: displayFont } = loadFont("normal", { weights: ["600", "700"], subsets: ["latin"] });
const { fontFamily: bodyFont } = loadInter("normal", { weights: ["400", "500"], subsets: ["latin"] });

const problems = [
  { icon: "⚠️", label: "Bias in outputs", desc: "Discriminatory decisions at scale" },
  { icon: "🔓", label: "Safety bypasses", desc: "Users exploiting model vulnerabilities" },
  { icon: "📋", label: "EU AI Act", desc: "Regulation with real penalties" },
  { icon: "🏛️", label: "No audit trail", desc: "Who decided what, and when?" },
];

export const Scene2Problem = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleIn = spring({ frame, fps, config: { damping: 20, stiffness: 180 } });

  return (
    <AbsoluteFill style={{ justifyContent: "center", padding: "0 140px" }}>
      {/* Title */}
      <div
        style={{
          fontFamily: displayFont,
          fontSize: 56,
          fontWeight: 700,
          color: colors.cream,
          marginBottom: 60,
          opacity: titleIn,
          transform: `translateY(${interpolate(titleIn, [0, 1], [30, 0])}px)`,
        }}
      >
        The <span style={{ color: colors.gold }}>accountability gap</span> is growing
      </div>

      {/* Problem cards */}
      <div style={{ display: "flex", gap: 28 }}>
        {problems.map((p, i) => {
          const cardIn = spring({ frame: frame - 30 - i * 20, fps, config: { damping: 18, stiffness: 160 } });
          const cardY = interpolate(cardIn, [0, 1], [50, 0]);

          return (
            <div
              key={i}
              style={{
                flex: 1,
                background: `linear-gradient(135deg, ${colors.bgCard}, ${colors.bgLight})`,
                borderRadius: 20,
                padding: "40px 32px",
                border: `1px solid ${colors.gold}15`,
                opacity: cardIn,
                transform: `translateY(${cardY}px)`,
              }}
            >
              <div style={{ fontSize: 48, marginBottom: 16 }}>{p.icon}</div>
              <div
                style={{
                  fontFamily: displayFont,
                  fontSize: 24,
                  fontWeight: 600,
                  color: colors.cream,
                  marginBottom: 12,
                }}
              >
                {p.label}
              </div>
              <div
                style={{
                  fontFamily: bodyFont,
                  fontSize: 18,
                  color: colors.creamMuted,
                  lineHeight: 1.5,
                }}
              >
                {p.desc}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom question */}
      {frame > 180 && (
        <div
          style={{
            fontFamily: bodyFont,
            fontSize: 26,
            color: colors.creamMuted,
            marginTop: 50,
            textAlign: "center",
            opacity: interpolate(frame, [180, 210], [0, 1], { extrapolateRight: "clamp" }),
          }}
        >
          You need governance that's <span style={{ color: colors.gold, fontWeight: 500 }}>built into the architecture</span>, not bolted on.
        </div>
      )}
    </AbsoluteFill>
  );
};
