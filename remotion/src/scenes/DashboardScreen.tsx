import React from "react";
import { interpolate, spring } from "remotion";
import { colors } from "../theme";

const sidebarItems = [
  { icon: "📊", label: "Dashboard", active: true },
  { icon: "⚡", label: "Events", active: false },
  { icon: "🛡️", label: "Rules", active: false },
  { icon: "⚠️", label: "Violations", active: false },
  { icon: "👤", label: "Reviews", active: false },
  { icon: "📋", label: "Audit Log", active: false },
];

const stats = [
  { label: "Events Today", value: "1,247", change: "+12%", color: colors.teal },
  { label: "Active Rules", value: "12", change: "", color: colors.gold },
  { label: "Open Violations", value: "3", change: "-2", color: colors.red },
  { label: "Reviews Pending", value: "1", change: "", color: colors.yellow },
];

interface Props {
  frame: number;
}

export const DashboardScreen: React.FC<Props> = ({ frame }) => {
  const fps = 30;

  return (
    <div style={{ display: "flex", width: "100%", height: "100%", fontFamily: "Inter, sans-serif" }}>
      {/* Sidebar */}
      <div
        style={{
          width: 200,
          background: colors.uiSidebar,
          borderRight: `1px solid ${colors.uiBorder}`,
          padding: "20px 0",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Logo */}
        <div
          style={{
            padding: "0 20px 20px",
            fontFamily: "Space Grotesk, sans-serif",
            fontSize: 20,
            fontWeight: 700,
            color: colors.gold,
            letterSpacing: 2,
            borderBottom: `1px solid ${colors.uiBorder}`,
            marginBottom: 16,
          }}
        >
          HFAI
        </div>

        {sidebarItems.map((item, i) => {
          const itemIn = spring({ frame: frame - 10 - i * 5, fps, config: { damping: 20, stiffness: 200 } });
          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 20px",
                fontSize: 13,
                color: item.active ? colors.cream : colors.creamMuted,
                background: item.active ? `${colors.gold}12` : "transparent",
                borderLeft: item.active ? `2px solid ${colors.gold}` : "2px solid transparent",
                opacity: itemIn,
              }}
            >
              <span style={{ fontSize: 14 }}>{item.icon}</span>
              {item.label}
            </div>
          );
        })}
      </div>

      {/* Main content */}
      <div style={{ flex: 1, padding: 28, overflow: "hidden" }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 24,
            opacity: interpolate(frame, [10, 30], [0, 1], { extrapolateRight: "clamp" }),
          }}
        >
          <div>
            <div style={{ fontSize: 22, fontWeight: 600, color: colors.cream, fontFamily: "Space Grotesk, sans-serif" }}>
              Dashboard
            </div>
            <div style={{ fontSize: 12, color: colors.creamDim, marginTop: 4 }}>
              Last updated: just now
            </div>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: colors.greenBg,
              border: `1px solid ${colors.green}30`,
              borderRadius: 20,
              padding: "6px 14px",
              fontSize: 11,
              color: colors.green,
            }}
          >
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: colors.green }} />
            All systems operational
          </div>
        </div>

        {/* Stats grid */}
        <div style={{ display: "flex", gap: 16, marginBottom: 24 }}>
          {stats.map((stat, i) => {
            const cardIn = spring({ frame: frame - 20 - i * 8, fps, config: { damping: 18, stiffness: 180 } });
            const countUp = Math.floor(interpolate(frame, [30 + i * 8, 80 + i * 8], [0, parseInt(stat.value.replace(",", ""))], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }));
            const displayValue = stat.value.includes(",")
              ? countUp.toLocaleString()
              : countUp.toString();

            return (
              <div
                key={i}
                style={{
                  flex: 1,
                  background: colors.uiCard,
                  borderRadius: 12,
                  padding: "18px 20px",
                  border: `1px solid ${colors.uiBorder}`,
                  opacity: cardIn,
                  transform: `translateY(${interpolate(cardIn, [0, 1], [15, 0])}px)`,
                }}
              >
                <div style={{ fontSize: 11, color: colors.creamDim, marginBottom: 8, textTransform: "uppercase" as const, letterSpacing: 1 }}>
                  {stat.label}
                </div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                  <div style={{ fontSize: 28, fontWeight: 700, color: stat.color, fontFamily: "Space Grotesk, sans-serif" }}>
                    {displayValue}
                  </div>
                  {stat.change && (
                    <div style={{ fontSize: 11, color: stat.change.startsWith("+") ? colors.green : colors.red }}>
                      {stat.change}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Recent activity placeholder */}
        <div
          style={{
            background: colors.uiCard,
            borderRadius: 12,
            border: `1px solid ${colors.uiBorder}`,
            padding: 20,
            opacity: interpolate(frame, [60, 80], [0, 1], { extrapolateRight: "clamp" }),
          }}
        >
          <div style={{ fontSize: 14, fontWeight: 600, color: colors.cream, marginBottom: 16 }}>
            Recent Activity
          </div>
          {[
            { time: "2 min ago", text: "Rule evaluation completed — gpt-support-bot", color: colors.teal },
            { time: "5 min ago", text: "Event ingested — user_message", color: colors.creamDim },
            { time: "12 min ago", text: "Violation VIO-2845 resolved by reviewer", color: colors.green },
          ].map((item, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "10px 0",
                borderBottom: i < 2 ? `1px solid ${colors.uiBorder}` : "none",
                opacity: interpolate(frame, [70 + i * 10, 90 + i * 10], [0, 1], { extrapolateRight: "clamp" }),
              }}
            >
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: item.color }} />
              <div style={{ flex: 1, fontSize: 12, color: colors.creamMuted }}>{item.text}</div>
              <div style={{ fontSize: 10, color: colors.creamDim }}>{item.time}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
