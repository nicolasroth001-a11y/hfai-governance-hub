import React from "react";
import { spring } from "remotion";
import { colors } from "../theme";

export const sidebarItems = [
  { icon: "📊", label: "Dashboard" },
  { icon: "🤖", label: "AI Systems" },
  { icon: "⚡", label: "Events" },
  { icon: "⚠️", label: "Violations" },
  { icon: "👤", label: "Human Reviews" },
  { icon: "📖", label: "Rules" },
  { icon: "📄", label: "Rule Templates" },
  { icon: "⚖️", label: "EU Compliance" },
  { icon: "🔔", label: "Notifications" },
  { icon: "📋", label: "Audit Logs" },
  { icon: "🔌", label: "Auto-Connect" },
  { icon: "🔒", label: "Security" },
];

interface SidebarNavProps {
  frame: number;
  activeItem: string;
}

export const SidebarNav: React.FC<SidebarNavProps> = ({ frame, activeItem }) => {
  const fps = 30;

  return (
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
      <div style={{
        padding: "0 16px 14px",
        display: "flex",
        alignItems: "center",
        gap: 8,
        borderBottom: `1px solid ${colors.uiBorder}`,
        marginBottom: 12,
      }}>
        <div style={{
          width: 26, height: 26, borderRadius: 6,
          background: `${colors.gold}dd`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 12, color: colors.bgDeep,
        }}>
          🛡
        </div>
        <div>
          <div style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 13, fontWeight: 700, color: colors.cream, letterSpacing: 1 }}>
            HFAI
          </div>
          <div style={{ fontSize: 9, color: colors.creamDim }}>Customer Portal</div>
        </div>
      </div>

      {sidebarItems.map((item, i) => {
        const isActive = item.label === activeItem;
        const itemIn = spring({ frame: frame - 6 - i * 2, fps, config: { damping: 20, stiffness: 200 } });
        return (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "7px 12px",
              margin: "0 6px",
              borderRadius: 6,
              fontSize: 11.5,
              color: isActive ? colors.cream : colors.creamMuted,
              background: isActive ? `${colors.gold}12` : "transparent",
              fontWeight: isActive ? 500 : 400,
              opacity: itemIn,
            }}
          >
            <span style={{ fontSize: 12, opacity: 0.6 }}>{item.icon}</span>
            {item.label}
          </div>
        );
      })}
    </div>
  );
};
