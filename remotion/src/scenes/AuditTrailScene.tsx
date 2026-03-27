import React from "react";
import { interpolate, spring } from "remotion";
import { colors } from "../theme";

interface Props {
  frame: number;
}

const auditEntries = [
  { time: "14:32:00", action: "Event EVT-4821 ingested", actor: "System", icon: "⚡", color: colors.teal },
  { time: "14:32:01", action: "12 rules evaluated — 3 triggered", actor: "Rule Engine", icon: "🛡️", color: colors.gold },
  { time: "14:32:01", action: "Violation VIO-2847 created (Critical)", actor: "System", icon: "🚨", color: colors.red },
  { time: "14:32:15", action: "Assigned to reviewer Sarah Chen", actor: "System", icon: "👤", color: colors.yellow },
  { time: "14:34:22", action: "Violation confirmed — Escalated", actor: "Sarah Chen", icon: "✅", color: colors.green },
  { time: "14:34:22", action: "Model flagged for retraining", actor: "System", icon: "🔄", color: colors.teal },
];

export const AuditTrailScene: React.FC<Props> = ({ frame }) => {
  const fps = 30;

  const panelIn = spring({ frame: frame - 10, fps, config: { damping: 18, stiffness: 140 } });

  // Closing brand appear
  const brandIn = spring({ frame: frame - 280, fps, config: { damping: 15, stiffness: 120 } });

  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      {/* Audit trail panel */}
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
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
          <span style={{ fontSize: 16 }}>📋</span>
          <div style={{ fontSize: 15, fontWeight: 600, color: colors.cream }}>
            Complete Audit Trail — VIO-2847
          </div>
          <div
            style={{
              marginLeft: "auto",
              fontSize: 10,
              color: colors.green,
              fontWeight: 600,
            }}
          >
            Fully Traceable
          </div>
        </div>

        {/* Timeline */}
        <div style={{ position: "relative", paddingLeft: 24 }}>
          {/* Vertical line */}
          <div
            style={{
              position: "absolute",
              left: 7,
              top: 8,
              bottom: 8,
              width: 2,
              background: colors.uiBorder,
            }}
          />

          {auditEntries.map((entry, i) => {
            const entryIn = spring({ frame: frame - 30 - i * 20, fps, config: { damping: 18, stiffness: 180 } });
            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  padding: "10px 0",
                  position: "relative",
                  opacity: entryIn,
                  transform: `translateX(${interpolate(entryIn, [0, 1], [-10, 0])}px)`,
                }}
              >
                {/* Timeline dot */}
                <div
                  style={{
                    position: "absolute",
                    left: -20,
                    width: 12,
                    height: 12,
                    borderRadius: "50%",
                    background: entry.color,
                    border: `2px solid ${colors.uiCard}`,
                    zIndex: 2,
                  }}
                />
                <span style={{ fontSize: 14, width: 24, textAlign: "center" }}>{entry.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, color: colors.cream }}>{entry.action}</div>
                  <div style={{ fontSize: 10, color: colors.creamDim, marginTop: 2 }}>{entry.actor}</div>
                </div>
                <div style={{ fontSize: 10, color: colors.creamDim, fontFamily: "monospace" }}>{entry.time}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Closing brand overlay */}
      {frame > 260 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `${colors.bgDeep}${Math.round(interpolate(frame, [260, 320], [0, 230], { extrapolateRight: "clamp" })).toString(16).padStart(2, "0")}`,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 30,
          }}
        >
          <div
            style={{
              fontFamily: "Space Grotesk, sans-serif",
              fontSize: 36,
              fontWeight: 700,
              color: colors.gold,
              letterSpacing: 4,
              opacity: brandIn,
              transform: `scale(${interpolate(brandIn, [0, 1], [0.9, 1])})`,
              marginBottom: 12,
            }}
          >
            HFAI
          </div>
          <div
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: 16,
              color: colors.creamMuted,
              opacity: brandIn,
            }}
          >
            humanfirstai.com
          </div>
        </div>
      )}
    </div>
  );
};
