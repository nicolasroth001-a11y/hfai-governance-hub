import React from "react";
import { interpolate, spring } from "remotion";
import { colors } from "../theme";
import { SidebarNav } from "../components/SidebarNav";
import { TopBarUI } from "../components/TopBarUI";

const auditEntries = [
  { time: "14:32:01", action: "Event ingested", detail: "chat_completion from gpt-support-bot (f2c9e1a8)", color: colors.teal },
  { time: "14:32:02", action: "12 rules evaluated", detail: "3 rules triggered, 1 critical match", color: colors.gold },
  { time: "14:32:02", action: "Violation created", detail: "VIO-2847 — PII exposure in AI response (Critical)", color: colors.red },
  { time: "14:32:03", action: "Notification sent", detail: "Email alert to noah@acmecorp.com, security@acmecorp.com", color: colors.yellow },
  { time: "14:35:18", action: "Status updated", detail: "Open → Investigating by noah@acmecorp.com", color: colors.yellow },
  { time: "14:38:42", action: "Resolution notes added", detail: "Confirmed PII leak, escalating to security team", color: colors.creamMuted },
  { time: "14:39:01", action: "QA Review completed", detail: "Confirmed & Escalated by Noah (Approve)", color: colors.green },
  { time: "14:39:05", action: "Audit log sealed", detail: "Immutable record created — EU AI Act compliant", color: colors.gold },
];

interface Props {
  frame: number;
}

export const AuditTrailScene: React.FC<Props> = ({ frame }) => {
  const fps = 30;
  const pageIn = spring({ frame, fps, config: { damping: 22, stiffness: 160 } });
  const showClose = frame > 280;
  const closeIn = spring({ frame: frame - 280, fps, config: { damping: 18, stiffness: 120 } });

  return (
    <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", display: "flex", pointerEvents: "none" }}>
      {!showClose && (
        <>
          <SidebarNav frame={frame} activeItem="Audit Logs" />
          <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", background: colors.uiBg }}>
            <TopBarUI email="noah@acmecorp.com" />
            <div style={{ flex: 1, padding: "24px 28px", overflow: "hidden", opacity: pageIn }}>
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 20, fontWeight: 600, color: colors.cream, fontFamily: "Space Grotesk, sans-serif" }}>Audit Logs</div>
                <div style={{ fontSize: 11, color: colors.creamDim, marginTop: 3 }}>Complete, immutable record of all governance actions</div>
              </div>
              <div style={{ background: colors.uiCard, borderRadius: 10, border: `1px solid ${colors.uiBorder}`, padding: 16 }}>
                {auditEntries.map((entry, i) => {
                  const entryIn = spring({ frame: frame - 20 - i * 12, fps, config: { damping: 18, stiffness: 160 } });
                  const isLast = i === auditEntries.length - 1;
                  return (
                    <div key={i} style={{ display: "flex", gap: 12, opacity: entryIn, transform: `translateY(${interpolate(entryIn, [0, 1], [8, 0])}px)`, paddingBottom: isLast ? 0 : 12, marginBottom: isLast ? 0 : 12, borderBottom: isLast ? "none" : `1px solid ${colors.uiBorder}` }}>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 16 }}>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: entry.color, marginTop: 2, boxShadow: `0 0 6px ${entry.color}40` }} />
                        {!isLast && <div style={{ width: 1, flex: 1, background: colors.uiBorder, marginTop: 4 }} />}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontSize: 11, fontWeight: 600, color: colors.cream }}>{entry.action}</span>
                          <span style={{ fontSize: 9, color: colors.creamDim, fontFamily: "monospace" }}>{entry.time}</span>
                        </div>
                        <div style={{ fontSize: 10, color: colors.creamMuted, marginTop: 2, lineHeight: 1.4 }}>{entry.detail}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
              {frame > 140 && (
                <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 8, background: colors.greenBg, border: `1px solid ${colors.green}30`, borderRadius: 8, padding: "8px 14px", opacity: spring({ frame: frame - 140, fps, config: { damping: 18, stiffness: 160 } }) }}>
                  <span style={{ fontSize: 14 }}>✅</span>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 600, color: colors.green }}>EU AI Act Compliant</div>
                    <div style={{ fontSize: 9, color: colors.creamMuted }}>Full audit trail maintained with immutable records</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
      {showClose && (
        <div style={{ width: "100%", height: "100%", background: `radial-gradient(ellipse at 50% 40%, ${colors.bgWarm} 0%, ${colors.bgDeep} 70%)`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", opacity: closeIn }}>
          <div style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 36, fontWeight: 700, color: colors.gold, letterSpacing: 4, transform: `translateY(${interpolate(closeIn, [0, 1], [20, 0])}px)` }}>HFAI</div>
          <div style={{ fontSize: 14, color: colors.cream, marginTop: 8, letterSpacing: 2, opacity: interpolate(closeIn, [0.3, 1], [0, 1], { extrapolateLeft: "clamp" }) }}>Human-First AI Governance</div>
          <div style={{ fontSize: 11, color: colors.creamDim, marginTop: 20, opacity: interpolate(closeIn, [0.5, 1], [0, 1], { extrapolateLeft: "clamp" }) }}>humanfirstai.com</div>
        </div>
      )}
    </div>
  );
};
