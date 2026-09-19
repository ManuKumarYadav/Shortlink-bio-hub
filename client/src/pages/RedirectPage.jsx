import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ExternalLink, AlertCircle, Sparkles } from "lucide-react";

export const RedirectPage = () => {
  const { shortCode } = useParams();
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!shortCode) {
      setError(true);
      return;
    }

    // Resolve backend API URL
    const getBackendBase = () => {
      const viteApi = import.meta.env.VITE_API_URL;
      if (viteApi && viteApi.startsWith("http")) {
        return viteApi.replace(/\/api\/?$/, "");
      }
      if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
        return "http://localhost:5000";
      }
      return "https://shortlink-bio-hub.onrender.com";
    };

    const targetUrl = `${getBackendBase()}/r/${shortCode}`;

    // Redirect to backend endpoint for click logging & 302 redirection
    const timer = setTimeout(() => {
      window.location.replace(targetUrl);
    }, 100);

    return () => clearTimeout(timer);
  }, [shortCode]);

  const targetRedirectUrl = (() => {
    const viteApi = import.meta.env.VITE_API_URL;
    const base =
      viteApi && viteApi.startsWith("http")
        ? viteApi.replace(/\/api\/?$/, "")
        : window.location.hostname === "localhost"
        ? "http://localhost:5000"
        : "https://shortlink-bio-hub.onrender.com";
    return `${base}/r/${shortCode}`;
  })();

  if (error) {
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
          color: "var(--text-primary)",
          textAlign: "center",
          gap: "1.25rem",
        }}
      >
        <div
          style={{
            width: "56px",
            height: "56px",
            borderRadius: "50%",
            background: "rgba(244, 63, 94, 0.15)",
            color: "#f43f5e",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <AlertCircle size={28} />
        </div>
        <h2 style={{ fontSize: "1.6rem", fontWeight: "800" }}>Invalid Short Link</h2>
        <p style={{ color: "var(--text-muted)", maxWidth: "380px", fontSize: "0.95rem" }}>
          The link code is missing or malformed.
        </p>
        <Link to="/" className="btn btn-primary" style={{ marginTop: "0.5rem" }}>
          Go to ShortHub Home
        </Link>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        background: "radial-gradient(circle at top, rgba(99, 102, 241, 0.12) 0%, #07090e 70%)",
        color: "var(--text-primary)",
        textAlign: "center",
      }}
    >
      <div
        className="glass-card"
        style={{
          maxWidth: "420px",
          width: "100%",
          padding: "3rem 2rem",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "1.5rem",
          borderRadius: "24px",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 40px rgba(99, 102, 241, 0.15)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
        }}
      >
        {/* Animated Radar/Spinner */}
        <div
          style={{
            position: "relative",
            width: "68px",
            height: "68px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              borderRadius: "50%",
              border: "2px solid rgba(99, 102, 241, 0.2)",
              borderTopColor: "var(--primary)",
              animation: "spin 0.9s linear infinite",
            }}
          />
          <div
            style={{
              width: "42px",
              height: "42px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, var(--primary), var(--secondary))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ffffff",
              boxShadow: "0 0 20px rgba(99, 102, 241, 0.5)",
            }}
          >
            <Sparkles size={20} />
          </div>
        </div>

        <div>
          <h2 style={{ fontSize: "1.45rem", fontWeight: "800", marginBottom: "0.4rem" }}>
            Redirecting...
          </h2>
          <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>
            Tracking telemetry and taking you to destination
          </p>
        </div>

        <div
          style={{
            background: "rgba(255, 255, 255, 0.04)",
            border: "1px solid var(--border-subtle)",
            padding: "0.45rem 1rem",
            borderRadius: "var(--radius-full)",
            fontFamily: "var(--font-mono)",
            fontSize: "0.85rem",
            color: "#818cf8",
          }}
        >
          /r/{shortCode}
        </div>

        <a
          href={targetRedirectUrl}
          className="btn btn-secondary"
          style={{
            fontSize: "0.825rem",
            padding: "0.6rem 1.25rem",
            marginTop: "0.5rem",
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
          }}
        >
          Click here if not redirected automatically <ExternalLink size={13} />
        </a>
      </div>
    </div>
  );
};
