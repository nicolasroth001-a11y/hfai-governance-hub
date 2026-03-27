import React from "react";
import { interpolate, spring } from "remotion";
import { colors } from "../theme";

interface Props {
  frame: number;
}

const triggeredRules = [
  { name: "Content Safety Policy", severity: "critical", match: true },
  { name: "User Manipulation Detection", severity: "high", match: true },
  { name: "Output Transparency", severity: "medium", match: true },
];

export const ViolationDetected: React.FC<Props> = ({ frame }) => {
  const fps = 30;

  // Alert flash
  const flashOpacity = frame < 30
    ? interpolate(Math.sin(frame * 0.8), [-1, 1], [0, 0.15])
    : 0;

  // Violation card entrance
  const cardIn = spring({ frame: frame - 30, fps, config: { damping: 15, stiffness: 140 } });

  // Rule list stagger
  const fadeOut = interpolate(frame, [320, 360], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity: fadeOut }}>
      {/* Red flash overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: colors.red,
          opacity: flashOpacity,
          zIndex: 20,
        }}
      />

      {/* Alert notification */}
      {frame > 15 && (
        <div
          style={{
            position: "absolute",
            top: 60,
            left: "50%",
            transform: `translateX(-50%) translateY(${interpolate(
              spring({ frame: frame - 15, fps, config: { damping: 18, stiffness: 200 } }),
              [0, 1], [-20, 0]
            )}px)`,
            background: colors.redBg,
            border: `1px solid ${colors.red}50`,
            borderRadius: 10,
            padding: "10px 20px",
            display: "flex",
            alignItems: "center",
            gap: 10,
            zIndex: 25,
            boxShadow: `0 8px 30px ${colors.red}20`,
            opacity: spring({ frame: frame - 15, fps, config: { damping: 20, stiffness: 200 } }),
          }}
        >
          <span style={{ fontSize: 18 }}>🚨</span>
          <div style={{ fontSize: 13, fontWeight: 600, color: colors.red }}>
            Critical Violation Detected — VIO-2847
          </div>
        </div>
      )}

      {/* Violation detail card */}
      {frame > 25 && (
        <div
          style={{
            position: "absolute",
            top: 120,
            left: 230,
            right: 30,
            background: colors.uiCard,
            border: `1px solid ${colors.red}30`,
            borderLeft: `3px solid ${colors.red}`,
            borderRadius: 12,
            padding: 24,
            opacity: cardIn,
            transform: `translateY(${interpolate(cardIn, [0, 1], [20, 0])}px)`,
            boxShadow: `0 12px 40px ${colors.bgDeep}90`,
            zIndex: 15,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 10, color: colors.creamDim, fontFamily: "monospace", marginBottom: 4 }}>VIO-2847</div>
              <div style={{ fontSize: 16, fontWeight: 600, color: colors.cream }}>
                AI provided instructions to circumvent safety controls
              </div>
            </div>
            <div
              style={{
                background: colors.redBg,
                border: `1px solid ${colors.red}40`,
                borderRadius: 6,
                padding: "4px 12px",
                fontSize: 11,
                fontWeight: 600,
                color: colors.red,
                textTransform: "uppercase" as const,
                letterSpacing: 1,
              }}
            >
              CRITICAL
            </div>
          </div>

          {/* Triggered rules */}
          <div style={{ fontSize: 12, color: colors.creamDim, marginBottom: 10 }}>Rules Triggered:</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {triggeredRules.map((rule, i) => {
              const ruleIn = spring({ frame: frame - 60 - i * 15, fps, config: { damping: 18, stiffness: 180 } });
              const severityColor = rule.severity === "critical" ? colors.red : rule.severity === "high" ? colors.yellow : colors.gold;
              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    background: colors.uiBg,
                    borderRadius: 8,
                    padding: "10px 14px",
                    border: `1px solid ${colors.uiBorder}`,
                    opacity: ruleIn,
                    transform: `translateX(${interpolate(ruleIn, [0, 1], [-15, 0])}px)`,
                  }}
                >
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: severityColor }} />
                  <div style={{ flex: 1, fontSize: 12, color: colors.cream }}>{rule.name}</div>
                  <div
                    style={{
                      fontSize: 9,
                      fontWeight: 600,
                      textTransform: "uppercase" as const,
                      letterSpacing: 1,
                      color: severityColor,
                      padding: "2px 8px",
                      borderRadius: 4,
                      background: `${severityColor}15`,
                    }}
                  >
                    {rule.severity}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Source info */}
          <div
            style={{
              display: "flex",
              gap: 20,
              marginTop: 16,
              fontSize: 11,
              color: colors.creamDim,
              opacity: interpolate(frame, [120, 140], [0, 1], { extrapolateRight: "clamp" }),
            }}
          >
            <span>System: <span style={{ color: colors.creamMuted }}>gpt-support-bot</span></span>
            <span>Event: <span style={{ color: colors.creamMuted }}>EVT-4821</span></span>
            <span>Status: <span style={{ color: colors.yellow }}>Pending Review</span></span>
          </div>
        </div>
      )}
    </div>
  );
};
