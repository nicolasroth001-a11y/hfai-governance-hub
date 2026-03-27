import React from "react";
import { interpolate } from "remotion";
import { colors } from "../theme";

// Cursor follows a scripted path through the demo
const cursorPath = [
  // Phase 1: Dashboard - idle center
  { frame: 0, x: 800, y: 400 },
  { frame: 280, x: 800, y: 400 },
  // Phase 2: Event arrives - move to event feed
  { frame: 320, x: 1100, y: 280 },
  { frame: 500, x: 1100, y: 320 },
  { frame: 640, x: 1100, y: 320 },
  // Phase 3: Violation - move to violation card
  { frame: 700, x: 900, y: 350 },
  { frame: 850, x: 600, y: 380 },
  { frame: 1000, x: 600, y: 380 },
  // Phase 4: Reviewer - click confirm
  { frame: 1060, x: 500, y: 500 },
  { frame: 1200, x: 680, y: 560 },
  // Click animation
  { frame: 1230, x: 680, y: 560 },
  { frame: 1260, x: 680, y: 560 },
  { frame: 1420, x: 680, y: 400 },
  // Phase 5: Audit trail
  { frame: 1480, x: 800, y: 350 },
  { frame: 1800, x: 800, y: 350 },
];

export const Cursor: React.FC<{ frame: number }> = ({ frame }) => {
  // Hide cursor initially
  if (frame < 300) return null;

  // Find current segment
  let x = cursorPath[0].x;
  let y = cursorPath[0].y;

  for (let i = 0; i < cursorPath.length - 1; i++) {
    const curr = cursorPath[i];
    const next = cursorPath[i + 1];
    if (frame >= curr.frame && frame <= next.frame) {
      x = interpolate(frame, [curr.frame, next.frame], [curr.x, next.x], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      });
      y = interpolate(frame, [curr.frame, next.frame], [curr.y, next.y], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      });
      break;
    }
    if (frame > next.frame) {
      x = next.x;
      y = next.y;
    }
  }

  // Click effect around frame 1230
  const isClicking = frame >= 1225 && frame <= 1245;
  const clickScale = isClicking ? 0.85 : 1;

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: 20,
        height: 20,
        transform: `scale(${clickScale})`,
        zIndex: 1000,
        pointerEvents: "none",
      }}
    >
      {/* Cursor SVG */}
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path
          d="M2 2L8 18L10.5 10.5L18 8L2 2Z"
          fill="white"
          stroke={colors.bgDeep}
          strokeWidth="1.5"
        />
      </svg>
      {/* Click ripple */}
      {isClicking && (
        <div
          style={{
            position: "absolute",
            top: -8,
            left: -8,
            width: 36,
            height: 36,
            borderRadius: "50%",
            border: `2px solid ${colors.gold}60`,
            opacity: interpolate(frame, [1225, 1245], [1, 0], { extrapolateRight: "clamp" }),
            transform: `scale(${interpolate(frame, [1225, 1245], [0.5, 1.5], { extrapolateRight: "clamp" })})`,
          }}
        />
      )}
    </div>
  );
};
