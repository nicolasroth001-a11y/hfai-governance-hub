import React from "react";
import { interpolate, spring } from "remotion";
import { colors } from "../theme";

const sidebarItems = [
  { icon: "📊", label: "Dashboard", active: true },
  { icon: "🤖", label: "AI Systems", active: false },
  { icon: "⚡", label: "Events", active: false },
  { icon: "⚠️", label: "Violations", active: false },
  { icon: "👤", label: "Human Reviews", active: false },
  { icon: "📖", label: "Rules", active: false },
  { icon: "📄", label: "Rule Templates", active: false },
  { icon: "⚖️", label: "EU Compliance", active: false },
  { icon: "🔔", label: "Notifications", active: false },
  { icon: "📋", label: "Audit Logs", active: false },
  { icon: "🔌", label: "Auto-Connect", active: false },
  { icon: "🔒", label: "Security", active: false },
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
          width: 190,
          background: colors.uiSidebar,
          borderRight: `1px solid ${colors.uiBorder}`,
          padding: "16px 0",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Logo */}
        <div
          style={{
            padding: "0 16px 14px",
            borderBottom: `1px solid ${colors.uiBorder}`,
            marginBottom: 12,
          }}
        >
          <div style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 18, fontWeight: 700, color: colors.gold, letterSpacing: 2 }}>
            HFAI
          </div>
          <div style={{ fontSize: 10, color: colors.creamDim, marginTop: 2 }}>Customer Portal</div>
        </div>

        {sidebarItems.map((item, i) => {
          const itemIn = spring({ frame: frame - 8 - i * 3, fps, config: { damping: 20, stiffness: 200 } });
          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "7px 16px",
                fontSize: 11.5,
                color: item.active ? colors.cream : colors.creamMuted,
                background: item.active ? `${colors.gold}12` : "transparent",
                borderLeft: item.active ? `2px solid ${colors.gold}` : "2px solid transparent",
                opacity: itemIn,
              }}
            >
              <span style={{ fontSize: 12 }}>{item.icon}</span>
              {item.label}
            </div>
          );
        })}
      </div>

      {/* Main content */}
      <div style={{ flex: 1, padding: 24, overflow: "hidden" }}>
        {/* Top bar */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
            opacity: interpolate(frame, [10, 30], [0, 1], { extrapolateRight: "clamp" }),
          }}
        >
          <div>
            <div style={{ fontSize: 20, fontWeight: 600, color: colors.cream, fontFamily: "Space Grotesk, sans-serif" }}>
              Dashboard
            </div>
            <div style={{ fontSize: 11, color: colors.creamDim, marginTop: 3 }}>
              Last updated: just now
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                background: colors.greenBg,
                border: `1px solid ${colors.green}30`,
                borderRadius: 16,
                padding: "5px 12px",
                fontSize: 10,
                color: colors.green,
              }}
            >
              <div style={{ width: 5, height: 5, borderRadius: "50%", background: colors.green }} />
              All systems operational
            </div>
            {/* User avatar */}
            <div style={{
              width: 28, height: 28, borderRadius: "50%",
              background: `linear-gradient(135deg, ${colors.gold}, ${colors.goldDim})`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 12, fontWeight: 600, color: colors.bgDeep,
            }}>
              N
            </div>
          </div>
        </div>

        {/* Stats grid */}
        <div style={{ display: "flex", gap: 14, marginBottom: 20 }}>
          {stats.map((stat, i) => {
            const cardIn = spring({ frame: frame - 20 - i * 6, fps, config: { damping: 18, stiffness: 180 } });
            const countUp = Math.floor(interpolate(frame, [28 + i * 6, 70 + i * 6], [0, parseInt(stat.value.replace(",", ""))], {
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
                  borderRadius: 10,
                  padding: "14px 16px",
                  border: `1px solid ${colors.uiBorder}`,
                  opacity: cardIn,
                  transform: `translateY(${interpolate(cardIn, [0, 1], [12, 0])}px)`,
                }}
              >
                <div style={{ fontSize: 9, color: colors.creamDim, marginBottom: 6, textTransform: "uppercase" as const, letterSpacing: 1 }}>
                  {stat.label}
                </div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                  <div style={{ fontSize: 24, fontWeight: 700, color: stat.color, fontFamily: "Space Grotesk, sans-serif" }}>
                    {displayValue}
                  </div>
                  {stat.change && (
                    <div style={{ fontSize: 10, color: stat.change.startsWith("+") ? colors.green : colors.red }}>
                      {stat.change}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Two column: Recent Activity + AI Systems */}
        <div style={{ display: "flex", gap: 14 }}>
          {/* Recent activity */}
          <div
            style={{
              flex: 1.2,
              background: colors.uiCard,
              borderRadius: 10,
              border: `1px solid ${colors.uiBorder}`,
              padding: 16,
              opacity: interpolate(frame, [50, 70], [0, 1], { extrapolateRight: "clamp" }),
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 600, color: colors.cream, marginBottom: 12 }}>
              Recent Activity
            </div>
            {[
              { time: "2 min ago", text: "Rule evaluation completed — gpt-support-bot", color: colors.teal },
              { time: "5 min ago", text: "Event ingested — user_message", color: colors.creamDim },
              { time: "12 min ago", text: "Violation VIO-2845 resolved", color: colors.green },
              { time: "18 min ago", text: "New rule template applied", color: colors.gold },
            ].map((item, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "8px 0",
                  borderBottom: i < 3 ? `1px solid ${colors.uiBorder}` : "none",
                  opacity: interpolate(frame, [60 + i * 8, 78 + i * 8], [0, 1], { extrapolateRight: "clamp" }),
                }}
              >
                <div style={{ width: 5, height: 5, borderRadius: "50%", background: item.color }} />
                <div style={{ flex: 1, fontSize: 11, color: colors.creamMuted }}>{item.text}</div>
                <div style={{ fontSize: 9, color: colors.creamDim }}>{item.time}</div>
              </div>
            ))}
          </div>

          {/* AI Systems summary */}
          <div
            style={{
              flex: 0.8,
              background: colors.uiCard,
              borderRadius: 10,
              border: `1px solid ${colors.uiBorder}`,
              padding: 16,
              opacity: interpolate(frame, [60, 80], [0, 1], { extrapolateRight: "clamp" }),
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 600, color: colors.cream, marginBottom: 12 }}>
              AI Systems
            </div>
            {[
              { name: "gpt-support-bot", status: "Active", risk: "High", riskColor: colors.red },
              { name: "claude-analyzer", status: "Active", risk: "Medium", riskColor: colors.yellow },
              { name: "gemini-classifier", status: "Monitoring", risk: "Low", riskColor: colors.green },
            ].map((sys, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "8px 0",
                  borderBottom: i < 2 ? `1px solid ${colors.uiBorder}` : "none",
                  opacity: interpolate(frame, [70 + i * 10, 88 + i * 10], [0, 1], { extrapolateRight: "clamp" }),
                }}
              >
                <div style={{ width: 5, height: 5, borderRadius: "50%", background: colors.teal }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, color: colors.cream }}>{sys.name}</div>
                  <div style={{ fontSize: 9, color: colors.creamDim }}>{sys.status}</div>
                </div>
                <div style={{
                  fontSize: 8, fontWeight: 600, color: sys.riskColor,
                  background: `${sys.riskColor}15`, padding: "2px 6px", borderRadius: 4,
                  textTransform: "uppercase" as const, letterSpacing: 0.5,
                }}>
                  {sys.risk}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
