import { ExternalLink, Sparkles, Wifi, BatteryCharging, CheckCircle2 } from "lucide-react";
import { SocialIcon } from "./SocialIcons";
import { Avatar } from "./Avatar";

export const PhoneSimulator = ({ bioData }) => {
  const {
    displayName = "Your Name",
    username = "username",
    bio = "Creator, designer & developer. Sharing my best links and resources.",
    avatarUrl = "",
    theme = "dark-slate",
    socialLinks = [],
    links = [],
    isVerified = true,
  } = bioData || {};

  // Theme class mapping for all 6 themes
  const getThemeClass = () => {
    switch (theme) {
      case "minimal-light":
        return "theme-minimal-light";
      case "gradient":
        return "theme-gradient";
      case "cyberpunk":
        return "theme-cyberpunk";
      case "velvet-crimson":
        return "theme-velvet-crimson";
      case "emerald-matrix":
        return "theme-emerald-matrix";
      case "dark-slate":
      default:
        return "theme-dark-slate";
    }
  };

  return (
    <div className="phone-mockup-wrapper">
      <div className="phone-frame">
        {/* Dynamic Island */}
        <div className="phone-island">
          <div className="phone-island-camera" />
          <div className="phone-island-sensor" />
        </div>

        {/* Screen Content */}
        <div
          className={`phone-screen ${getThemeClass()}`}
          style={{
            padding: "0 1.25rem 1.5rem 1.25rem",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            minHeight: "100%",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          {/* iOS Status Bar */}
          <div className="phone-status-bar">
            <span>9:41</span>
            <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
              <span style={{ fontSize: "0.65rem", fontWeight: "800", opacity: 0.8 }}>5G</span>
              <Wifi size={12} strokeWidth={2.5} />
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "2px",
                  border: "1.5px solid currentColor",
                  borderRadius: "4px",
                  padding: "1px 2px",
                  fontSize: "0.6rem",
                  fontWeight: "800",
                }}
              >
                <span>98</span>
              </div>
            </div>
          </div>

          {/* Screen Glare Highlight */}
          <div className="phone-glare" />

          {/* Profile Card / Avatar */}
          <div style={{ marginTop: "1.25rem", marginBottom: "0.85rem", position: "relative" }}>
            <Avatar
              avatarUrl={avatarUrl}
              name={displayName || username}
              size={84}
              fontSize="1.85rem"
              className="bio-avatar-ring"
            />
          </div>

          {/* Creator Display Name & Verified Badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.35rem",
              marginBottom: "0.15rem",
            }}
          >
            <h2
              className="bio-title"
              style={{
                fontSize: "1.2rem",
                fontWeight: "800",
                textAlign: "center",
                letterSpacing: "-0.02em",
              }}
            >
              {displayName || "Your Name"}
            </h2>
            <CheckCircle2
              size={16}
              fill="#38bdf8"
              color="#ffffff"
              style={{ flexShrink: 0 }}
            />
          </div>

          {/* Creator Handle */}
          <span
            style={{
              fontSize: "0.775rem",
              opacity: 0.7,
              marginBottom: "0.75rem",
              fontWeight: "600",
            }}
          >
            @{username || "username"}
          </span>

          {/* Bio Description */}
          {bio && (
            <p
              className="bio-desc"
              style={{
                fontSize: "0.825rem",
                textAlign: "center",
                lineHeight: 1.5,
                maxWidth: "260px",
                marginBottom: "1.25rem",
                opacity: 0.9,
              }}
            >
              {bio}
            </p>
          )}

          {/* Social Icons Row */}
          {socialLinks && socialLinks.length > 0 && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexWrap: "wrap",
                gap: "0.55rem",
                marginBottom: "1.5rem",
                width: "100%",
              }}
            >
              {socialLinks.map((item, idx) => (
                <a
                  key={idx}
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  className="bio-social-icon"
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    transition: "all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)",
                    textDecoration: "none",
                  }}
                  title={item.platform}
                  onClick={(e) => e.stopPropagation()}
                >
                  <SocialIcon platform={item.platform} size={17} />
                </a>
              ))}
            </div>
          )}

          {/* Custom Link Buttons */}
          <div
            style={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
              marginBottom: "1.5rem",
            }}
          >
            {links && links.length > 0 ? (
              links
                .filter((l) => l.isActive !== false)
                .map((link, idx) => (
                  <a
                    key={idx}
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    className="bio-link-btn"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "0.85rem 1.15rem",
                      borderRadius: "16px",
                      fontSize: "0.875rem",
                      fontWeight: "700",
                      textAlign: "center",
                      transition: "all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)",
                      textDecoration: "none",
                      letterSpacing: "-0.01em",
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span
                      style={{
                        flex: 1,
                        textAlign: "center",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        paddingRight: "0.5rem",
                      }}
                    >
                      {link.title}
                    </span>
                    <ExternalLink size={14} opacity={0.65} style={{ flexShrink: 0 }} />
                  </a>
                ))
            ) : (
              <div
                style={{
                  textAlign: "center",
                  fontSize: "0.8rem",
                  opacity: 0.6,
                  padding: "1.5rem 1rem",
                  border: "1px dashed rgba(255,255,255,0.15)",
                  borderRadius: "16px",
                  background: "rgba(0,0,0,0.1)",
                }}
              >
                No links added yet. Add your links in the customizer!
              </div>
            )}
          </div>

          {/* Powered by ShortHub Badge */}
          <div
            style={{
              marginTop: "auto",
              paddingTop: "1rem",
              paddingBottom: "0.75rem",
              display: "flex",
              alignItems: "center",
              gap: "0.35rem",
              fontSize: "0.7rem",
              opacity: 0.6,
              letterSpacing: "0.02em",
              fontWeight: "600",
            }}
          >
            <Sparkles size={11} />
            <span>Powered by <strong>ShortHub</strong></span>
          </div>

          {/* iOS Home Indicator Bar */}
          <div className="phone-home-bar" />
        </div>
      </div>
    </div>
  );
};
