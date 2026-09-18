import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import QRCode from "qrcode";
import { X, Download, Copy, ShieldCheck, QrCode } from "lucide-react";
import { showToast } from "./Toast";

export const QrModal = ({ link, onClose }) => {
  const canvasRef = useRef(null);

  // Lock background body scroll while modal is open
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  const qrUrl =
    link?.destinationUrl ||
    link?.shortUrl ||
    `${window.location.protocol}//${window.location.host}/r/${link?.shortCode}`;

  const shortUrl =
    link?.shortUrl ||
    `${window.location.protocol}//${window.location.host}/r/${link?.shortCode}`;

  useEffect(() => {
    if (canvasRef.current && qrUrl) {
      // Responsive QR size: smaller on narrow screens
      const qrSize = Math.min(220, window.innerWidth - 100);
      QRCode.toCanvas(
        canvasRef.current,
        qrUrl,
        {
          width: qrSize,
          margin: 2,
          color: {
            dark: "#0a0e1a",
            light: "#ffffff",
          },
        },
        (error) => {
          if (error) console.error("QR Code generation error:", error);
        }
      );
    }
  }, [qrUrl]);

  const handleDownload = () => {
    if (!canvasRef.current) return;
    // Regenerate at full 512px quality for download
    const hiResCanvas = document.createElement("canvas");
    QRCode.toCanvas(
      hiResCanvas,
      qrUrl,
      { width: 512, margin: 2, color: { dark: "#0a0e1a", light: "#ffffff" } },
      () => {
        const pngUrl = hiResCanvas
          .toDataURL("image/png")
          .replace("image/png", "image/octet-stream");
        const downloadLink = document.createElement("a");
        downloadLink.href = pngUrl;
        downloadLink.download = `shorthub_qr_${link?.shortCode || "code"}.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        showToast("High-res QR Code downloaded as PNG");
      }
    );
  };

  const handleCopyShortUrl = () => {
    navigator.clipboard.writeText(shortUrl);
    showToast("Short link copied to clipboard");
  };

  if (!link) return null;

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content qr-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top gradient accent */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: "var(--gradient-primary)" }} />

        {/* Header */}
        <div className="modal-header qr-modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "9px",
                background: "rgba(99, 102, 241, 0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--accent-indigo)",
                flexShrink: 0,
              }}
            >
              <QrCode size={16} />
            </div>
            <div>
              <h3 style={{ fontSize: "1rem", fontWeight: "800" }}>High-Res QR Code</h3>
              <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                /r/{link.shortCode}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="btn btn-secondary btn-icon"
            style={{ width: "32px", height: "32px", flexShrink: 0 }}
            title="Close"
          >
            <X size={15} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body qr-modal-body">
          {/* QR Canvas */}
          <div
            style={{
              padding: "12px",
              background: "#ffffff",
              borderRadius: "16px",
              boxShadow: "0 8px 28px rgba(0, 0, 0, 0.55)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              alignSelf: "center",
              border: "3px solid rgba(255, 255, 255, 0.1)",
            }}
          >
            <canvas ref={canvasRef} style={{ display: "block", borderRadius: "8px" }} />
          </div>

          {/* Destination Preview */}
          <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "0.35rem" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span
                style={{
                  fontSize: "0.7rem",
                  color: "var(--text-muted)",
                  textTransform: "uppercase",
                  fontWeight: "700",
                  letterSpacing: "0.05em",
                }}
              >
                Direct Destination
              </span>
              <span className="badge badge-emerald" style={{ fontSize: "0.65rem", padding: "0.12rem 0.45rem" }}>
                <ShieldCheck size={11} /> Verified
              </span>
            </div>
            <div
              style={{
                fontSize: "0.8rem",
                color: "var(--text-secondary)",
                wordBreak: "break-all",
                background: "rgba(255, 255, 255, 0.03)",
                padding: "0.5rem 0.75rem",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--border-subtle)",
              }}
            >
              {link.destinationUrl}
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: "flex", gap: "0.65rem", width: "100%" }}>
            <button
              onClick={handleCopyShortUrl}
              className="btn btn-secondary"
              style={{ flex: 1, padding: "0.65rem" }}
            >
              <Copy size={14} />
              Copy URL
            </button>
            <button
              onClick={handleDownload}
              className="btn btn-primary"
              style={{ flex: 1, padding: "0.65rem" }}
            >
              <Download size={14} />
              Download PNG
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
