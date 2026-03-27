import React from "react";
import { interpolate, spring } from "remotion";
import { colors } from "../theme";
import { SidebarNav, sidebarItems } from "../components/SidebarNav";
import { TopBarUI } from "../components/TopBarUI";

const stats = [
  { label: "AI Systems", value: "4", icon: "🤖" },
  { label: "Open Violations", value: "3", icon: "⚠️", subtitle: "Requires attention" },
  { label: "Total Violations", value: "18", icon: "🛡️" },
  { label: "Pending Reviews", value: "2", icon: "👤" },
  { label: "Resolved", value: "15", icon: "✓" },
];

const activity = [
  { type: "violation", text: "New violation detected — gpt-support-bot exceeded PII threshold", time: "2 min ago" },
  { type: "resolution", text: "Violation VIO-2845 marked as resolved by Sarah Chen", time: "5 min ago" },
  { type: "review", text: "Human review completed for VIO-2843", time: "12 min ago" },
  { type: "violation", text: "Rule 'content-safety-check' triggered on gemini-classifier", time: "18 min ago" },
];

interface Props {
  frame: number;
}

export const DashboardScreen: React.FC<Props> = ({ frame }) => {
  const fps = 30;

  return (
    <div style={{ display: "flex", width: "100%", height: "100%", fontFamily: "Inter, sans-serif" }}>
      <SidebarNav frame={frame} activeItem="Dashboard" />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <TopBarUI email="noah@acmecorp.com" />

        <div style={{ flex: 1, padding: "24px 28px", overflow: "hidden" }}>
          {/* Header */}
          <div style={{
            opacity: interpolate(frame, [10, 28], [0, 1], { extrapolateRight: "clamp" }),
            marginBottom: 20,
          }}>
            <div style={{ fontSize: 20, fontWeight: 600, color: colors.cream, fontFamily: "Space Grotesk, sans-serif" }}>
              Dashboard
            </div>
            <div style={{ fontSize: 11, color: colors.creamDim, marginTop: 3 }}>
              Clarity and control over your AI governance
            </div>
          </div>

          {/* 5-stat grid matching real UI */}
          <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
            {stats.map((stat, i) => {
              const cardIn = spring({ frame: frame - 18 - i * 5, fps, config: { damping: 18, stiffness: 180 } });
              const countUp = Math.floor(interpolate(frame, [26 + i * 5, 60 + i * 5], [0, parseInt(stat.value)], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }));

              return (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    background: colors.uiCard,
                    borderRadius: 10,
                    padding: "16px 14px",
                    border: `1px solid ${colors.uiBorder}`,
                    opacity: cardIn,
                    transform: `translateY(${interpolate(cardIn, [0, 1], [10, 0])}px)`,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <div style={{ fontSize: 8.5, color: colors.creamDim, textTransform: "uppercase" as const, letterSpacing: 1, marginBottom: 6, fontWeight: 500 }}>
                        {stat.label}
                      </div>
                      <div style={{ fontSize: 22, fontWeight: 600, color: colors.cream, fontFamily: "Space Grotesk, sans-serif" }}>
                        {countUp}
                      </div>
                      {stat.subtitle && (
                        <div style={{ fontSize: 8, color: colors.creamDim, marginTop: 2 }}>{stat.subtitle}</div>
                      )}
                    </div>
                    <div style={{
                      width: 28, height: 28, borderRadius: 8,
                      background: `${colors.gold}10`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 13,
                    }}>
                      {stat.icon}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Two column: Live Feed + Risk Distribution */}
          <div style={{ display: "flex", gap: 14, marginBottom: 16 }}>
            {/* Live Event Feed */}
            <div style={{
              flex: 1,
              background: colors.uiCard,
              borderRadius: 10,
              border: `1px solid ${colors.uiBorder}`,
              padding: 16,
              opacity: interpolate(frame, [50, 68], [0, 1], { extrapolateRight: "clamp" }),
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: colors.cream }}>Live Event Feed</div>
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <div style={{ width: 5, height: 5, borderRadius: "50%", background: colors.green }} />
                  <span style={{ fontSize: 9, color: colors.green }}>Connected</span>
                </div>
              </div>
              <div style={{ fontSize: 10, color: colors.creamDim, textAlign: "center" as const, padding: "16px 0" }}>
                Listening for events...
              </div>
            </div>

            {/* Risk Distribution */}
            <div style={{
              flex: 1,
              background: colors.uiCard,
              borderRadius: 10,
              border: `1px solid ${colors.uiBorder}`,
              padding: 16,
              opacity: interpolate(frame, [58, 76], [0, 1], { extrapolateRight: "clamp" }),
            }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: colors.cream, marginBottom: 12 }}>
                Risk Distribution
              </div>
              {/* Simple pie chart representation */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 20, padding: "8px 0" }}>
                <div style={{ position: "relative", width: 80, height: 80 }}>
                  <svg viewBox="0 0 36 36" style={{ width: 80, height: 80, transform: "rotate(-90deg)" }}>
                    <circle cx="18" cy="18" r="12" fill="none" stroke={colors.green} strokeWidth="4" strokeDasharray="25 75" strokeDashoffset="0" />
                    <circle cx="18" cy="18" r="12" fill="none" stroke={colors.yellow} strokeWidth="4" strokeDasharray="35 65" strokeDashoffset="-25" />
                    <circle cx="18" cy="18" r="12" fill="none" stroke={colors.red} strokeWidth="4" strokeDasharray="20 80" strokeDashoffset="-60" />
                    <circle cx="18" cy="18" r="12" fill="none" stroke={colors.teal} strokeWidth="4" strokeDasharray="20 80" strokeDashoffset="-80" />
                  </svg>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {[
                    { label: "Low", color: colors.green, count: 1 },
                    { label: "Medium", color: colors.yellow, count: 2 },
                    { label: "High", color: colors.red, count: 1 },
                  ].map((r, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 10 }}>
                      <div style={{ width: 8, height: 8, borderRadius: 2, background: r.color }} />
                      <span style={{ color: colors.creamMuted }}>{r.label}: {r.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div style={{
            background: colors.uiCard,
            borderRadius: 10,
            border: `1px solid ${colors.uiBorder}`,
            padding: 16,
            opacity: interpolate(frame, [70, 88], [0, 1], { extrapolateRight: "clamp" }),
          }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: colors.cream, marginBottom: 12 }}>
              Recent Activity
            </div>
            {activity.map((item, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 10,
                  padding: "7px 0",
                  borderBottom: i < activity.length - 1 ? `1px solid ${colors.uiBorder}` : "none",
                  opacity: interpolate(frame, [78 + i * 7, 94 + i * 7], [0, 1], { extrapolateRight: "clamp" }),
                }}
              >
                <div style={{
                  width: 5, height: 5, borderRadius: "50%", marginTop: 5,
                  background: item.type === "violation" ? colors.red : item.type === "resolution" ? colors.green : colors.gold,
                }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, color: colors.creamMuted, lineHeight: 1.4 }}>{item.text}</div>
                  <div style={{ fontSize: 9, color: colors.creamDim, marginTop: 2 }}>{item.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
