import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { linkApi } from "../api/client";
import {
  X, BarChart3, TrendingUp, Monitor, Globe2, RefreshCw,
  Smartphone, MousePointerClick, Zap, Info, ArrowUpRight,
  Clock, Share2, Eye, Activity,
} from "lucide-react";
import { ClicksAreaChart, DeviceDonutChart, ReferrersBarChart } from "./SvgCharts";

// ── Helper: human-readable insight sentence ──────────────────────────────
const buildInsight = (analytics) => {
  if (!analytics || !analytics.totalClicks) return null;
  const clicks = analytics.totalClicks;
  const devices = analytics.devices || analytics.deviceDistribution || [];
  const referrers = analytics.referrers || analytics.topReferrers || [];
  const device = analytics.topDevice || devices[0]?.device || "Desktop";
  const ref = analytics.topReferrer || referrers[0]?.referrer || "Direct";
  const days = analytics.clicksOverTime?.length || 0;
  const avg = days > 0 ? (clicks / days).toFixed(1) : clicks;
  return `This link received ${clicks} click${clicks !== 1 ? "s" : ""} — averaging ${avg} per day. Most visitors arrived via ${device.toLowerCase()} devices, primarily from ${ref === "Direct" ? "direct traffic (typed URL or bookmark)" : ref}.`;
};

