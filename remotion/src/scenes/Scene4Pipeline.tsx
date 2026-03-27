import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { loadFont } from "@remotion/google-fonts/SpaceGrotesk";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { colors } from "../theme";

const { fontFamily: displayFont } = loadFont("normal", { weights: ["600", "700"], subsets: ["latin"] });
const { fontFamily: bodyFont } = loadInter("normal", { weights: ["400", "500"], subsets: ["latin"] });

const steps = [
  {
    num: "01",
    label: "INGEST",
    desc: "AI events flow in via Proxy or REST API",
    color: colors.teal,
    detail: '{ "event": "user_message", "model": "gpt-4" }',
  },
  {
    num: "02",
    label: "EVALUATE",
    desc: "Rules check every interaction automatically",
    color: colors.gold,
    detail: "12 rules evaluated → 3 triggered",
  },
  {
    num: "03",
    label: "DETECT",
    desc: "Violations flagged with severity and context",
    color: colors.red,
    detail: "VIO-2847 • Critical • Content Safety",
  },
  {
    num: "04",
    label: "REVIEW",
    desc: "Humans make the final call — always",
    color: colors.green,
    detail: "Sarah Chen → Confirmed & Escalated",
  },
];

export const Scene4Pipeline = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleIn = spring({ frame, fps, config: { damping: 20, stiffness: 180 } });

  return (
    <AbsoluteFill style={{ padding: "0 100px", justifyContent: "center" }}>
      {/* Title */}
      <div
        style={{
          fontFamily: displayFont,
          fontSize: 48,
          fontWeight: 700,
          color: colors.cream,
          marginBottom: 60,
          textAlign: "center",
          opacity: titleIn,
        }}
      >
        How it works — <span style={{ color: colors.gold }}>in 4 steps</span>
      </div>

      {/* Pipeline */}
      <div style={{ display: "flex", gap: 24, alignItems: "stretch" }}>
        {steps.map((step, i) => {
          const delay = 40 + i * 50;
          const cardIn = spring({ frame: frame - delay, fps, config: { damping: 18, stiffness: 150 } });
          const detailIn = spring({ frame: frame - delay - 40, fps, config: { damping: 20, stiffness: 160 } });

          // Connecting line animation
          const lineWidth = i < 3
            ? interpolate(frame, [delay + 30, delay + 60], [0, 100], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
            : 0;

          return (
            <div key={i} style={{ flex: 1, position: "relative" }}>
              {/* Connecting line */}
              {i < 3 && (
                <div
                  style={{
                    position: "absolute",
                    top: 36,
                    right: -14,
                    width: 26,
                    height: 2,
                    background: step.color,
                    opacity: 0.4,
                    transform: `scaleX(${lineWidth / 100})`,
                    transformOrigin: "left",
                  }}
                />
              )}

              <div
                style={{
                  background: `linear-gradient(180deg, ${colors.bgCard}, ${colors.bg})`,
                  borderRadius: 20,
                  padding: "36px 28px",
                  border: `1px solid ${step.color}25`,
                  borderTop: `3px solid ${step.color}`,
                  opacity: cardIn,
                  transform: `translateY(${interpolate(cardIn, [0, 1], [40, 0])}px)`,
                  height: "100%",
                  display: "flex",
                  flexDirection: "column" as const,
                }}
              >
                {/* Step number */}
                <div
                  style={{
                    fontFamily: displayFont,
                    fontSize: 14,
                    fontWeight: 600,
                    color: step.color,
                    letterSpacing: 3,
                    marginBottom: 12,
                    textTransform: "uppercase" as const,
                  }}
                >
                  STEP {step.num}
                </div>

                {/* Label */}
                <div
                  style={{
                    fontFamily: displayFont,
                    fontSize: 32,
                    fontWeight: 700,
                    color: colors.cream,
                    marginBottom: 12,
                  }}
                >
                  {step.label}
                </div>

                {/* Description */}
                <div
                  style={{
                    fontFamily: bodyFont,
                    fontSize: 17,
                    color: colors.creamMuted,
                    lineHeight: 1.5,
                    marginBottom: 20,
                    flex: 1,
                  }}
                >
                  {step.desc}
                </div>

                {/* Detail line (simulated data) */}
                <div
                  style={{
                    fontFamily: "monospace",
                    fontSize: 13,
                    color: step.color,
                    background: `${step.color}10`,
                    borderRadius: 8,
                    padding: "10px 14px",
                    opacity: detailIn,
                    overflow: "hidden",
                    whiteSpace: "nowrap" as const,
                    textOverflow: "ellipsis" as const,
                  }}
                >
                  {step.detail}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
