import { useState, useEffect, useCallback, useMemo } from "react";
import { linkApi } from "../api/client";
import { showToast } from "../components/Toast";
import { QrModal } from "../components/QrModal";
import { AnalyticsModal } from "../components/AnalyticsModal";
import {
  Link2,
  Sparkles,
  Copy,
  QrCode,
  BarChart3,
  Trash2,
  ExternalLink,
  Search,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Check,
  MousePointerClick,
  TrendingUp,
  Globe2,
  Flame,
  ClipboardPaste,
  Filter,
  RefreshCw,
} from "lucide-react";

export const DashboardPage = () => {
  // Shortener form state
  const [destinationUrl, setDestinationUrl] = useState("");
  const [customSlug, setCustomSlug] = useState("");
  const [showCustomSlug, setShowCustomSlug] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createdLink, setCreatedLink] = useState(null);

  // Link Library state
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all"); // 'all' | 'custom'
  const [sortBy, setSortBy] = useState("newest"); // 'newest' | 'clicks'
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLinks, setTotalLinks] = useState(0);
  const [totalClicks, setTotalClicks] = useState(0);

  // Modals state
  const [activeQrLink, setActiveQrLink] = useState(null);
  const [activeAnalyticsLink, setActiveAnalyticsLink] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  // Fetch links from API
  const fetchLinks = useCallback(async () => {
    try {
      setLoading(true);
      const res = await linkApi.getMyLinks({ page, limit: 10, search });
      if (res.data?.success) {
        setLinks(res.data.links || []);
        setTotalPages(res.data.totalPages || 1);
        setTotalLinks(res.data.totalLinks || 0);
        if (typeof res.data.totalClicks === "number") {
          setTotalClicks(res.data.totalClicks);
        }
      }
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to load links", "error");
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchLinks();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchLinks]);

  // Auto-refresh when tab gains focus (e.g. after user tests a shortlink in another tab)
  useEffect(() => {
    const handleFocus = () => {
      fetchLinks();
    };
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [fetchLinks]);

  // Aggregate Metrics
  const totalClicksAll = useMemo(() => {
    if (typeof totalClicks === "number" && totalClicks > 0) return totalClicks;
    return links.reduce((sum, item) => sum + (item.clicks || 0), 0);
  }, [totalClicks, links]);

  const topPerforming = useMemo(() => {
    if (!links || links.length === 0) return null;
    return [...links].sort((a, b) => (b.clicks || 0) - (a.clicks || 0))[0];
  }, [links]);

  // Filtered & Sorted Links
  const displayedLinks = useMemo(() => {
    let result = [...links];
    if (filterType === "custom") {
      result = result.filter((l) => l.isCustom);
    }
    if (sortBy === "clicks") {
      result.sort((a, b) => (b.clicks || 0) - (a.clicks || 0));
    }
    return result;
  }, [links, filterType, sortBy]);

  // Handle Create Link
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!destinationUrl.trim()) return;

    let formattedUrl = destinationUrl.trim();
    if (!formattedUrl.startsWith("http://") && !formattedUrl.startsWith("https://")) {
      formattedUrl = `https://${formattedUrl}`;
    }

    try {
      setCreating(true);
      const payload = {
        destinationUrl: formattedUrl,
      };
      if (showCustomSlug && customSlug.trim()) {
        payload.customSlug = customSlug.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "");
      }

      const res = await linkApi.createLink(payload);
      if (res.data?.success) {
        showToast("Short link created successfully!");
        setCreatedLink(res.data.link);
        setDestinationUrl("");
        setCustomSlug("");
        setShowCustomSlug(false);
        fetchLinks();
      }
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to create link", "error");
    } finally {
      setCreating(false);
    }
  };

  // Clipboard Paste Helper
  const handlePasteClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setDestinationUrl(text.trim());
        showToast("Pasted from clipboard!");
      }
    } catch (err) {
      showToast("Unable to read clipboard", "error");
    }
  };

  // Handle Delete Link
  const handleDelete = async (id, shortCode) => {
    if (!window.confirm(`Are you sure you want to permanently delete /r/${shortCode}?`)) {
      return;
    }
    try {
      await linkApi.deleteLink(id);
      showToast("Link deleted successfully");
      fetchLinks();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to delete link", "error");
    }
  };

  // 1-Click Copy
  const handleCopy = (url, id) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    showToast("Copied to clipboard!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getFullShortUrl = (code) => {
    return `${window.location.protocol}//${window.location.host}/r/${code}`;
  };

  return (
    <div className="app-container" style={{ padding: "2.5rem 1.5rem 5rem 1.5rem" }}>
      {/* Page Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          marginBottom: "2rem",
          flexWrap: "wrap",
          gap: "1.25rem",
        }}
      >
        <div>
          <span className="badge badge-indigo" style={{ marginBottom: "0.5rem" }}>
            <Sparkles size={12} /> High-Speed Link Infrastructure
          </span>
          <h1 style={{ fontSize: "2.3rem", fontWeight: "900" }}>
            Link Studio <span className="text-gradient">Engine</span>
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
            Shorten URLs, generate dynamic high-res QR codes, and track real-time telemetry metrics.
          </p>
        </div>

        {/* Live Status indicator & Refresh */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", flexWrap: "wrap" }}>
          <span className="badge badge-emerald">
            <span className="pulse-dot emerald" /> 99.99% Redirect Uptime
          </span>
          <button
            onClick={() => {
              fetchLinks();
              showToast("Metrics and clicks refreshed");
            }}
            disabled={loading}
            className="btn btn-secondary"
            style={{
              padding: "0.35rem 0.85rem",
              fontSize: "0.8rem",
              borderRadius: "var(--radius-full)",
              gap: "0.4rem",
              background: "rgba(255,255,255,0.06)",
              cursor: "pointer",
            }}
            title="Refresh link telemetry and clicks"
          >
            <RefreshCw
              size={13}
              style={{
                animation: loading ? "spin 1s linear infinite" : "none",
                display: "inline-block",
              }}
            />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* KPI Metric Strip */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "1.25rem",
          marginBottom: "2.25rem",
        }}
      >
        {/* Metric 1 */}
        <div className="glass-card" style={{ padding: "1.25rem 1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.6rem" }}>
            <span style={{ fontSize: "0.8rem", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase" }}>
              Total Links
            </span>
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                background: "rgba(99, 102, 241, 0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--accent-indigo)",
              }}
            >
              <Link2 size={16} />
            </div>
          </div>
          <div style={{ fontSize: "1.85rem", fontWeight: "900", fontFamily: "var(--font-display)" }}>
            {totalLinks}
          </div>
          <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
            Active shortlinks in library
          </span>
        </div>

        {/* Metric 2 */}
        <div className="glass-card" style={{ padding: "1.25rem 1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.6rem" }}>
            <span style={{ fontSize: "0.8rem", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase" }}>
              Total Clicks
            </span>
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                background: "rgba(6, 182, 212, 0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--accent-cyan)",
              }}
            >
              <MousePointerClick size={16} />
            </div>
          </div>
          <div style={{ fontSize: "1.85rem", fontWeight: "900", fontFamily: "var(--font-display)" }}>
            {totalClicksAll}
          </div>
          <span style={{ fontSize: "0.75rem", color: "var(--accent-cyan)" }}>
            Real-time telemetry tracked
          </span>
        </div>

        {/* Metric 3 */}
        <div className="glass-card" style={{ padding: "1.25rem 1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.6rem" }}>
            <span style={{ fontSize: "0.8rem", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase" }}>
              Top Performer
            </span>
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                background: "rgba(244, 63, 94, 0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--accent-rose)",
              }}
            >
              <Flame size={16} />
            </div>
          </div>
          <div
            style={{
              fontSize: "1.3rem",
              fontWeight: "800",
              fontFamily: "var(--font-mono)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {topPerforming ? `/r/${topPerforming.shortCode}` : "None yet"}
          </div>
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
            {topPerforming ? `${topPerforming.clicks || 0} total clicks` : "Create links to see"}
          </span>
        </div>
      </div>

      {/* Hero Quick Shortener Command Center Card */}
      <div
        className="glass-card"
        style={{
          padding: "2.25rem",
          marginBottom: "2.75rem",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            right: "-40px",
            top: "-40px",
            width: "240px",
            height: "240px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        <div style={{ marginBottom: "1.25rem" }}>
          <h2 style={{ fontSize: "1.35rem", fontWeight: "800", marginBottom: "0.25rem" }}>
            Instant Link Shortener
          </h2>
          <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>
            Paste any long destination URL to generate an ultra-fast vanity shortcode.
          </p>
        </div>

        <form onSubmit={handleCreate}>
          <div
            className="shortener-form-controls"
            style={{
              display: "flex",
              gap: "0.75rem",
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <div style={{ flex: "1 1 240px", minWidth: 0, position: "relative" }}>
              <Globe2
                size={18}
                style={{
                  position: "absolute",
                  left: "1.1rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--text-muted)",
                }}
              />
              <input
                type="text"
                required
                placeholder="Paste destination URL (e.g. https://mybrand.com/new-product)"
                className="input-field"
                style={{ paddingLeft: "2.9rem", paddingRight: "3rem", fontSize: "0.95rem" }}
                value={destinationUrl}
                onChange={(e) => setDestinationUrl(e.target.value)}
              />
              <button
                type="button"
                onClick={handlePasteClipboard}
                title="Paste from clipboard"
                style={{
                  position: "absolute",
                  right: "0.75rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "6px",
                  color: "var(--text-muted)",
                  padding: "4px 8px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  fontSize: "0.75rem",
                }}
              >
                <ClipboardPaste size={13} />
                <span>Paste</span>
              </button>
            </div>

            <button
              type="submit"
              disabled={creating}
              className="btn btn-primary"
              style={{ padding: "0.8rem 1.75rem", fontSize: "0.95rem" }}
            >
              {creating ? (
                "Generating..."
              ) : (
                <>
                  Shorten URL <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>

          {/* Vanity Slug Toggle & Input */}
          <div style={{ marginTop: "1rem", display: "flex", alignItems: "center", gap: "1rem" }}>
            <button
              type="button"
              onClick={() => setShowCustomSlug(!showCustomSlug)}
              style={{
                background: "none",
                border: "none",
                color: showCustomSlug ? "var(--accent-cyan)" : "var(--text-secondary)",
                fontSize: "0.85rem",
                fontWeight: "700",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
              }}
            >
              <Sparkles size={14} />
              {showCustomSlug ? "Hide Custom Vanity Slug" : "+ Customize Vanity Alias (/r/my-alias)"}
            </button>
          </div>

          {showCustomSlug && (
            <div
              style={{
                marginTop: "0.85rem",
                display: "flex",
                alignItems: "center",
                gap: "0.6rem",
                maxWidth: "460px",
                animation: "fadeIn 0.2s ease-out",
              }}
            >
              <span
                style={{
                  fontSize: "0.85rem",
                  color: "var(--accent-cyan)",
                  fontWeight: "700",
                  padding: "0.75rem 1rem",
                  background: "rgba(6, 182, 212, 0.08)",
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid rgba(6, 182, 212, 0.25)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                /r/
              </span>
              <input
                type="text"
                placeholder="summer-sale-2026"
                pattern="[a-zA-Z0-9_-]+"
                className="input-field"
                value={customSlug}
                onChange={(e) => setCustomSlug(e.target.value)}
              />
            </div>
          )}
        </form>

        {/* Instant Created Link Celebratory Card */}
        {createdLink && (
          <div
            style={{
              marginTop: "1.75rem",
              padding: "1.25rem 1.5rem",
              background: "rgba(16, 185, 129, 0.09)",
              border: "1px solid rgba(16, 185, 129, 0.35)",
              borderRadius: "var(--radius-md)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "1.25rem",
              animation: "scaleUp 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <div
                style={{
                  width: "42px",
                  height: "42px",
                  borderRadius: "50%",
                  background: "rgba(16, 185, 129, 0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#10b981",
                }}
              >
                <Check size={22} strokeWidth={3} />
              </div>
              <div>
                <div style={{ fontSize: "0.75rem", color: "#6ee7b7", fontWeight: "700", textTransform: "uppercase" }}>
                  Link Ready To Share
                </div>
                <div
                  style={{
                    fontSize: "1.2rem",
                    fontWeight: "800",
                    color: "#ffffff",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  {getFullShortUrl(createdLink.shortCode)}
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: "0.6rem" }}>
              <button
                onClick={() =>
                  handleCopy(
                    getFullShortUrl(createdLink.shortCode),
                    createdLink.id || createdLink._id
                  )
                }
                className="btn btn-secondary"
              >
                <Copy size={15} />
                Copy Link
              </button>
              <button
                onClick={() => setActiveQrLink(createdLink)}
                className="btn btn-secondary"
              >
                <QrCode size={15} />
                View QR
              </button>
              <a
                href={getFullShortUrl(createdLink.shortCode)}
                target="_blank"
                rel="noreferrer"
                className="btn btn-primary"
              >
                <ExternalLink size={15} />
                Visit
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Link Library Header & Filters */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1.5rem",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
          <h2 style={{ fontSize: "1.5rem", fontWeight: "800" }}>Your Shortlinks</h2>

          {/* Filter Pills */}
          <div style={{ display: "flex", gap: "0.4rem" }}>
            <button
              onClick={() => setFilterType("all")}
              style={{
                padding: "0.35rem 0.85rem",
                borderRadius: "var(--radius-full)",
                fontSize: "0.8rem",
                fontWeight: "700",
                cursor: "pointer",
                border: filterType === "all" ? "1px solid var(--border-focus)" : "1px solid var(--border-subtle)",
                background: filterType === "all" ? "rgba(99, 102, 241, 0.2)" : "rgba(255,255,255,0.04)",
                color: filterType === "all" ? "#ffffff" : "var(--text-secondary)",
              }}
            >
              All ({totalLinks})
            </button>
            <button
              onClick={() => setFilterType("custom")}
              style={{
                padding: "0.35rem 0.85rem",
                borderRadius: "var(--radius-full)",
                fontSize: "0.8rem",
                fontWeight: "700",
                cursor: "pointer",
                border: filterType === "custom" ? "1px solid var(--accent-cyan)" : "1px solid var(--border-subtle)",
                background: filterType === "custom" ? "rgba(6, 182, 212, 0.2)" : "rgba(255,255,255,0.04)",
                color: filterType === "custom" ? "#ffffff" : "var(--text-secondary)",
              }}
            >
              Custom Slugs
            </button>
          </div>
        </div>

        {/* Search Bar & Sort Dropdown */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
          <div style={{ position: "relative", minWidth: "260px" }}>
            <Search
              size={16}
              style={{
                position: "absolute",
                left: "1rem",
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--text-muted)",
              }}
            />
            <input
              type="text"
              placeholder="Search by code or URL..."
              className="input-field"
              style={{ paddingLeft: "2.6rem", paddingBottom: "0.55rem", paddingTop: "0.55rem" }}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>

          <select
            className="input-field"
            style={{ width: "150px", padding: "0.55rem 0.75rem" }}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="newest" style={{ background: "#0c111d" }}>Newest First</option>
            <option value="clicks" style={{ background: "#0c111d" }}>Most Clicks</option>
          </select>
        </div>
      </div>

      {/* Links List */}
      {loading ? (
        <div
          className="glass-card"
          style={{
            padding: "5rem 2rem",
            textAlign: "center",
            color: "var(--text-muted)",
          }}
        >
          <div className="pulse-dot indigo" style={{ width: "16px", height: "16px", marginBottom: "1rem" }} />
          <p style={{ fontWeight: "600" }}>Loading your link library...</p>
        </div>
      ) : displayedLinks.length === 0 ? (
        <div
          className="glass-card"
          style={{
            padding: "4.5rem 2rem",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "0.85rem",
          }}
        >
          <div
            style={{
              width: "54px",
              height: "54px",
              borderRadius: "50%",
              background: "rgba(255,255,255,0.05)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--text-muted)",
            }}
          >
            <Link2 size={26} />
          </div>
          <h3 style={{ fontSize: "1.2rem", fontWeight: "700" }}>No links found</h3>
          <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", maxWidth: "360px" }}>
            {search
              ? "No links match your search query."
              : "You haven't generated any shortlinks yet. Paste a destination URL above to start!"}
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.95rem" }}>
          {displayedLinks.map((link) => {
            const shortUrl = getFullShortUrl(link.shortCode);
            const linkId = link.id || link._id;
            const isCopied = copiedId === linkId;

            return (
              <div
                key={linkId}
                className="glass-card"
                style={{
                  padding: "1.35rem 1.6rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "1.2rem",
                }}
              >
                {/* Left info column */}
                <div style={{ flex: "1 1 320px", minWidth: 0 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                      marginBottom: "0.35rem",
                      flexWrap: "wrap",
                    }}
                  >
                    <a
                      href={shortUrl}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        fontSize: "1.1rem",
                        fontWeight: "800",
                        color: "var(--text-primary)",
                        fontFamily: "var(--font-mono)",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.4rem",
                      }}
                    >
                      /r/{link.shortCode}
                      <ExternalLink size={14} color="var(--text-muted)" />
                    </a>

                    {link.isCustom && (
                      <span className="badge badge-cyan">Custom Slug</span>
                    )}

                    {/* Clicks badge */}
                    <span
                      style={{
                        fontSize: "0.75rem",
                        fontWeight: "700",
                        padding: "0.2rem 0.6rem",
                        borderRadius: "var(--radius-full)",
                        background: (link.clicks || 0) > 0 ? "rgba(16, 185, 129, 0.12)" : "rgba(255, 255, 255, 0.05)",
                        color: (link.clicks || 0) > 0 ? "#6ee7b7" : "var(--text-muted)",
                        border: (link.clicks || 0) > 0 ? "1px solid rgba(16, 185, 129, 0.3)" : "1px solid var(--border-subtle)",
                      }}
                    >
                      {link.clicks || 0} {link.clicks === 1 ? "click" : "clicks"}
                    </span>
                  </div>

                  <div
                    style={{
                      fontSize: "0.825rem",
                      color: "var(--text-secondary)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      maxWidth: "550px",
                    }}
                    title={link.destinationUrl}
                  >
                    {link.destinationUrl}
                  </div>
                </div>

                {/* Right Actions column */}
                <div className="link-card-actions" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <button
                    onClick={() => handleCopy(shortUrl, linkId)}
                    className="btn btn-secondary"
                    style={{ fontSize: "0.825rem", padding: "0.55rem 1rem" }}
                  >
                    {isCopied ? (
                      <>
                        <Check size={14} color="#10b981" /> Copied
                      </>
                    ) : (
                      <>
                        <Copy size={14} /> Copy
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => setActiveQrLink(link)}
                    className="btn btn-secondary btn-icon"
                    title="Generate QR Code"
                  >
                    <QrCode size={16} />
                  </button>

                  <button
                    onClick={() => setActiveAnalyticsLink(link)}
                    className="btn btn-secondary btn-icon"
                    title="View Analytics"
                  >
                    <BarChart3 size={16} />
                  </button>

                  <button
                    onClick={() => handleDelete(linkId, link.shortCode)}
                    className="btn btn-danger btn-icon"
                    title="Delete Link"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "1rem",
                marginTop: "1.75rem",
              }}
            >
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="btn btn-secondary btn-icon"
              >
                <ChevronLeft size={16} />
              </button>
              <span style={{ fontSize: "0.875rem", color: "var(--text-secondary)", fontWeight: "600" }}>
                Page {page} of {totalPages}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                className="btn btn-secondary btn-icon"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Interactive Modals */}
      {activeQrLink && (
        <QrModal
          link={activeQrLink}
          onClose={() => setActiveQrLink(null)}
        />
      )}

      {activeAnalyticsLink && (
        <AnalyticsModal
          link={activeAnalyticsLink}
          onClose={() => setActiveAnalyticsLink(null)}
        />
      )}
    </div>
  );
};
