import React from "react";
import { interpolate } from "remotion";
import { colors } from "../theme";

const cursorPath: { frame: number; x: number; y: number }[] = [
  { frame: 0, x: 600, y: 350 },
  { frame: 200, x: 600, y: 350 },
  { frame: 260, x: 90, y: 210 },
  { frame: 290, x: 90, y: 210 },
  { frame: 340, x: 500, y: 260 },
  { frame: 500, x: 400, y: 200 },
  { frame: 550, x: 90, y: 240 },
  { frame: 590, x: 90, y: 240 },
  { frame: 650, x: 400, y: 230 },
  { frame: 800, x: 200, y: 210 },
  { frame: 840, x: 200, y: 210 },
  { frame: 900, x: 600, y: 280 },
  { frame: 1050, x: 500, y: 350 },
  { frame: 1100, x: 650, y: 440 },
  { frame: 1250, x: 720, y: 480 },
  { frame: 1300, x: 350, y: 520 },
  { frame: 1330, x: 350, y: 520 },
  { frame: 1400, x: 90, y: 340 },
  { frame: 1440, x: 400, y: 300 },
  { frame: 1600, x: 400, y: 400 },
  { frame: 1700, x: 400, y: 350 },
];

interface Props {
  frame: number;
}

export const Cursor: React.FC<Props> = ({ frame }) => {
  if (frame < 50 || frame > 1700) return null;

  let x = cursorPath[0].x;
  let y = cursorPath[0].y;

  for (let i = 0; i < cursorPath.length - 1; i++) {
    const curr = cursorPath[i];
    const next = cursorPath[i + 1];
    if (frame >= curr.frame && frame <= next.frame) {
      x = interpolate(frame, [curr.frame, next.frame], [curr.x, next.x], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      y = interpolate(frame, [curr.frame, next.frame], [curr.y, next.y], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      break;
    }
    if (frame > next.frame) { x = next.x; y = next.y; }
  }

  const clickFrames = [290, 590, 840, 1330, 1440];
  const isClicking = clickFrames.some(cf => frame >= cf && frame < cf + 12);

  return (
    <div style={{ position: "absolute", left: x - 2, top: y - 2, width: 20, height: 20, pointerEvents: "none", zIndex: 100, transform: `scale(${isClicking ? 0.85 : 1})`, filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))" }}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M5 3L19 12L12 13L9 20L5 3Z" fill="white" stroke={colors.bgDeep} strokeWidth="1.5" />
      </svg>
      {isClicking && <div style={{ position: "absolute", top: -4, left: -4, width: 28, height: 28, borderRadius: "50%", border: `2px solid ${colors.gold}60`, opacity: 0.6 }} />}
    </div>
  );
};
