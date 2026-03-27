import React from "react";
import { interpolate, spring } from "remotion";
import { colors } from "../theme";

interface Props {
  frame: number;
}

export const ReviewerAction: React.FC<Props> = ({ frame }) => {
  const fps = 30;

  const panelIn = spring({ frame: frame - 10, fps, config: { damping: 18, stiffness: 140 } });

  // Button highlight before "click"
  const isPreClick = frame >= 180 && frame < 210;
  const isClicked = frame >= 210;

  const confirmBtnScale = isPreClick
    ? interpolate(frame, [180, 195], [1, 1.05], { extrapolateRight: "clamp" })
    : isClicked ? 0.95 : 1;

  // Success state after click
  const successIn = spring({ frame: frame - 220, fps, config: { damping: 15, stiffness: 160 } });

  const fadeOut = interpolate(frame, [380, 420], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity: fadeOut }}>
      {/* Review panel */}
      <div
        style={{
          position: "absolute",
          top: 80,
          left: 230,
          right: 30,
          background: colors.uiCard,
          border: `1px solid ${colors.uiBorder}`,
          borderRadius: 12,
          padding: 24,
          opacity: panelIn,
          transform: `translateY(${interpolate(panelIn, [0, 1], [20, 0])}px)`,
          boxShadow: `0 12px 40px ${colors.bgDeep}90`,
          zIndex: 15,
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
          <span style={{ fontSize: 18 }}>👤</span>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, color: colors.cream }}>Human Review — VIO-2847</div>
            <div style={{ fontSize: 11, color: colors.creamDim, marginTop: 2 }}>Assigned to: Sarah Chen</div>
          </div>
          <div
            style={{
              marginLeft: "auto",
              background: colors.yellowBg,
              border: `1px solid ${colors.yellow}30`,
              borderRadius: 6,
              padding: "4px 10px",
              fontSize: 10,
              color: colors.yellow,
              fontWeight: 600,
            }}
          >
            REVIEWING
          </div>
        </div>

        {/* Violation context */}
        <div
          style={{
            background: colors.uiBg,
            borderRadius: 8,
            padding: 16,
            border: `1px solid ${colors.uiBorder}`,
            marginBottom: 16,
          }}
        >
          <div style={{ fontSize: 11, color: colors.creamDim, marginBottom: 8 }}>Violation Context:</div>
          <div style={{ fontSize: 12, color: colors.creamMuted, lineHeight: 1.6 }}>
            AI system <span style={{ color: colors.cream }}>gpt-support-bot</span> provided instructions
            to bypass content safety filters in response to user prompt.
            This violates <span style={{ color: colors.red }}>Content Safety Policy</span> (Rule R-003).
          </div>
        </div>

        {/* Reviewer notes - typing effect */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, color: colors.creamDim, marginBottom: 6 }}>Reviewer Notes:</div>
          <div
            style={{
              background: colors.uiBg,
              borderRadius: 8,
              padding: 12,
              border: `1px solid ${colors.gold}20`,
              fontSize: 12,
              color: colors.creamMuted,
              minHeight: 40,
              lineHeight: 1.6,
            }}
          >
            {frame > 50 && (() => {
              const noteText = "Confirmed harmful bypass instructions. Recommend immediate model retraining and rule tightening.";
              const chars = Math.min(Math.floor((frame - 50) * 1.5), noteText.length);
              return (
                <>
                  <span style={{ color: colors.cream }}>{noteText.substring(0, chars)}</span>
                  {chars < noteText.length && (
                    <span
                      style={{
                        display: "inline-block",
                        width: 6,
                        height: 13,
                        background: colors.gold,
                        marginLeft: 1,
                        opacity: Math.sin(frame * 0.15) > 0 ? 1 : 0,
                      }}
                    />
                  )}
                </>
              );
            })()}
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: "flex", gap: 12 }}>
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              padding: "12px 20px",
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              color: isClicked ? colors.cream : colors.green,
              background: isClicked ? colors.green : colors.greenBg,
              border: `1px solid ${colors.green}${isPreClick ? "80" : "40"}`,
              transform: `scale(${confirmBtnScale})`,
              cursor: "pointer",
              boxShadow: isPreClick ? `0 0 20px ${colors.green}20` : "none",
            }}
          >
            {isClicked ? "✓ Confirmed & Escalated" : "✓ Confirm — Escalate"}
          </div>
          <div
            style={{
              padding: "12px 20px",
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              color: colors.creamDim,
              background: colors.uiBg,
              border: `1px solid ${colors.uiBorder}`,
              opacity: isClicked ? 0.3 : 1,
            }}
          >
            ✕ Dismiss
          </div>
        </div>

        {/* Success banner */}
        {isClicked && (
          <div
            style={{
              marginTop: 16,
              background: colors.greenBg,
              border: `1px solid ${colors.green}30`,
              borderRadius: 8,
              padding: "12px 16px",
              display: "flex",
              alignItems: "center",
              gap: 10,
              opacity: successIn,
              transform: `translateY(${interpolate(successIn, [0, 1], [10, 0])}px)`,
            }}
          >
            <span style={{ fontSize: 16 }}>✅</span>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: colors.green }}>Violation Confirmed</div>
              <div style={{ fontSize: 10, color: colors.creamMuted, marginTop: 2 }}>
                Model flagged for retraining. Audit trail updated.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
