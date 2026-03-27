import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { loadFont } from "@remotion/google-fonts/SpaceGrotesk";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { colors } from "../theme";

const { fontFamily: displayFont } = loadFont("normal", { weights: ["700"], subsets: ["latin"] });
const { fontFamily: bodyFont } = loadInter("normal", { weights: ["400"], subsets: ["latin"] });

export const Scene1Hook = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // "Everyone's using AI" text
  const line1In = spring({ frame, fps, config: { damping: 20, stiffness: 180 } });
  const line1X = interpolate(line1In, [0, 1], [-80, 0]);

  // Counter animation
  const counter = Math.min(Math.floor(interpolate(frame, [20, 120], [0, 78], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })), 78);

  // "But who's watching?" text
  const line2In = spring({ frame: frame - 90, fps, config: { damping: 15, stiffness: 150 } });
  const line2Y = interpolate(line2In, [0, 1], [40, 0]);

  // Emphasis pulse on "watching"
  const pulseScale = frame > 120 ? interpolate(
    Math.sin((frame - 120) * 0.08),
    [-1, 1],
    [1, 1.02]
  ) : 1;

  // AI company logos flowing
  const logoScroll = interpolate(frame, [0, 330], [0, -600]);

  const aiNames = ["ChatGPT", "Claude", "Gemini", "Copilot", "Midjourney", "Llama", "Stable Diffusion", "DALL·E", "Perplexity", "Mistral"];

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      {/* Scrolling AI names in background */}
      <div style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: "hidden",
        opacity: 0.06,
      }}>
        {[0, 1, 2].map((row) => (
          <div
            key={row}
            style={{
              display: "flex",
              gap: 60,
              position: "absolute",
              top: 200 + row * 250,
              left: logoScroll + row * 200,
              whiteSpace: "nowrap",
            }}
          >
            {[...aiNames, ...aiNames].map((name, i) => (
              <span
                key={i}
                style={{
                  fontFamily: displayFont,
                  fontSize: 120,
                  fontWeight: 700,
                  color: colors.cream,
                }}
              >
                {name}
              </span>
            ))}
          </div>
        ))}
      </div>

      <div style={{ textAlign: "center", zIndex: 1 }}>
        {/* Line 1 */}
        <div
          style={{
            fontFamily: displayFont,
            fontSize: 72,
            fontWeight: 700,
            color: colors.cream,
            opacity: line1In,
            transform: `translateX(${line1X}px)`,
            marginBottom: 24,
          }}
        >
          <span style={{ color: colors.gold }}>{counter}%</span> of enterprises use AI
        </div>

        {/* Line 2 */}
        <div
          style={{
            fontFamily: displayFont,
            fontSize: 84,
            fontWeight: 700,
            color: colors.cream,
            opacity: line2In,
            transform: `translateY(${line2Y}px) scale(${pulseScale})`,
            marginTop: 20,
          }}
        >
          But <span style={{ color: colors.red }}>who's watching?</span>
        </div>

        {/* Subline */}
        {frame > 140 && (
          <div
            style={{
              fontFamily: bodyFont,
              fontSize: 28,
              color: colors.creamMuted,
              marginTop: 40,
              opacity: interpolate(frame, [140, 170], [0, 1], { extrapolateRight: "clamp" }),
              transform: `translateY(${interpolate(frame, [140, 170], [15, 0], { extrapolateRight: "clamp" })}px)`,
            }}
          >
            AI is moving fast. Governance isn't keeping up.
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};
