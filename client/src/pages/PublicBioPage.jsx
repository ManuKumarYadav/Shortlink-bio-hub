import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { bioApi } from "../api/client";
import { ExternalLink, Sparkles, Link2, CheckCircle2 } from "lucide-react";
import { SocialIcon } from "../components/SocialIcons";
import { Avatar } from "../components/Avatar";

export const PublicBioPage = () => {
  const { username } = useParams();

  const [loading, setLoading] = useState(true);
  const [bio, setBio] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPublicBio = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await bioApi.getPublicBio(username);
        if (res.data?.success && res.data?.bio) {
          setBio(res.data.bio);
        } else {
          setError("Bio profile not found");
        }
      } catch (err) {
        setError(err.response?.data?.message || "Bio profile not found");
      } finally {
        setLoading(false);
      }
    };

    if (username) {
      fetchPublicBio();
    }
  }, [username]);

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#07090e",
          color: "var(--text-muted)",
          gap: "1rem",
        }}
      >
        <div className="pulse-dot indigo" style={{ width: "16px", height: "16px" }} />
        <span style={{ fontSize: "0.95rem", fontWeight: "600" }}>Loading creator profile...</span>
      </div>
    );
  }

  if (error || !bio) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
          background: "#07090e",
          textAlign: "center",
          gap: "1.25rem",
        }}
      >
        <div
          style={{
            width: "60px",
            height: "60px",
            borderRadius: "50%",
            background: "rgba(244, 63, 94, 0.15)",
            color: "#f43f5e",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Link2 size={30} />
        </div>
        <h2 style={{ fontSize: "1.6rem", fontWeight: "800" }}>Profile Not Found</h2>
        <p style={{ color: "var(--text-muted)", maxWidth: "360px", fontSize: "0.95rem" }}>
          The bio hub <strong>@{username}</strong> doesn&apos;t exist or is currently unpublished.
        </p>
        <Link to="/" className="btn btn-primary" style={{ marginTop: "0.5rem" }}>
          Create Your Own Bio Hub
        </Link>
      </div>
    );
  }

  // Determine theme class for all 6 themes
  const getThemeClass = () => {
    switch (bio.theme) {
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
    <div
      className={getThemeClass()}
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "4.5rem 1.5rem 3.5rem 1.5rem",
        transition: "all 0.3s ease",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "480px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {/* Creator Avatar */}
        <div style={{ marginBottom: "1rem" }}>
          <Avatar
            avatarUrl={bio.avatarUrl}
            name={bio.displayName || bio.username}
            size={96}
            fontSize="2.25rem"
            className="bio-avatar-ring"
          />
        </div>

        {/* Display Name & Verified Check */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.4rem",
            marginBottom: "0.2rem",
          }}
        >
          <h1
            className="bio-title"
            style={{
              fontSize: "1.45rem",
              fontWeight: "900",
              textAlign: "center",
              letterSpacing: "-0.02em",
            }}
          >
            {bio.displayName || bio.username}
          </h1>
          <CheckCircle2 size={18} fill="#38bdf8" color="#ffffff" />
        </div>

        {/* Handle */}
        <span
          style={{
            fontSize: "0.85rem",
            opacity: 0.75,
            marginBottom: "0.85rem",
            fontWeight: "600",
          }}
        >
          @{bio.username}
        </span>

        {/* Bio Description */}
        {bio.bio && (
          <p
            className="bio-desc"
            style={{
              fontSize: "0.925rem",
              textAlign: "center",
              lineHeight: 1.55,
              marginBottom: "1.65rem",
              maxWidth: "380px",
            }}
          >
            {bio.bio}
          </p>
        )}

        {/* Social Icons Row */}
        {bio.socialLinks && bio.socialLinks.length > 0 && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexWrap: "wrap",
              gap: "0.65rem",
              marginBottom: "1.85rem",
              width: "100%",
            }}
          >
            {bio.socialLinks.map((item, idx) => (
              <a
                key={idx}
                href={item.url}
                target="_blank"
                rel="noreferrer"
                className="bio-social-icon"
                style={{
                  width: "42px",
                  height: "42px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  transition: "all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)",
                  textDecoration: "none",
                }}
                title={item.platform}
              >
                <SocialIcon platform={item.platform} size={19} />
              </a>
            ))}
          </div>
        )}

        {/* Custom Links List */}
        <div
          style={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            gap: "0.85rem",
            marginBottom: "3rem",
          }}
        >
          {bio.links && bio.links.length > 0 ? (
            bio.links
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
                    padding: "1rem 1.35rem",
                    borderRadius: "18px",
                    fontSize: "0.95rem",
                    fontWeight: "700",
                    transition: "all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)",
                    textDecoration: "none",
                    letterSpacing: "-0.01em",
                  }}
                >
                  <span
                    style={{
                      flex: 1,
                      textAlign: "center",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {link.title}
                  </span>
                  <ExternalLink size={15} opacity={0.65} />
                </a>
              ))
          ) : (
            <div
              style={{
                textAlign: "center",
                padding: "2rem 1rem",
                opacity: 0.6,
                fontSize: "0.9rem",
              }}
            >
              No links available on this hub yet.
            </div>
          )}
        </div>

        {/* Footer Brand Link */}
        <Link
          to="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.4rem",
            fontSize: "0.8rem",
            fontWeight: "700",
            opacity: 0.75,
            padding: "0.5rem 1rem",
            borderRadius: "var(--radius-full)",
            background: "rgba(255, 255, 255, 0.06)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <Sparkles size={13} />
          <span>Create your own with <strong>ShortHub</strong></span>
        </Link>
      </div>
    </div>
  );
};
