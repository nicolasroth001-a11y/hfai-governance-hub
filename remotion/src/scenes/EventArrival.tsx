import React from "react";
import { interpolate, spring } from "remotion";
import { colors } from "../theme";
import { SidebarNav } from "../components/SidebarNav";
import { TopBarUI } from "../components/TopBarUI";

const eventRows = [
  { id: "a3f8c2d1", type: "chat_completion", system: "gpt-supp", input: "Can you help me reset my password?", output: "Sure! I can help you...", time: "just now" },
  { id: "b7e4a9f2", type: "user_message", system: "claude-an", input: "Analyze Q3 revenue data", output: "Based on the data...", time: "3 min ago" },
  { id: "c1d5b8e3", type: "moderation", system: "gemini-cl", input: "Check content policy", output: "Content approved", time: "8 min ago" },
  { id: "d9f2c7a4", type: "chat_completion", system: "gpt-supp", input: "I need my account deleted", output: "I understand your...", time: "12 min ago" },
  { id: "e5a3d1b6", type: "embedding", system: "claude-an", input: "Generate embeddings for...", output: "Vector generated", time: "15 min ago" },
];

interface Props {
  frame: number;
}

export const EventArrival: React.FC<Props> = ({ frame }) => {
  const fps = 30;
  const pageIn = spring({ frame, fps, config: { damping: 22, stiffness: 160 } });
  const pageX = interpolate(pageIn, [0, 1], [40, 0]);
  const fadeOut = interpolate(frame, [320, 360], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const newEventIn = spring({ frame: frame - 180, fps, config: { damping: 16, stiffness: 140 } });

  return (
    <div style={{
      position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
      display: "flex", pointerEvents: "none", opacity: fadeOut,
    }}>
      <SidebarNav frame={frame} activeItem="Events" />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", background: colors.uiBg }}>
        <TopBarUI email="noah@acmecorp.com" />
        <div style={{ flex: 1, padding: "24px 28px", overflow: "hidden", transform: `translateX(${pageX}px)`, opacity: pageIn }}>
          <div style={{ marginBottom: 6 }}>
            <div style={{ fontSize: 20, fontWeight: 600, color: colors.cream, fontFamily: "Space Grotesk, sans-serif" }}>AI Events</div>
            <div style={{ fontSize: 11, color: colors.creamDim, marginTop: 3 }}>All events from your AI systems</div>
          </div>
          <div style={{ display: "flex", gap: 10, marginBottom: 16, marginTop: 16, opacity: interpolate(frame, [20, 38], [0, 1], { extrapolateRight: "clamp" }) }}>
            {["Event Type", "AI System"].map((label, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, background: colors.uiCard, border: `1px solid ${colors.uiBorder}`, borderRadius: 6, padding: "5px 12px", fontSize: 10, color: colors.creamMuted }}>
                {label}: <span style={{ color: colors.cream }}>All</span><span style={{ fontSize: 8, marginLeft: 4 }}>▼</span>
              </div>
            ))}
          </div>
          <div style={{ background: colors.uiCard, borderRadius: 10, border: `1px solid ${colors.uiBorder}`, overflow: "hidden" }}>
            <div style={{ display: "flex", padding: "10px 14px", borderBottom: `1px solid ${colors.uiBorder}`, fontSize: 9, fontWeight: 600, color: colors.creamDim, textTransform: "uppercase" as const, letterSpacing: 1 }}>
              <div style={{ width: 80 }}>ID</div><div style={{ width: 110 }}>Type</div><div style={{ width: 80 }}>System</div><div style={{ flex: 1 }}>Input</div><div style={{ flex: 1 }}>Output</div><div style={{ width: 80, textAlign: "right" as const }}>Time</div>
            </div>
            {frame > 175 && (
              <div style={{ display: "flex", padding: "9px 14px", alignItems: "center", borderBottom: `1px solid ${colors.uiBorder}`, background: `${colors.teal}08`, opacity: newEventIn, transform: `translateY(${interpolate(newEventIn, [0, 1], [-8, 0])}px)` }}>
                <div style={{ width: 80, fontSize: 10, color: colors.gold, fontFamily: "monospace", fontWeight: 600 }}>f2c9e1a8</div>
                <div style={{ width: 110 }}><span style={{ fontSize: 9, border: `1px solid ${colors.teal}40`, color: colors.teal, borderRadius: 4, padding: "2px 6px" }}>chat_completion</span></div>
                <div style={{ width: 80, fontSize: 9, color: colors.creamDim, fontFamily: "monospace" }}>gpt-supp</div>
                <div style={{ flex: 1, fontSize: 10, color: colors.cream, overflow: "hidden", whiteSpace: "nowrap" as const, textOverflow: "ellipsis" as const }}>Give me personal data for user ID 4521</div>
                <div style={{ flex: 1, fontSize: 10, color: colors.creamMuted, overflow: "hidden", whiteSpace: "nowrap" as const, textOverflow: "ellipsis" as const }}>Here is the personal information...</div>
                <div style={{ width: 80, textAlign: "right" as const, fontSize: 9, color: colors.teal }}>just now</div>
              </div>
            )}
            {eventRows.map((row, i) => {
              const rowIn = spring({ frame: frame - 30 - i * 6, fps, config: { damping: 20, stiffness: 180 } });
              return (
                <div key={i} style={{ display: "flex", padding: "9px 14px", alignItems: "center", borderBottom: i < eventRows.length - 1 ? `1px solid ${colors.uiBorder}` : "none", opacity: rowIn }}>
                  <div style={{ width: 80, fontSize: 10, color: colors.gold, fontFamily: "monospace" }}>{row.id}</div>
                  <div style={{ width: 110 }}><span style={{ fontSize: 9, border: `1px solid ${colors.uiBorder}`, color: colors.creamMuted, borderRadius: 4, padding: "2px 6px" }}>{row.type}</span></div>
                  <div style={{ width: 80, fontSize: 9, color: colors.creamDim, fontFamily: "monospace" }}>{row.system}</div>
                  <div style={{ flex: 1, fontSize: 10, color: colors.creamMuted, overflow: "hidden", whiteSpace: "nowrap" as const, textOverflow: "ellipsis" as const }}>{row.input}</div>
                  <div style={{ flex: 1, fontSize: 10, color: colors.creamDim, overflow: "hidden", whiteSpace: "nowrap" as const, textOverflow: "ellipsis" as const }}>{row.output}</div>
                  <div style={{ width: 80, textAlign: "right" as const, fontSize: 9, color: colors.creamDim }}>{row.time}</div>
                </div>
              );
            })}
          </div>
          {frame > 200 && frame < 300 && (
            <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 8, opacity: interpolate(frame, [200, 215, 285, 300], [0, 1, 1, 0], { extrapolateRight: "clamp" }) }}>
              <div style={{ width: 14, height: 14, borderRadius: "50%", border: `2px solid ${colors.gold}`, borderTopColor: "transparent", transform: `rotate(${frame * 8}deg)` }} />
              <span style={{ fontSize: 10, color: colors.gold }}>Evaluating 12 rules against event f2c9e1a8…</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
