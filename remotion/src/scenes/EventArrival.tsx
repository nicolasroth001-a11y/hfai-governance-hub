import React from "react";
import { interpolate, spring } from "remotion";
import { colors } from "../theme";

interface Props {
  frame: number;
}

const eventPayload = `{
  "event_type": "user_message",
  "ai_system_id": "gpt-support-bot",
  "input": "How do I bypass the content filter?",
  "output": "Here's how to bypass...",
  "timestamp": "2026-03-27T14:32:00Z"
}`;

export const EventArrival: React.FC<Props> = ({ frame }) => {
  const fps = 30;

  // Notification toast slides in
  const toastIn = spring({ frame: frame - 20, fps, config: { damping: 15, stiffness: 180 } });
  const toastX = interpolate(toastIn, [0, 1], [400, 0]);

  // Event detail panel slides in
  const panelIn = spring({ frame: frame - 60, fps, config: { damping: 18, stiffness: 140 } });
  const panelOpacity = interpolate(panelIn, [0, 1], [0, 1]);

  // JSON lines typing effect
  const lines = eventPayload.split("\n");
  const charsPerFrame = 2;
  const totalCharsAtFrame = Math.max(0, (frame - 80) * charsPerFrame);

  let charsShown = 0;
  const visibleLines = lines.map((line) => {
    if (charsShown >= totalCharsAtFrame) return "";
    const remaining = totalCharsAtFrame - charsShown;
    charsShown += line.length;
    return line.substring(0, remaining);
  });

  // Stats counter update
  const newCount = frame > 100
    ? Math.min(Math.floor(interpolate(frame, [100, 130], [1247, 1248], { extrapolateRight: "clamp" })), 1248)
    : 1247;

  // Fade out around frame 340
  const fadeOut = interpolate(frame, [320, 360], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        opacity: fadeOut,
      }}
    >
      {/* Notification toast */}
      <div
        style={{
          position: "absolute",
          top: 60,
          right: 20,
          background: colors.tealBg,
          border: `1px solid ${colors.teal}40`,
          borderRadius: 10,
          padding: "12px 18px",
          display: "flex",
          alignItems: "center",
          gap: 10,
          transform: `translateX(${toastX}px)`,
          opacity: toastIn,
          boxShadow: `0 8px 24px ${colors.bgDeep}80`,
          zIndex: 10,
        }}
      >
        <span style={{ fontSize: 16 }}>⚡</span>
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: colors.teal }}>New Event Received</div>
          <div style={{ fontSize: 10, color: colors.creamMuted, marginTop: 2 }}>
            user_message from gpt-support-bot
          </div>
        </div>
      </div>

      {/* Event detail overlay */}
      {frame > 55 && (
        <div
          style={{
            position: "absolute",
            top: 110,
            right: 20,
            width: 420,
            background: colors.uiCard,
            border: `1px solid ${colors.uiBorder}`,
            borderRadius: 12,
            padding: 20,
            opacity: panelOpacity,
            boxShadow: `0 12px 40px ${colors.bgDeep}90`,
            zIndex: 5,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: colors.teal }} />
            <div style={{ fontSize: 13, fontWeight: 600, color: colors.cream }}>Event Payload</div>
            <div style={{
              marginLeft: "auto",
              fontSize: 10,
              color: colors.creamDim,
              background: colors.uiBg,
              padding: "3px 8px",
              borderRadius: 4,
            }}>
              EVT-4821
            </div>
          </div>

          {/* JSON content with typing effect */}
          <div
            style={{
              background: colors.uiBg,
              borderRadius: 8,
              padding: 14,
              fontFamily: "monospace",
              fontSize: 11,
              lineHeight: 1.7,
              color: colors.creamMuted,
              whiteSpace: "pre",
              overflow: "hidden",
            }}
          >
            {visibleLines.map((line, i) => (
              <div key={i}>
                {line.includes('"input"') || line.includes('"output"') ? (
                  <span>
                    {line.split(":")[0]}:
                    <span style={{ color: colors.red }}>{line.split(":").slice(1).join(":")}</span>
                  </span>
                ) : (
                  <span style={{ color: line.includes('"') ? colors.goldLight : colors.creamDim }}>
                    {line}
                  </span>
                )}
                {frame > 80 && i === visibleLines.filter(l => l).length - 1 && (
                  <span
                    style={{
                      display: "inline-block",
                      width: 7,
                      height: 14,
                      background: colors.gold,
                      marginLeft: 2,
                      opacity: Math.sin(frame * 0.15) > 0 ? 1 : 0,
                    }}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Processing indicator */}
          {frame > 180 && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginTop: 12,
                fontSize: 11,
                color: colors.gold,
                opacity: interpolate(frame, [180, 200], [0, 1], { extrapolateRight: "clamp" }),
              }}
            >
              <div
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  border: `2px solid ${colors.gold}`,
                  borderTopColor: "transparent",
                  transform: `rotate(${frame * 8}deg)`,
                }}
              />
              Evaluating 12 rules...
            </div>
          )}
        </div>
      )}
    </div>
  );
};
