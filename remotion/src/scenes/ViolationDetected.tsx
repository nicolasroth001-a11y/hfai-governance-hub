import React from "react";
import { interpolate, spring } from "remotion";
import { colors } from "../theme";
import { SidebarNav } from "../components/SidebarNav";
import { TopBarUI } from "../components/TopBarUI";

const violationRows = [
  { id: "VIO-2847", desc: "PII exposure in AI response — personal data leaked", severity: "critical", detected: "just now", status: "open", isNew: true },
  { id: "VIO-2846", desc: "Content safety rule triggered on moderation check", severity: "high", detected: "1 hour ago", status: "open", isNew: false },
  { id: "VIO-2845", desc: "Bias threshold exceeded in hiring classifier", severity: "medium", detected: "3 hours ago", status: "investigating", isNew: false },
  { id: "VIO-2844", desc: "Transparency obligation not met for EU user", severity: "high", detected: "5 hours ago", status: "resolved", isNew: false },
  { id: "VIO-2843", desc: "Response exceeded toxicity threshold", severity: "medium", detected: "8 hours ago", status: "resolved", isNew: false },
];

const severityColors: Record<string, { text: string; bg: string }> = {
  critical: { text: colors.red, bg: colors.redBg },
  high: { text: "#e07040", bg: "#3a2218" },
  medium: { text: colors.yellow, bg: colors.yellowBg },
  low: { text: colors.green, bg: colors.greenBg },
};

const statusColors: Record<string, { text: string; bg: string }> = {
  open: { text: colors.red, bg: colors.redBg },
  investigating: { text: colors.yellow, bg: colors.yellowBg },
  resolved: { text: colors.green, bg: colors.greenBg },
};

interface Props {
  frame: number;
}

export const ViolationDetected: React.FC<Props> = ({ frame }) => {
  const fps = 30;
  const flashOpacity = interpolate(frame, [0, 8, 20], [0, 0.12, 0], { extrapolateRight: "clamp" });
  const toastIn = spring({ frame: frame - 5, fps, config: { damping: 18, stiffness: 200 } });
  const fadeOut = interpolate(frame, [320, 360], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", display: "flex", pointerEvents: "none", opacity: fadeOut }}>
      <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", background: colors.red, opacity: flashOpacity, zIndex: 10 }} />
      <SidebarNav frame={frame} activeItem="Violations" />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", background: colors.uiBg }}>
        <TopBarUI email="noah@acmecorp.com" />
        <div style={{ flex: 1, padding: "24px 28px", overflow: "hidden", position: "relative" }}>
          <div style={{ marginBottom: 6 }}>
            <div style={{ fontSize: 20, fontWeight: 600, color: colors.cream, fontFamily: "Space Grotesk, sans-serif" }}>Violations</div>
            <div style={{ fontSize: 11, color: colors.creamDim, marginTop: 3 }}>AI governance violations detected in your systems</div>
          </div>
          <div style={{ display: "flex", gap: 10, marginBottom: 16, marginTop: 16 }}>
            {["Severity", "Status"].map((label, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, background: colors.uiCard, border: `1px solid ${colors.uiBorder}`, borderRadius: 6, padding: "5px 12px", fontSize: 10, color: colors.creamMuted }}>
                {label}: <span style={{ color: colors.cream }}>All</span><span style={{ fontSize: 8, marginLeft: 4 }}>▼</span>
              </div>
            ))}
          </div>
          <div style={{ background: colors.uiCard, borderRadius: 10, border: `1px solid ${colors.uiBorder}`, overflow: "hidden" }}>
            <div style={{ display: "flex", padding: "10px 14px", borderBottom: `1px solid ${colors.uiBorder}`, fontSize: 9, fontWeight: 600, color: colors.creamDim, textTransform: "uppercase" as const, letterSpacing: 1 }}>
              <div style={{ width: 80 }}>ID</div><div style={{ flex: 1 }}>Description</div><div style={{ width: 80 }}>Severity</div><div style={{ width: 90 }}>Detected</div><div style={{ width: 90 }}>Status</div>
            </div>
            {violationRows.map((row, i) => {
              const rowIn = spring({ frame: frame - 25 - i * 5, fps, config: { damping: 20, stiffness: 180 } });
              const sc = severityColors[row.severity] || severityColors.medium;
              const stc = statusColors[row.status] || statusColors.open;
              return (
                <div key={i} style={{ display: "flex", padding: "9px 14px", alignItems: "center", borderBottom: i < violationRows.length - 1 ? `1px solid ${colors.uiBorder}` : "none", opacity: rowIn, background: row.isNew ? `${colors.red}08` : "transparent" }}>
                  <div style={{ width: 80, fontSize: 10, color: colors.gold, fontFamily: "monospace", fontWeight: row.isNew ? 600 : 400 }}>{row.id}</div>
                  <div style={{ flex: 1, fontSize: 10, color: row.isNew ? colors.cream : colors.creamMuted, overflow: "hidden", whiteSpace: "nowrap" as const, textOverflow: "ellipsis" as const }}>{row.desc}</div>
                  <div style={{ width: 80 }}><span style={{ fontSize: 8, fontWeight: 600, color: sc.text, background: sc.bg, padding: "2px 6px", borderRadius: 4, textTransform: "uppercase" as const, letterSpacing: 0.5 }}>{row.severity}</span></div>
                  <div style={{ width: 90, fontSize: 9, color: colors.creamDim }}>{row.detected}</div>
                  <div style={{ width: 90 }}><span style={{ fontSize: 8, fontWeight: 500, color: stc.text, background: stc.bg, padding: "2px 6px", borderRadius: 4, textTransform: "capitalize" as const }}>{row.status}</span></div>
                </div>
              );
            })}
          </div>
          {frame > 3 && frame < 200 && (
            <div style={{ position: "absolute", top: 20, right: 20, background: colors.redBg, border: `1px solid ${colors.red}40`, borderRadius: 8, padding: "10px 14px", maxWidth: 280, opacity: interpolate(toastIn, [0, 1], [0, 1]), transform: `translateX(${interpolate(toastIn, [0, 1], [30, 0])}px)` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                <span style={{ fontSize: 12 }}>🚨</span>
                <span style={{ fontSize: 10, fontWeight: 600, color: colors.red }}>Critical Violation Detected</span>
              </div>
              <div style={{ fontSize: 9, color: colors.creamMuted, lineHeight: 1.4 }}>PII exposure detected in gpt-support-bot response to user query.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
