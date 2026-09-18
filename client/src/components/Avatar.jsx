import { useState } from "react";

/**
 * Avatar component.
 * - Shows the image if avatarUrl is provided AND loads successfully.
 * - Falls back to a gradient circle with the initial letter if:
 *   a) no avatarUrl is provided, OR
 *   b) the image fails to load (broken URL, CORS, non-image link, etc.)
 */
export const Avatar = ({
  avatarUrl = "",
  name = "U",
  size = 80,
  fontSize = "1.75rem",
  fallbackStyle = {},
  className = "",
}) => {
  const [imgError, setImgError] = useState(false);

  const initial = (name || "U")[0].toUpperCase();

  const containerStyle = {
    width: `${size}px`,
    height: `${size}px`,
    borderRadius: "50%",
    overflow: "hidden",
    background: "rgba(255,255,255,0.08)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    position: "relative",
  };

  const fallbackLetterStyle = {
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)",
    fontSize,
    fontWeight: "800",
    color: "#ffffff",
    borderRadius: "50%",
    ...fallbackStyle,
  };

  const showFallback = !avatarUrl || imgError;

  return (
    <div style={containerStyle} className={className}>
      {!showFallback && (
        <img
          src={avatarUrl}
          alt={name}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
          onError={() => setImgError(true)}
        />
      )}
      {showFallback && (
        <div style={fallbackLetterStyle}>{initial}</div>
      )}
    </div>
  );
};
