import { useState, useEffect } from "react";
import { bioApi } from "../api/client";
import { showToast } from "../components/Toast";
import { PhoneSimulator } from "../components/PhoneSimulator";
import { useAuth } from "../context/AuthContext";
import { AVAILABLE_PLATFORMS } from "../components/SocialIcons";
import {
  Sparkles,
  Save,
  Plus,
  Trash2,
  ExternalLink,
  Copy,
  Check,
  Palette,
  Share2,
  Layers,
  Image,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  User,
  CheckCircle2,
  Link as LinkIcon,
} from "lucide-react";

const THEME_OPTIONS = [
  {
    id: "dark-slate",
    name: "Dark Slate",
    subtitle: "Obsidian & Cyan",
    bgPreview: "radial-gradient(circle at 50% 10%, #101626 0%, #080c14 100%)",
    accentColor: "#06b6d4",
    cardBg: "rgba(18, 26, 42, 0.9)",
  },
  {
    id: "gradient",
    name: "Aurora Sunset",
    subtitle: "Violet & Rose",
    bgPreview: "linear-gradient(135deg, #2b0e3f 0%, #15103c 50%, #0d2146 100%)",
    accentColor: "#ec4899",
    cardBg: "rgba(255, 255, 255, 0.15)",
  },
  {
    id: "minimal-light",
    name: "Minimal Light",
    subtitle: "Clean Porcelain",
    bgPreview: "#f8fafc",
    accentColor: "#6366f1",
    cardBg: "#ffffff",
    darkText: true,
  },
  {
    id: "cyberpunk",
    name: "Cyberpunk",
    subtitle: "OLED & Lime",
    bgPreview: "#05070a",
    accentColor: "#84cc16",
    cardBg: "rgba(15, 23, 10, 0.9)",
  },
  {
    id: "velvet-crimson",
    name: "Velvet Crimson",
    subtitle: "Burgundy & Gold",
    bgPreview: "linear-gradient(135deg, #380816 0%, #1f040d 60%, #0d0206 100%)",
    accentColor: "#fb7185",
    cardBg: "rgba(255, 255, 255, 0.1)",
  },
  {
    id: "emerald-matrix",
    name: "Emerald Tech",
    subtitle: "Deep Mint & Matrix",
    bgPreview: "radial-gradient(circle at 50% 20%, #06281e 0%, #03120d 100%)",
    accentColor: "#10b981",
    cardBg: "rgba(6, 40, 30, 0.9)",
  },
];

