import React from "react";
import { interpolate, spring } from "remotion";
import { colors } from "../theme";
import { SidebarNav } from "../components/SidebarNav";
import { TopBarUI } from "../components/TopBarUI";

interface Props {
  frame: number;
}

export const ReviewerAction: React.FC<Props> = ({ frame }) => {
  const fps = 30;
  const pageIn = spring({ frame, fps, config: { damping: 22, stiffness: 160 } });
  const pageX = interpolate(pageIn, [0, 1], [30, 0]);

  const noteText = "Confirmed PII leak in response. The AI disclosed user personal data without authorization. Escalating to security team for data breach protocol.";
  const visibleChars = Math.floor(interpolate(frame, [120, 260], [0, noteText.length], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  const statusChange = frame > 180;
  const btnClicked = frame > 300;
  const btnScale = btnClicked ? 1 : interpolate(frame, [290, 300], [1, 0.95], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const successIn = spring({ frame: frame - 310, fps, config: { damping: 16, stiffness: 180 } });
  const fadeOut = interpolate(frame, [380, 420], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", display: "flex", pointerEvents: "none", opacity: fadeOut }}>
      <SidebarNav frame={frame} activeItem="Violations" />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", background: colors.uiBg }}>
        <TopBarUI email="noah@acmecorp.com" />
        <div style={{ flex: 1, padding: "20px 28px", overflow: "hidden", transform: `translateX(${pageX}px)`, opacity: pageIn }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12, opacity: 0.6 }}>
            <span style={{ fontSize: 12 }}>←</span>
            <span style={{ fontSize: 11, color: colors.creamMuted }}>Back to Violations</span>
          </div>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 18, fontWeight: 600, color: colors.cream, fontFamily: "Space Grotesk, sans-serif" }}>Violation #VIO-2847</div>
            <div style={{ fontSize: 11, color: colors.creamDim, marginTop: 2 }}>Review violation details and resolve</div>
          </div>

          <div style={{ display: "flex", gap: 12, marginBottom: 14 }}>
            <div style={{ flex: 1, background: colors.uiCard, borderRadius: 10, border: `1px solid ${colors.uiBorder}`, padding: 14, opacity: interpolate(frame, [15, 35], [0, 1], { extrapolateRight: "clamp" }) }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: colors.cream, marginBottom: 10 }}>Violation Summary</div>
              {[
                { label: "Description", value: "PII exposure in AI response" },
                { label: "Severity", value: "CRITICAL", color: colors.red, bg: colors.redBg },
                { label: "Detected", value: "2 minutes ago" },
                { label: "Status", value: statusChange ? "Investigating" : "Open", color: statusChange ? colors.yellow : colors.red },
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "3px 0" }}>
                  <span style={{ fontSize: 9, color: colors.creamDim, textTransform: "uppercase" as const, letterSpacing: 0.5 }}>{item.label}</span>
                  {item.bg ? <span style={{ fontSize: 8, fontWeight: 600, color: item.color, background: item.bg, padding: "2px 6px", borderRadius: 4 }}>{item.value}</span>
                    : <span style={{ fontSize: 10, color: item.color || colors.creamMuted }}>{item.value}</span>}
                </div>
              ))}
            </div>
            <div style={{ flex: 1, background: colors.uiCard, borderRadius: 10, border: `1px solid ${colors.uiBorder}`, padding: 14, opacity: interpolate(frame, [22, 42], [0, 1], { extrapolateRight: "clamp" }) }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: colors.cream, marginBottom: 10 }}>AI System Info</div>
              {[{ label: "System", value: "gpt-support-bot" }, { label: "Provider", value: "OpenAI" }, { label: "Model", value: "GPT-4o" }, { label: "Risk Level", value: "HIGH", color: colors.red }, { label: "EU Risk Tier", value: "High-Risk" }].map((item, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "3px 0" }}>
                  <span style={{ fontSize: 9, color: colors.creamDim }}>{item.label}</span>
                  <span style={{ fontSize: 10, color: item.color || colors.creamMuted, fontWeight: item.color ? 600 : 400 }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: colors.uiCard, borderRadius: 10, border: `1px solid ${colors.uiBorder}`, padding: 14, marginBottom: 14, opacity: interpolate(frame, [40, 60], [0, 1], { extrapolateRight: "clamp" }) }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: colors.cream, marginBottom: 10 }}>Resolution Workflow</div>
            <div style={{ display: "flex", gap: 14 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 9, color: colors.creamDim, marginBottom: 4, textTransform: "uppercase" as const, letterSpacing: 0.5 }}>Status</div>
                <div style={{ background: colors.uiBg, border: `1px solid ${colors.uiBorder}`, borderRadius: 6, padding: "6px 10px", fontSize: 10, color: statusChange ? colors.yellow : colors.cream, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  {statusChange ? "Investigating" : "Open"}<span style={{ fontSize: 8 }}>▼</span>
                </div>
              </div>
            </div>
            <div style={{ marginTop: 10 }}>
              <div style={{ fontSize: 9, color: colors.creamDim, marginBottom: 4, textTransform: "uppercase" as const, letterSpacing: 0.5 }}>Resolution Notes</div>
              <div style={{ background: colors.uiBg, border: `1px solid ${colors.uiBorder}`, borderRadius: 6, padding: "8px 10px", fontSize: 10, color: colors.creamMuted, minHeight: 50, lineHeight: 1.5 }}>
                {visibleChars > 0 ? noteText.slice(0, visibleChars) : <span style={{ color: colors.creamDim }}>Describe how this violation was investigated…</span>}
                {visibleChars > 0 && visibleChars < noteText.length && <span style={{ borderRight: `1px solid ${colors.gold}`, marginLeft: 1 }}>&nbsp;</span>}
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 5, background: colors.gold, color: colors.bgDeep, borderRadius: 6, padding: "6px 14px", fontSize: 10, fontWeight: 600, transform: `scale(${btnScale})` }}>💾 Update Status</div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ flex: 1, background: colors.uiCard, borderRadius: 10, border: `1px solid ${colors.uiBorder}`, padding: 14, opacity: interpolate(frame, [60, 80], [0, 1], { extrapolateRight: "clamp" }) }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: colors.cream, marginBottom: 10 }}>⚖️ Internal QA Review</div>
              {btnClicked ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, padding: "10px 0", opacity: successIn }}>
                  <div style={{ fontSize: 20 }}>✅</div>
                  <span style={{ fontSize: 11, color: colors.green, fontWeight: 600 }}>Confirmed & Escalated</span>
                </div>
              ) : (
                <div style={{ display: "flex", gap: 8 }}>
                  <div style={{ flex: 1, textAlign: "center" as const, padding: "7px 0", background: colors.greenBg, border: `1px solid ${colors.green}30`, borderRadius: 6, fontSize: 10, color: colors.green, fontWeight: 500 }}>✓ Approve</div>
                  <div style={{ flex: 1, textAlign: "center" as const, padding: "7px 0", background: colors.redBg, border: `1px solid ${colors.red}30`, borderRadius: 6, fontSize: 10, color: colors.red, fontWeight: 500 }}>✕ Reject</div>
                </div>
              )}
            </div>
            <div style={{ flex: 1, background: colors.uiCard, borderRadius: 10, border: `1px solid ${colors.uiBorder}`, padding: 14, opacity: interpolate(frame, [65, 85], [0, 1], { extrapolateRight: "clamp" }) }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: colors.cream, marginBottom: 10 }}>📝 QA Notes</div>
              <div style={{ background: colors.uiBg, border: `1px solid ${colors.uiBorder}`, borderRadius: 6, padding: "8px 10px", fontSize: 10, color: colors.creamDim, minHeight: 36 }}>Add reviewer notes...</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
