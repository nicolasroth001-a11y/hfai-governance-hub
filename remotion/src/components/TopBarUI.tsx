import React from "react";
import { colors } from "../theme";

interface TopBarUIProps {
  email: string;
}

export const TopBarUI: React.FC<TopBarUIProps> = ({ email }) => {
  return (
    <div style={{
      height: 42,
      display: "flex",
      alignItems: "center",
      borderBottom: `1px solid ${colors.uiBorder}`,
      padding: "0 20px",
      justifyContent: "flex-end",
      gap: 12,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 5,
          background: colors.greenBg,
          border: `1px solid ${colors.green}30`,
          borderRadius: 12,
          padding: "3px 10px",
          fontSize: 9,
          color: colors.green,
        }}>
          <div style={{ width: 4, height: 4, borderRadius: "50%", background: colors.green }} />
          All systems operational
        </div>
      </div>
      <div style={{ height: 14, width: 1, background: colors.uiBorder }} />
      <span style={{ fontSize: 10, color: colors.creamDim }}>{email}</span>
      <div style={{ height: 14, width: 1, background: colors.uiBorder }} />
      <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: colors.creamDim, cursor: "pointer" }}>
        ↪ Log out
      </div>
    </div>
  );
};
