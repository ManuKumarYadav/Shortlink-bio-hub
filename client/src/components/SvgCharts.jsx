import { useState } from "react";
import { Monitor, Smartphone, Tablet, HelpCircle, Globe } from "lucide-react";

// ==========================================
// 1. CLICKS OVER TIME - AREA CHART
// ==========================================
export const ClicksAreaChart = ({ data = [] }) => {
  const [hoveredPoint, setHoveredPoint] = useState(null);

  if (!data || data.length === 0) {
    return (
      <div style={{ height: 180, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "0.5rem", borderRadius: "10px", border: "1px dashed rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.015)" }}>
        <div style={{ fontSize: "1.6rem", opacity: 0.4 }}>📈</div>
        <div style={{ fontSize: "0.82rem", fontWeight: "700", color: "#7d95b0" }}>No click data yet</div>
        <div style={{ fontSize: "0.72rem", color: "#556070", textAlign: "center", maxWidth: "200px" }}>Share your link to start tracking daily clicks</div>
      </div>
    );
  }

  // Ensure sorted by date
  const sorted = [...data].sort((a, b) => new Date(a.date) - new Date(b.date));

  const maxClicks = Math.max(...sorted.map((d) => d.clicks), 5);
  const width = 500;
  const height = 180;
  const padding = { top: 20, right: 20, bottom: 30, left: 35 };

  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const getX = (index) =>
    padding.left + (index / Math.max(sorted.length - 1, 1)) * chartWidth;
  const getY = (val) =>
    padding.top + chartHeight - (val / maxClicks) * chartHeight;

  // Build path points
  const points = sorted.map((d, i) => ({
    x: getX(i),
    y: getY(d.clicks),
    ...d,
  }));

  const linePath = points.reduce(
    (acc, pt, i) => (i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`),
    ""
  );

  const areaPath = `${linePath} L ${points[points.length - 1].x} ${
    padding.top + chartHeight
  } L ${points[0].x} ${padding.top + chartHeight} Z`;

  return (
    <div style={{ position: "relative", width: "100%" }}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        style={{ width: "100%", height: "auto", overflow: "visible" }}
      >
        <defs>
          <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {[0, 0.5, 1].map((ratio, idx) => {
          const y = padding.top + chartHeight * (1 - ratio);
          const val = Math.round(maxClicks * ratio);
          return (
            <g key={idx}>
              <line
                x1={padding.left}
                y1={y}
                x2={width - padding.right}
                y2={y}
                stroke="rgba(255,255,255,0.06)"
                strokeDasharray="4 4"
              />
              <text
                x={padding.left - 8}
                y={y + 3}
                fill="var(--text-muted)"
                fontSize="9"
                textAnchor="end"
              >
                {val}
              </text>
            </g>
          );
        })}

        {/* Area & Line */}
        <path d={areaPath} fill="url(#areaGradient)" />
        <path
          d={linePath}
          fill="none"
          stroke="#6366f1"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data points */}
        {points.map((pt, i) => (
          <g key={i}>
            <circle
              cx={pt.x}
              cy={pt.y}
              r={hoveredPoint === i ? 6 : 3.5}
              fill="#ffffff"
              stroke="#6366f1"
              strokeWidth="2"
              style={{ cursor: "pointer", transition: "all 0.15s ease" }}
              onMouseEnter={() => setHoveredPoint(i)}
              onMouseLeave={() => setHoveredPoint(null)}
            />
            {/* X-axis labels */}
            {(sorted.length <= 7 ||
              i === 0 ||
              i === sorted.length - 1 ||
              i === Math.floor(sorted.length / 2)) && (
              <text
                x={pt.x}
                y={height - 8}
                fill="var(--text-muted)"
                fontSize="9"
                textAnchor="middle"
              >
                {pt.date.slice(5)}
              </text>
            )}
          </g>
        ))}
      </svg>

      {/* Tooltip */}
      {hoveredPoint !== null && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: `${(points[hoveredPoint].x / width) * 100}%`,
            transform: "translate(-50%, -100%)",
            background: "#1e293b",
            border: "1px solid rgba(255,255,255,0.15)",
            padding: "0.3rem 0.6rem",
            borderRadius: "6px",
            fontSize: "0.75rem",
            color: "#fff",
            pointerEvents: "none",
            boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
            whiteSpace: "nowrap",
          }}
        >
          <strong>{points[hoveredPoint].clicks} clicks</strong> on{" "}
          {points[hoveredPoint].date}
        </div>
      )}
    </div>
  );
};

// ==========================================
// 2. DEVICE DISTRIBUTION - DONUT CHART
// ==========================================
export const DeviceDonutChart = ({ data = [] }) => {
  const total = data.reduce((acc, curr) => acc + curr.clicks, 0);

  if (!data || data.length === 0 || total === 0) {
    return (
      <div style={{ height: 160, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "0.5rem", borderRadius: "10px", border: "1px dashed rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.015)" }}>
        <div style={{ fontSize: "1.6rem", opacity: 0.4 }}>📱</div>
        <div style={{ fontSize: "0.82rem", fontWeight: "700", color: "#7d95b0" }}>No device data yet</div>
        <div style={{ fontSize: "0.72rem", color: "#556070", textAlign: "center", maxWidth: "200px" }}>Device types will appear after your first click</div>
      </div>
    );
  }

  const colors = {
    Desktop: "#06b6d4",
    Mobile: "#8b5cf6",
    Tablet: "#10b981",
    Unknown: "#64748b",
  };

  const icons = {
    Desktop: <Monitor size={14} color="#06b6d4" />,
    Mobile: <Smartphone size={14} color="#8b5cf6" />,
    Tablet: <Tablet size={14} color="#10b981" />,
    Unknown: <HelpCircle size={14} color="#64748b" />,
  };

  // SVG Circle specs
  const size = 150;
  const strokeWidth = 18;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let accumulatedPercent = 0;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-around",
        gap: "1.5rem",
        padding: "0.5rem 0",
      }}
    >
      <div style={{ position: "relative", width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          style={{ transform: "rotate(-90deg)" }}
        >
          {data.map((item, idx) => {
            const percent = item.clicks / total;
            const strokeDasharray = `${circumference * percent} ${
              circumference * (1 - percent)
            }`;
            const strokeDashoffset = -accumulatedPercent * circumference;
            accumulatedPercent += percent;

            return (
              <circle
                key={idx}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="transparent"
                stroke={colors[item.device] || "#6366f1"}
                strokeWidth={strokeWidth}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                style={{ transition: "stroke-dashoffset 0.5s ease" }}
              />
            );
          })}
        </svg>

        {/* Center label */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none",
          }}
        >
          <span style={{ fontSize: "1.2rem", fontWeight: "800" }}>{total}</span>
          <span style={{ fontSize: "0.65rem", color: "var(--text-muted)", textTransform: "uppercase" }}>
            Clicks
          </span>
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.45rem" }}>
        {data.map((item, idx) => (
          <div
            key={idx}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              fontSize: "0.8rem",
            }}
          >
            {icons[item.device] || <Globe size={14} />}
            <span style={{ color: "var(--text-secondary)", width: "60px" }}>
              {item.device}
            </span>
            <span style={{ fontWeight: "700" }}>
              {Math.round((item.clicks / total) * 100)}%
            </span>
            <span style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>
              ({item.clicks})
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ==========================================
// 3. TOP REFERRERS - RANKED BAR CHART
// ==========================================
export const ReferrersBarChart = ({ data = [] }) => {
  const maxClicks = Math.max(...data.map((d) => d.clicks), 1);

  if (!data || data.length === 0) {
    return (
      <div style={{ height: 140, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "0.5rem", borderRadius: "10px", border: "1px dashed rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.015)" }}>
        <div style={{ fontSize: "1.6rem", opacity: 0.4 }}>🌐</div>
        <div style={{ fontSize: "0.82rem", fontWeight: "700", color: "#7d95b0" }}>No referrer data yet</div>
        <div style={{ fontSize: "0.72rem", color: "#556070", textAlign: "center", maxWidth: "200px" }}>Traffic sources will show once visitors click your link</div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      {data.map((item, idx) => {
        const percent = Math.round((item.clicks / maxClicks) * 100);
        return (
          <div key={idx} style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "0.8rem",
              }}
            >
              <span style={{ fontWeight: "600", color: "var(--text-primary)" }}>
                {item.referrer || "Direct / None"}
              </span>
              <span style={{ color: "var(--accent-cyan)", fontWeight: "700" }}>
                {item.clicks} clicks
              </span>
            </div>
            <div
              style={{
                width: "100%",
                height: "6px",
                background: "rgba(255,255,255,0.06)",
                borderRadius: "4px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${percent}%`,
                  height: "100%",
                  background: "var(--gradient-cyan)",
                  borderRadius: "4px",
                  transition: "width 0.5s ease",
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};