export const AnalyticsModal = ({ link, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [error, setError] = useState(null);

  const linkId = link?.id || link?._id;

  const fetchAnalytics = async () => {
    if (!linkId) return;
    try {
      setLoading(true);
      setError(null);
      const res = await linkApi.getLinkAnalytics(linkId);
      if (res.data?.success) {
        setAnalytics(res.data.analytics);
      } else {
        setError("Could not load analytics data");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch analytics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAnalytics(); }, [linkId]);

  // Lock background body scroll while modal is open
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  if (!link) return null;

  const devicesData = analytics?.devices || analytics?.deviceDistribution || [];
  const referrersData = analytics?.referrers || analytics?.topReferrers || [];
  const topDevice = analytics?.topDevice || devicesData[0]?.device || null;
  const topReferrer = analytics?.topReferrer || referrersData[0]?.referrer || null;

  const insight = buildInsight(analytics);
  const hasData = analytics?.totalClicks > 0;

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="analytics-modal-dialog"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Rainbow top border ── */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "3px", background: "linear-gradient(90deg,#6366f1 0%,#8b5cf6 35%,#d946ef 65%,#06b6d4 100%)", zIndex: 2 }} />

        {/* ══════════ HEADER ══════════ */}
        <div className="analytics-modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", minWidth: 0, flex: 1 }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "linear-gradient(135deg,rgba(99,102,241,0.3),rgba(139,92,246,0.3))", border: "1px solid rgba(99,102,241,0.4)", display: "flex", alignItems: "center", justifyContent: "center", color: "#a5b4fc", flexShrink: 0 }}>
              <Activity size={17} />
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.45rem", flexWrap: "nowrap" }}>
                <h3 style={{ fontSize: "1.05rem", fontWeight: "800", color: "#ffffff", whiteSpace: "nowrap" }}>Link Analytics</h3>
                <span style={{ fontSize: "0.7rem", padding: "0.12rem 0.5rem", borderRadius: "99px", background: "rgba(99,102,241,0.2)", color: "#a5b4fc", border: "1px solid rgba(99,102,241,0.35)", fontWeight: "700", fontFamily: "var(--font-mono)", flexShrink: 0 }}>
                  /r/{link.shortCode}
                </span>
              </div>
              <p style={{ fontSize: "0.72rem", color: "#556070", marginTop: "0.15rem", maxWidth: "240px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                → {link.destinationUrl}
              </p>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.45rem", flexShrink: 0 }}>
            <button onClick={fetchAnalytics} className="btn btn-secondary btn-icon" style={{ width: "34px", height: "34px" }} title="Refresh data">
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            </button>
            <button onClick={onClose} className="btn btn-secondary btn-icon" style={{ width: "34px", height: "34px" }} title="Close">
              <X size={15} />
            </button>
          </div>
        </div>

        {/* ══════════ BODY ══════════ */}
        <div className="analytics-modal-body">
          {/* Loading state */}
          {loading ? (
            <div style={{ height: "320px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1rem" }}>
              <div style={{ position: "relative", width: "48px", height: "48px" }}>
                <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "3px solid rgba(99,102,241,0.15)" }} />
                <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "3px solid transparent", borderTopColor: "#6366f1", animation: "spin 0.9s linear infinite" }} />
                <div style={{ position: "absolute", inset: "8px", borderRadius: "50%", background: "rgba(99,102,241,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <BarChart3 size={16} color="#818cf8" />
                </div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "0.95rem", fontWeight: "700", color: "#e2e8f0", marginBottom: "0.25rem" }}>Loading Analytics</div>
                <div style={{ fontSize: "0.78rem", color: "#556070" }}>Fetching click telemetry data...</div>
              </div>
            </div>

          ) : error ? (
            <div style={{ padding: "3rem 1.5rem", textAlign: "center", background: "rgba(244,63,94,0.06)", border: "1px solid rgba(244,63,94,0.2)", borderRadius: "16px" }}>
              <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>⚠️</div>
              <p style={{ color: "#fb7185", fontWeight: "700", marginBottom: "0.35rem" }}>Failed to load analytics</p>
              <p style={{ color: "#556070", fontSize: "0.82rem", marginBottom: "1rem" }}>{error}</p>
              <button onClick={fetchAnalytics} className="btn btn-secondary" style={{ fontSize: "0.85rem" }}>
                <RefreshCw size={14} /> Try Again
              </button>
            </div>

          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

              {/* ── Quick Insight Banner ── */}
              {insight && (
                <div style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(139,92,246,0.08) 100%)", border: "1px solid rgba(99,102,241,0.25)", borderRadius: "14px", padding: "1rem 1.25rem", display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
                  <div style={{ width: "30px", height: "30px", borderRadius: "8px", background: "rgba(99,102,241,0.25)", display: "flex", alignItems: "center", justifyContent: "center", color: "#a5b4fc", flexShrink: 0, marginTop: "1px" }}>
                    <Info size={15} />
                  </div>
                  <div>
                    <div style={{ fontSize: "0.72rem", fontWeight: "700", color: "#818cf8", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "0.3rem" }}>📊 Quick Insight</div>
                    <p style={{ fontSize: "0.85rem", color: "#b8c5d8", lineHeight: 1.55 }}>{insight}</p>
                  </div>
                </div>
              )}

              {/* ── No data empty state ── */}
              {!hasData && (
                <div style={{ textAlign: "center", padding: "2rem 1.5rem", background: "rgba(255,255,255,0.02)", border: "1px dashed rgba(255,255,255,0.1)", borderRadius: "16px" }}>
                  <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>🔗</div>
                  <h4 style={{ fontSize: "1rem", fontWeight: "700", color: "#ffffff", marginBottom: "0.4rem" }}>No clicks yet</h4>
                  <p style={{ fontSize: "0.83rem", color: "#556070", maxWidth: "340px", margin: "0 auto", lineHeight: 1.55 }}>
                    Share your shortlink and data will appear here. You'll see click volume, device types, and traffic sources in real time.
                  </p>
                </div>
              )}

              {/* ── KPI Stat Cards ── */}
              <div className="analytics-kpi-grid">
                {/* Total Clicks */}
                <div style={{ background: "rgba(16,20,38,0.99)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: "16px", padding: "1.15rem 1.25rem", position: "relative", overflow: "hidden" }}>
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "3px", background: "linear-gradient(90deg,#6366f1,#8b5cf6)" }} />
                  <div style={{ position: "absolute", bottom: "-15px", right: "-15px", width: "70px", height: "70px", borderRadius: "50%", background: "rgba(99,102,241,0.07)" }} />
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
                    <div style={{ width: "26px", height: "26px", borderRadius: "7px", background: "rgba(99,102,241,0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "#818cf8" }}>
                      <MousePointerClick size={13} />
                    </div>
                    <span style={{ fontSize: "0.68rem", fontWeight: "700", color: "#556070", textTransform: "uppercase", letterSpacing: "0.08em" }}>Total Clicks</span>
                  </div>
                  <div style={{ fontSize: "2.4rem", fontWeight: "900", color: "#ffffff", fontFamily: "var(--font-display)", lineHeight: 1 }}>
                    {analytics?.totalClicks || 0}
                  </div>
                  <div style={{ fontSize: "0.72rem", color: "#6366f1", marginTop: "0.4rem", fontWeight: "600" }}>
                    {analytics?.totalClicks > 0 ? "↑ Tracked & counted" : "Waiting for first click"}
                  </div>
                </div>

                {/* Top Device */}
                <div style={{ background: "rgba(16,20,38,0.99)", border: "1px solid rgba(6,182,212,0.2)", borderRadius: "16px", padding: "1.15rem 1.25rem", position: "relative", overflow: "hidden" }}>
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "3px", background: "linear-gradient(90deg,#06b6d4,#3b82f6)" }} />
                  <div style={{ position: "absolute", bottom: "-15px", right: "-15px", width: "70px", height: "70px", borderRadius: "50%", background: "rgba(6,182,212,0.06)" }} />
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
                    <div style={{ width: "26px", height: "26px", borderRadius: "7px", background: "rgba(6,182,212,0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "#38bdf8" }}>
                      <Smartphone size={13} />
                    </div>
                    <span style={{ fontSize: "0.68rem", fontWeight: "700", color: "#556070", textTransform: "uppercase", letterSpacing: "0.08em" }}>Top Device</span>
                  </div>
                  <div style={{ fontSize: "1.55rem", fontWeight: "800", color: "#ffffff", lineHeight: 1.1, textTransform: "capitalize" }}>
                    {topDevice || "—"}
                  </div>
                  <div style={{ fontSize: "0.72rem", color: "#38bdf8", marginTop: "0.4rem", fontWeight: "600" }}>
                    {topDevice ? "Most used device type" : "No device data yet"}
                  </div>
                </div>

                {/* Top Referrer */}
                <div style={{ background: "rgba(16,20,38,0.99)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: "16px", padding: "1.15rem 1.25rem", position: "relative", overflow: "hidden" }}>
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "3px", background: "linear-gradient(90deg,#10b981,#34d399)" }} />
                  <div style={{ position: "absolute", bottom: "-15px", right: "-15px", width: "70px", height: "70px", borderRadius: "50%", background: "rgba(16,185,129,0.06)" }} />
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
                    <div style={{ width: "26px", height: "26px", borderRadius: "7px", background: "rgba(16,185,129,0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "#34d399" }}>
                      <Share2 size={13} />
                    </div>
                    <span style={{ fontSize: "0.68rem", fontWeight: "700", color: "#556070", textTransform: "uppercase", letterSpacing: "0.08em" }}>Top Source</span>
                  </div>
                  <div style={{ fontSize: "1.55rem", fontWeight: "800", color: "#ffffff", lineHeight: 1.1 }}>
                    {topReferrer || "—"}
                  </div>
                  <div style={{ fontSize: "0.72rem", color: "#34d399", marginTop: "0.4rem", fontWeight: "600" }}>
                    {topReferrer ? "Primary traffic source" : "No referrer data yet"}
                  </div>
                </div>
              </div>

              {/* ── Click Velocity Chart ── */}
              <div style={{ background: "rgba(16,20,38,0.99)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "18px", padding: "1.5rem", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: "linear-gradient(90deg,#6366f1,#8b5cf6)" }} />
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.35rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.55rem" }}>
                    <TrendingUp size={16} color="#818cf8" />
                    <h4 style={{ fontSize: "0.95rem", fontWeight: "700", color: "#ffffff" }}>Click Velocity</h4>
                  </div>
                  <span style={{ fontSize: "0.7rem", fontWeight: "700", padding: "0.22rem 0.65rem", borderRadius: "99px", background: "rgba(99,102,241,0.12)", color: "#a5b4fc", border: "1px solid rgba(99,102,241,0.25)" }}>
                    Last 14 Days
                  </span>
                </div>
                <p style={{ fontSize: "0.75rem", color: "#556070", marginBottom: "1rem" }}>Daily click count — hover points to inspect individual dates</p>
                <ClicksAreaChart data={analytics?.clicksOverTime || []} />
              </div>

              {/* ── Device + Referrers Grid ── */}
              <div className="analytics-charts-grid">
                {/* Device Breakdown */}
                <div style={{ background: "rgba(16,20,38,0.99)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "18px", padding: "1.35rem", position: "relative", overflow: "hidden" }}>
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: "linear-gradient(90deg,#06b6d4,#3b82f6)" }} />
                  <div style={{ display: "flex", alignItems: "center", gap: "0.55rem", marginBottom: "0.3rem" }}>
                    <Monitor size={15} color="#38bdf8" />
                    <h4 style={{ fontSize: "0.9rem", fontWeight: "700", color: "#e2e8f0" }}>Device Breakdown</h4>
                  </div>
                  <p style={{ fontSize: "0.73rem", color: "#556070", marginBottom: "0.9rem" }}>Which devices visitors used</p>
                  <DeviceDonutChart data={devicesData} />
                </div>

                {/* Traffic Referrers */}
                <div style={{ background: "rgba(16,20,38,0.99)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "18px", padding: "1.35rem", position: "relative", overflow: "hidden" }}>
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: "linear-gradient(90deg,#10b981,#34d399)" }} />
                  <div style={{ display: "flex", alignItems: "center", gap: "0.55rem", marginBottom: "0.3rem" }}>
                    <Globe2 size={15} color="#34d399" />
                    <h4 style={{ fontSize: "0.9rem", fontWeight: "700", color: "#e2e8f0" }}>Traffic Sources</h4>
                  </div>
                  <p style={{ fontSize: "0.73rem", color: "#556070", marginBottom: "0.9rem" }}>Where your visitors are coming from</p>
                  <ReferrersBarChart data={referrersData} />
                </div>
              </div>

              {/* ── Footer tip ── */}
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.75rem 1rem", background: "rgba(255,255,255,0.02)", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.06)" }}>
                <Clock size={13} color="#556070" style={{ flexShrink: 0 }} />
                <span style={{ fontSize: "0.73rem", color: "#556070" }}>
                  Data refreshes in real time. Click the refresh button to fetch the latest telemetry.
                </span>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