export const BioBuilderPage = () => {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasBio, setHasBio] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  // Active builder tab ('profile' | 'themes' | 'socials' | 'links' | 'preview')
  const [activeTab, setActiveTab] = useState("profile");

  // Bio state
  const [bioData, setBioData] = useState({
    username: "",
    displayName: "",
    bio: "",
    avatarUrl: "",
    theme: "dark-slate",
    socialLinks: [],
    links: [],
    isPublic: true,
  });

  // Social link inputs
  const [newPlatform, setNewPlatform] = useState("twitter");
  const [newSocialHandle, setNewSocialHandle] = useState("");

  // Custom link inputs
  const [newLinkTitle, setNewLinkTitle] = useState("");
  const [newLinkUrl, setNewLinkUrl] = useState("");

  // Load creator's bio profile on mount
  useEffect(() => {
    const fetchBio = async () => {
      try {
        setLoading(true);
        const res = await bioApi.getMyBio();
        if (res.data?.success && res.data?.bio) {
          setBioData(res.data.bio);
          setHasBio(true);
        }
      } catch (err) {
        const defaultUser = user?.name
          ? user.name.toLowerCase().replace(/[^a-z0-9]/g, "")
          : "creator";
        setBioData((prev) => ({
          ...prev,
          username: defaultUser,
          displayName: user?.name || "My Creator Hub",
          bio: "Welcome to my link-in-bio hub! Explore my work and social channels below.",
          theme: "dark-slate",
        }));
        setHasBio(false);
      } finally {
        setLoading(false);
      }
    };

    fetchBio();
  }, [user]);

  // Handle Save
  const handleSave = async () => {
    if (!bioData.username.trim()) {
      showToast("Username handle is required", "error");
      return;
    }

    try {
      setSaving(true);
      if (hasBio) {
        const res = await bioApi.updateBio(bioData);
        if (res.data?.success) {
          showToast("Bio Hub updated successfully!");
          setBioData(res.data.bio);
          setIsDirty(false);
        }
      } else {
        const res = await bioApi.createBio(bioData);
        if (res.data?.success) {
          showToast("Bio Hub created successfully!");
          setBioData(res.data.bio);
          setHasBio(true);
          setIsDirty(false);
        }
      }
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to save bio profile", "error");
    } finally {
      setSaving(false);
    }
  };

  // Update bio field helper
  const updateBioField = (field, value) => {
    setBioData((prev) => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  // Add social link with auto-prefix
  const handleAddSocialLink = () => {
    if (!newSocialHandle.trim()) return;

    let finalUrl = newSocialHandle.trim();
    const platformConfig = AVAILABLE_PLATFORMS.find((p) => p.id === newPlatform);

    if (platformConfig && !finalUrl.startsWith("http://") && !finalUrl.startsWith("https://") && !finalUrl.startsWith("mailto:")) {
      const cleanHandle = finalUrl.replace(/^@/, "");
      finalUrl = `${platformConfig.prefix}${cleanHandle}`;
    }

    const updated = [
      ...bioData.socialLinks,
      { platform: newPlatform, url: finalUrl },
    ];
    updateBioField("socialLinks", updated);
    setNewSocialHandle("");
  };

  // Remove social link
  const handleRemoveSocialLink = (index) => {
    const updated = bioData.socialLinks.filter((_, i) => i !== index);
    updateBioField("socialLinks", updated);
  };

  // Add custom link button
  const handleAddCustomLink = () => {
    if (!newLinkTitle.trim() || !newLinkUrl.trim()) {
      showToast("Both title and valid URL are required", "error");
      return;
    }

    let formattedUrl = newLinkUrl.trim();
    if (!formattedUrl.startsWith("http://") && !formattedUrl.startsWith("https://")) {
      formattedUrl = `https://${formattedUrl}`;
    }

    const updated = [
      ...bioData.links,
      {
        title: newLinkTitle.trim(),
        url: formattedUrl,
        isActive: true,
        order: bioData.links.length + 1,
      },
    ];
    updateBioField("links", updated);
    setNewLinkTitle("");
    setNewLinkUrl("");
  };

  // Move custom link up/down
  const handleMoveLink = (index, direction) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= bioData.links.length) return;
    const updated = [...bioData.links];
    const temp = updated[index];
    updated[index] = updated[newIndex];
    updated[newIndex] = temp;
    updateBioField("links", updated);
  };

  // Toggle custom link active state
  const handleToggleLinkActive = (index) => {
    const updated = [...bioData.links];
    updated[index].isActive = !updated[index].isActive;
    updateBioField("links", updated);
  };

  // Remove custom link
  const handleRemoveCustomLink = (index) => {
    const updated = bioData.links.filter((_, i) => i !== index);
    updateBioField("links", updated);
  };

  // Public URL
  const publicUrl = `${window.location.protocol}//${window.location.host}/bio/${bioData.username}`;

  const handleCopyPublicUrl = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    showToast("Public bio link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div
        className="app-container"
        style={{
          padding: "8rem 2rem",
          textAlign: "center",
          color: "var(--text-muted)",
        }}
      >
        <div className="pulse-dot indigo" style={{ width: "16px", height: "16px", marginBottom: "1rem" }} />
        <p style={{ fontSize: "1rem", fontWeight: "600" }}>Loading your Bio Hub studio...</p>
      </div>
    );
  }

  return (
    <div className="app-container" style={{ padding: "2.5rem 1.5rem 6rem 1.5rem" }}>
      {/* Top Header & Global Actions */}
      <div className="bio-builder-header">
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.3rem" }}>
            <span className="badge badge-emerald">
              <Sparkles size={12} /> Link-in-Bio Studio
            </span>
            {isDirty && (
              <span className="badge badge-cyan" style={{ animation: "fadeIn 0.2s" }}>
                ● Unsaved
              </span>
            )}
          </div>
          <h1 className="bio-builder-title">
            Hub <span className="text-gradient">Customizer</span>
          </h1>
          <p className="bio-builder-desc">
            Design your branded creator profile, select visual themes, and preview live on iPhone 16 Pro.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="bio-header-actions">
          <button onClick={handleCopyPublicUrl} className="btn btn-secondary">
            {copied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
            <span>{copied ? "Copied" : "Copy Link"}</span>
          </button>

          <a
            href={publicUrl}
            target="_blank"
            rel="noreferrer"
            className="btn btn-secondary"
          >
            <ExternalLink size={14} />
            <span>View Live</span>
          </a>

          <button
            onClick={handleSave}
            disabled={saving}
            className="btn btn-primary"
          >
            <Save size={15} />
            <span>{saving ? "Publishing..." : isDirty ? "Save & Publish" : "All Saved"}</span>
          </button>
        </div>
      </div>

      {/* Segmented Section Tabs */}
      <div
        style={{
          display: "flex",
          gap: "0.45rem",
          marginBottom: "1.25rem",
          overflowX: "auto",
          paddingBottom: "0.35rem",
          WebkitOverflowScrolling: "touch",
          scrollbarWidth: "none",
        }}
      >
        {[
          { id: "profile", label: "Profile & Bio", icon: <User size={14} /> },
          { id: "themes", label: "Themes & Presets", icon: <Palette size={14} /> },
          { id: "socials", label: "Social Icons", icon: <Share2 size={14} /> },
          { id: "links", label: "Link Buttons", icon: <Layers size={14} /> },
          { id: "preview", label: "Live Preview 📱", icon: <Eye size={14} />, isPreview: true },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={tab.isPreview ? "bio-tab-preview" : ""}
            onClick={() => setActiveTab(tab.id)}
            style={{
              alignItems: "center",
              gap: "0.45rem",
              padding: "0.5rem 1rem",
              borderRadius: "var(--radius-full)",
              fontSize: "0.825rem",
              fontWeight: "700",
              cursor: "pointer",
              border: activeTab === tab.id ? "1px solid var(--border-focus)" : "1px solid var(--border-subtle)",
              background: activeTab === tab.id ? "rgba(99, 102, 241, 0.22)" : "rgba(255, 255, 255, 0.03)",
              color: activeTab === tab.id ? "#ffffff" : "var(--text-secondary)",
              transition: "all var(--transition-fast)",
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Split Workspace Layout */}
      <div className="bio-builder-workspace">
        {/* Left Column: Form Controls */}
        <div
          className={`bio-col-editor ${activeTab === "preview" ? "hide-on-mobile" : ""}`}
          style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}
        >
          {/* SECTION 1: PROFILE & BIO */}
          {(activeTab === "profile" || activeTab === "all") && (
            <div className="glass-card bio-card" style={{ padding: "1.85rem" }}>
              <h3
                style={{
                  fontSize: "1.15rem",
                  fontWeight: "800",
                  marginBottom: "1.5rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.6rem",
                }}
              >
                <div
                  style={{
                    width: "30px",
                    height: "30px",
                    borderRadius: "8px",
                    background: "rgba(99, 102, 241, 0.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--accent-indigo)",
                  }}
                >
                  <User size={16} />
                </div>
                Profile Details & Branding
              </h3>

              <div className="form-group">
                <label className="form-label">
                  <span>Vanity Handle / URL</span>
                  <span style={{ fontSize: "0.75rem", color: "var(--accent-cyan)", fontFamily: "var(--font-mono)" }}>
                    shortlink.bio/{bioData.username}
                  </span>
                </label>
                <input
                  type="text"
                  required
                  className="input-field"
                  placeholder="yourname"
                  value={bioData.username}
                  onChange={(e) =>
                    updateBioField("username", e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""))
                  }
                />
              </div>

              <div className="form-group">
                <label className="form-label">Display Name</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Alex Rivera"
                  value={bioData.displayName}
                  onChange={(e) => updateBioField("displayName", e.target.value)}
                />
              </div>

              {/* ── Profile Photo URL ── */}
              <div className="form-group">
                <label className="form-label">
                  <span>Profile Photo</span>
                  <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Paste an image URL</span>
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type="url"
                    className="input-field"
                    placeholder="https://example.com/your-photo.jpg"
                    value={bioData.avatarUrl?.startsWith("data:") ? "" : bioData.avatarUrl}
                    onChange={(e) => updateBioField("avatarUrl", e.target.value)}
                    style={{ paddingRight: bioData.avatarUrl && !bioData.avatarUrl.startsWith("data:") ? "2.5rem" : "0.9rem", fontSize: "0.85rem" }}
                  />
                  {bioData.avatarUrl && !bioData.avatarUrl.startsWith("data:") && (
                    <button
                      type="button"
                      onClick={() => updateBioField("avatarUrl", "")}
                      title="Clear"
                      style={{
                        position: "absolute", right: "0.5rem", top: "50%", transform: "translateY(-50%)",
                        background: "rgba(255,255,255,0.07)", border: "1px solid var(--border-subtle)",
                        borderRadius: "5px", color: "var(--text-muted)", padding: "3px 6px",
                        cursor: "pointer", fontSize: "0.68rem", lineHeight: 1,
                      }}
                    >✕</button>
                  )}
                </div>
                {bioData.avatarUrl && !bioData.avatarUrl.startsWith("data:") && (
                  <p style={{ fontSize: "0.68rem", color: "#a5b4fc", margin: "0.3rem 0 0" }}>
                    🔗 Using image URL
                    {" — "}
                    <button
                      type="button"
                      onClick={() => updateBioField("avatarUrl", "")}
                      style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "0.68rem", textDecoration: "underline", padding: 0 }}
                    >Remove</button>
                  </p>
                )}
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">
                  <span>Bio Description</span>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                    {bioData.bio?.length || 0}/160 characters
                  </span>
                </label>
                <textarea
                  className="input-field"
                  rows={3}
                  maxLength={180}
                  placeholder="Tell your audience who you are, what you build, and where to find your work..."
                  value={bioData.bio}
                  onChange={(e) => updateBioField("bio", e.target.value)}
                />
              </div>

            </div>
          )}

          {/* SECTION 2: THEMES SELECTOR */}
          {(activeTab === "themes" || activeTab === "all") && (
            <div className="glass-card bio-card" style={{ padding: "1.85rem" }}>
              <div style={{ marginBottom: "1.25rem" }}>
                <h3
                  style={{
                    fontSize: "1.15rem",
                    fontWeight: "800",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.6rem",
                  }}
                >
                  <div
                    style={{
                      width: "30px",
                      height: "30px",
                      borderRadius: "8px",
                      background: "rgba(6, 182, 212, 0.15)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "var(--accent-cyan)",
                    }}
                  >
                    <Palette size={16} />
                  </div>
                  Premium Visual Themes
                </h3>
                <p style={{ fontSize: "0.825rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
                  Select from 6 bespoke handcrafted themes optimized for contrast and elegance.
                </p>
              </div>

              <div className="bio-themes-grid">
                {THEME_OPTIONS.map((t) => {
                  const isSelected = bioData.theme === t.id;
                  return (
                    <div
                      key={t.id}
                      onClick={() => updateBioField("theme", t.id)}
                      style={{
                        padding: "1rem",
                        borderRadius: "var(--radius-md)",
                        border: isSelected
                          ? `2px solid ${t.accentColor}`
                          : "1px solid var(--border-subtle)",
                        background: "rgba(255, 255, 255, 0.02)",
                        cursor: "pointer",
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.75rem",
                        transition: "all var(--transition-normal)",
                        boxShadow: isSelected
                          ? `0 0 25px ${t.accentColor}33, var(--shadow-sm)`
                          : "none",
                        transform: isSelected ? "scale(1.02)" : "none",
                      }}
                    >
                      {/* Mini Preview Box */}
                      <div
                        style={{
                          height: "70px",
                          borderRadius: "10px",
                          background: t.bgPreview,
                          border: "1px solid rgba(255,255,255,0.1)",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "4px",
                          padding: "6px",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            width: "18px",
                            height: "18px",
                            borderRadius: "50%",
                            border: `2px solid ${t.accentColor}`,
                            background: "rgba(255,255,255,0.2)",
                          }}
                        />
                        <div
                          style={{
                            width: "70%",
                            height: "8px",
                            borderRadius: "4px",
                            background: t.cardBg,
                            border: `1px solid ${t.accentColor}55`,
                          }}
                        />
                      </div>

                      <div>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <span style={{ fontSize: "0.875rem", fontWeight: "700" }}>{t.name}</span>
                          {isSelected && <Check size={14} color={t.accentColor} />}
                        </div>
                        <span style={{ fontSize: "0.725rem", color: "var(--text-muted)" }}>
                          {t.subtitle}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* SECTION 3: SOCIAL CHANNEL ICONS */}
          {(activeTab === "socials" || activeTab === "all") && (
            <div className="glass-card bio-card" style={{ padding: "1.85rem" }}>
              <div style={{ marginBottom: "1.25rem" }}>
                <h3
                  style={{
                    fontSize: "1.15rem",
                    fontWeight: "800",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.6rem",
                  }}
                >
                  <div
                    style={{
                      width: "30px",
                      height: "30px",
                      borderRadius: "8px",
                      background: "rgba(16, 185, 129, 0.15)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "var(--accent-emerald)",
                    }}
                  >
                    <Share2 size={16} />
                  </div>
                  Social Channel Icons
                </h3>
                <p style={{ fontSize: "0.825rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
                  Connect your Twitter, GitHub, YouTube, Instagram, Spotify, and more.
                </p>
              </div>

              {/* Existing Social Links List */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.65rem",
                  marginBottom: "1.25rem",
                }}
              >
                {bioData.socialLinks.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "0.65rem 1rem",
                      background: "rgba(255, 255, 255, 0.03)",
                      border: "1px solid var(--border-subtle)",
                      borderRadius: "var(--radius-sm)",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", minWidth: 0 }}>
                      <span
                        style={{
                          textTransform: "capitalize",
                          fontWeight: "700",
                          fontSize: "0.85rem",
                          color: "var(--text-primary)",
                          minWidth: "75px",
                        }}
                      >
                        {item.platform}
                      </span>
                      <span
                        style={{
                          fontSize: "0.8rem",
                          color: "var(--text-muted)",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {item.url}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveSocialLink(idx)}
                      className="btn btn-danger btn-icon"
                      style={{ width: "30px", height: "30px" }}
                      title="Remove"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add Social Input Bar */}
              <div className="bio-social-input-row">
                <select
                  className="input-field"
                  style={{ width: "160px", textTransform: "capitalize" }}
                  value={newPlatform}
                  onChange={(e) => setNewPlatform(e.target.value)}
                >
                  {AVAILABLE_PLATFORMS.map((p) => (
                    <option key={p.id} value={p.id} style={{ background: "#0e1320" }}>
                      {p.name}
                    </option>
                  ))}
                </select>

                <input
                  type="text"
                  placeholder="username or URL..."
                  className="input-field"
                  style={{ flex: 1, minWidth: "180px" }}
                  value={newSocialHandle}
                  onChange={(e) => setNewSocialHandle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddSocialLink();
                    }
                  }}
                />

                <button
                  type="button"
                  onClick={handleAddSocialLink}
                  className="btn btn-secondary"
                  style={{ padding: "0.65rem 1.15rem" }}
                >
                  <Plus size={16} /> Add Icon
                </button>
              </div>
            </div>
          )}

          {/* SECTION 4: CUSTOM LINK BUTTONS */}
          {(activeTab === "links" || activeTab === "all") && (
            <div className="glass-card bio-card" style={{ padding: "1.85rem" }}>
              <div style={{ marginBottom: "1.25rem" }}>
                <h3
                  style={{
                    fontSize: "1.15rem",
                    fontWeight: "800",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.6rem",
                  }}
                >
                  <div
                    style={{
                      width: "30px",
                      height: "30px",
                      borderRadius: "8px",
                      background: "rgba(139, 92, 246, 0.15)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "var(--accent-violet)",
                    }}
                  >
                    <Layers size={16} />
                  </div>
                  Link Buttons (Linktree Style)
                </h3>
                <p style={{ fontSize: "0.825rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
                  Add your high-converting links, articles, store items, and portfolio items.
                </p>
              </div>

              {/* Links List */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.75rem",
                  marginBottom: "1.5rem",
                }}
              >
                {bioData.links.map((link, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "0.85rem 1rem",
                      background: "rgba(255, 255, 255, 0.03)",
                      border: "1px solid var(--border-subtle)",
                      borderRadius: "var(--radius-md)",
                      gap: "0.75rem",
                    }}
                  >
                    {/* Reorder Arrows */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => handleMoveLink(idx, -1)}
                        style={{
                          background: "none",
                          border: "none",
                          color: idx === 0 ? "rgba(255,255,255,0.15)" : "var(--text-secondary)",
                          cursor: idx === 0 ? "not-allowed" : "pointer",
                          padding: "2px",
                        }}
                      >
                        <ArrowUp size={13} />
                      </button>
                      <button
                        type="button"
                        disabled={idx === bioData.links.length - 1}
                        onClick={() => handleMoveLink(idx, 1)}
                        style={{
                          background: "none",
                          border: "none",
                          color: idx === bioData.links.length - 1 ? "rgba(255,255,255,0.15)" : "var(--text-secondary)",
                          cursor: idx === bioData.links.length - 1 ? "not-allowed" : "pointer",
                          padding: "2px",
                        }}
                      >
                        <ArrowDown size={13} />
                      </button>
                    </div>

                    {/* Title & URL */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: "700", fontSize: "0.925rem" }}>
                        {link.title}
                      </div>
                      <div
                        style={{
                          fontSize: "0.775rem",
                          color: "var(--text-muted)",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {link.url}
                      </div>
                    </div>

                    {/* Actions: Visibility & Delete */}
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <button
                        type="button"
                        onClick={() => handleToggleLinkActive(idx)}
                        className="btn btn-secondary btn-icon"
                        style={{ width: "32px", height: "32px" }}
                        title={link.isActive ? "Hide Link" : "Show Link"}
                      >
                        {link.isActive ? <Eye size={15} color="#10b981" /> : <EyeOff size={15} color="var(--text-muted)" />}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleRemoveCustomLink(idx)}
                        className="btn btn-danger btn-icon"
                        style={{ width: "32px", height: "32px" }}
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Custom Link Form */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
                  <input
                    type="text"
                    placeholder="Button Title (e.g. My Latest YouTube Video)"
                    className="input-field"
                    style={{ flex: "1 1 200px" }}
                    value={newLinkTitle}
                    onChange={(e) => setNewLinkTitle(e.target.value)}
                  />
                  <input
                    type="url"
                    placeholder="Target URL (https://...)"
                    className="input-field"
                    style={{ flex: "1 1 240px" }}
                    value={newLinkUrl}
                    onChange={(e) => setNewLinkUrl(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddCustomLink();
                      }
                    }}
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddCustomLink}
                  className="btn btn-secondary"
                  style={{ width: "100%", padding: "0.75rem" }}
                >
                  <Plus size={16} /> Add Link Button
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Live iPhone 16 Pro Simulator */}
        <div className={`bio-col-preview ${activeTab !== "preview" ? "hide-on-mobile" : ""}`}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "0.75rem",
            }}
          >
            <span
              style={{
                fontSize: "0.8rem",
                fontWeight: "800",
                color: "var(--text-muted)",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              iPhone 16 Pro Simulator
            </span>
            <span className="badge badge-indigo">
              <span className="pulse-dot emerald" />
              Real-time Preview
            </span>
          </div>

          <PhoneSimulator bioData={bioData} />
        </div>
      </div>
    </div>
  );
};
