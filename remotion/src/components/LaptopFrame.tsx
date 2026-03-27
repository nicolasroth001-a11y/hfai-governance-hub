import React from "react";
import { colors } from "../theme";

export const LaptopFrame: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Screen */}
      <div
        style={{
          flex: 1,
          background: colors.laptopBezel,
          borderRadius: "16px 16px 0 0",
          padding: 6,
          display: "flex",
          flexDirection: "column",
          boxShadow: `0 -2px 40px ${colors.gold}08`,
        }}
      >
        {/* Browser chrome */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 14px",
            background: colors.uiSidebar,
            borderRadius: "12px 12px 0 0",
            borderBottom: `1px solid ${colors.uiBorder}`,
          }}
        >
          {/* Traffic lights */}
          <div style={{ display: "flex", gap: 6 }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#ff5f57" }} />
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#febc2e" }} />
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#28c840" }} />
          </div>

          {/* URL bar */}
          <div
            style={{
              flex: 1,
              marginLeft: 40,
              marginRight: 60,
              background: colors.uiBg,
              borderRadius: 6,
              padding: "5px 14px",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <span style={{ fontSize: 10, color: colors.green }}>🔒</span>
            <span
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: 11,
                color: colors.creamMuted,
              }}
            >
              app.humanfirstai.com/dashboard
            </span>
          </div>
        </div>

        {/* Content area */}
        <div
          style={{
            flex: 1,
            background: colors.uiBg,
            borderRadius: "0 0 8px 8px",
            overflow: "hidden",
            position: "relative",
          }}
        >
          {children}
        </div>
      </div>

      {/* Laptop base/keyboard */}
      <div
        style={{
          height: 28,
          background: `linear-gradient(180deg, ${colors.laptopFrame} 0%, ${colors.laptopBezel} 100%)`,
          borderRadius: "0 0 8px 8px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {/* Trackpad hint */}
        <div
          style={{
            width: 120,
            height: 4,
            borderRadius: 2,
            background: colors.laptopKey,
          }}
        />
      </div>
    </div>
  );
};
