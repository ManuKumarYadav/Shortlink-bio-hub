import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { authApi } from "../api/client";
import { showToast } from "../components/Toast";
import {
  Link2,
  Sparkles,
  Mail,
  Lock,
  User,
  ArrowRight,
  CheckCircle2,
  KeyRound,
  ShieldCheck,
} from "lucide-react";

export const AuthPage = () => {
  // Modes: 'login' | 'signup' | 'forgot' | 'reset'
  const [authMode, setAuthMode] = useState("login");
  const [loading, setLoading] = useState(false);

  // Form fields
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    resetToken: "",
    newPassword: "",
  });

  // Simulation feedback banner
  const [simulationNotice, setSimulationNotice] = useState(null);

  const { login, signup } = useAuth();
  const navigate = useNavigate();

  // Handle Form Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (authMode === "forgot") {
        const res = await authApi.forgotPassword(formData.email);
        const token = res.data?.resetToken;
        if (token) {
          setFormData((prev) => ({ ...prev, resetToken: token }));
          setSimulationNotice({
            type: "reset",
            message: `Simulated Reset Token: ${token}`,
          });
        }
        showToast("Reset instructions generated (simulation)");
        setAuthMode("reset");
      } else if (authMode === "reset") {
        await authApi.resetPassword(formData.resetToken, formData.newPassword);
        showToast("Password reset successfully! Please sign in.");
        setSimulationNotice(null);
        setAuthMode("login");
      } else if (authMode === "login") {
        await login(formData.email, formData.password);
        showToast("Signed in successfully!");
        navigate("/links");
      } else {
        // Signup
        const res = await signup(formData.name, formData.email, formData.password);
        const vToken = res?.verificationToken;
        if (vToken) {
          setSimulationNotice({
            type: "verify",
            token: vToken,
            message: `Simulated Email Verification Token: ${vToken}`,
          });
        }
        showToast("Account created! Please sign in.");
        setAuthMode("login");
      }
    } catch (err) {
      const errMsg =
        err.response?.data?.message ||
        (err.message === "Network Error"
          ? "Cannot connect to server. Check your network or VITE_API_URL settings."
          : err.message) ||
        "An authentication error occurred";
      showToast(errMsg, "error");
    } finally {
      setLoading(false);
    }
  };

  // Simulate instant email verification
  const handleSimulateVerify = async (token) => {
    try {
      await authApi.verifyEmail(token);
      showToast("Email verified successfully!");
      setSimulationNotice(null);
    } catch (err) {
      showToast(err.response?.data?.message || "Verification failed", "error");
    }
  };

  return (
    <div
      style={{
        minHeight: "calc(100vh - 80px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "3rem 1.5rem",
        position: "relative",
      }}
    >
      <div
        className="glass-card auth-card"
        style={{
          width: "100%",
          maxWidth: "480px",
          padding: "2.75rem 2.25rem",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Glow backdrop inside card */}
        <div
          style={{
            position: "absolute",
            top: "-100px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "260px",
            height: "260px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(99,102,241,0.22) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        {/* Brand Header */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            marginBottom: "1.75rem",
            position: "relative",
          }}
        >
          <div
            className="brand-icon"
            style={{
              marginBottom: "1rem",
              width: "52px",
              height: "52px",
              borderRadius: "15px",
            }}
          >
            <Link2 size={28} strokeWidth={2.5} />
          </div>

          <h2 style={{ fontSize: "1.75rem", fontWeight: "900", letterSpacing: "-0.03em" }}>
            {authMode === "forgot"
              ? "Forgot Password"
              : authMode === "reset"
              ? "Set New Password"
              : authMode === "login"
              ? "Welcome to ShortHub"
              : "Create Creator Account"}
          </h2>

          <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", marginTop: "0.35rem" }}>
            {authMode === "forgot"
              ? "Enter your registered email to simulate password recovery."
              : authMode === "reset"
              ? "Enter your reset token and your desired new password."
              : authMode === "login"
              ? "Access your link engine and Link-in-Bio studio."
              : "Start branding your links and building your creator profile."}
          </p>
        </div>

        {/* Simulated Assessment Banner (when token generated) */}
        {simulationNotice && (
          <div
            style={{
              marginBottom: "1.5rem",
              padding: "0.85rem 1rem",
              background: "rgba(99, 102, 241, 0.12)",
              border: "1px solid rgba(99, 102, 241, 0.35)",
              borderRadius: "var(--radius-md)",
              fontSize: "0.8rem",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "#a5b4fc", fontWeight: "700", marginBottom: "0.3rem" }}>
              <ShieldCheck size={15} />
              <span>Assessment Simulation Triggered</span>
            </div>
            <div style={{ color: "var(--text-secondary)", wordBreak: "break-all", fontFamily: "var(--font-mono)", fontSize: "0.75rem" }}>
              {simulationNotice.message}
            </div>
            {simulationNotice.type === "verify" && (
              <button
                type="button"
                onClick={() => handleSimulateVerify(simulationNotice.token)}
                className="btn btn-primary"
                style={{ marginTop: "0.6rem", padding: "0.4rem 0.85rem", fontSize: "0.75rem" }}
              >
                Verify Email Now (1-Click)
              </button>
            )}
          </div>
        )}

        {/* Tab Switcher (Login / Signup) */}
        {(authMode === "login" || authMode === "signup") && (
          <div
            style={{
              display: "flex",
              background: "rgba(255, 255, 255, 0.04)",
              borderRadius: "var(--radius-md)",
              padding: "4px",
              marginBottom: "1.75rem",
              border: "1px solid var(--border-subtle)",
            }}
          >
            <button
              type="button"
              onClick={() => setAuthMode("login")}
              style={{
                flex: 1,
                padding: "0.6rem 0",
                fontSize: "0.85rem",
                fontWeight: "700",
                border: "none",
                borderRadius: "var(--radius-sm)",
                cursor: "pointer",
                transition: "all var(--transition-fast)",
                background: authMode === "login" ? "var(--gradient-primary)" : "transparent",
                color: authMode === "login" ? "#ffffff" : "var(--text-secondary)",
                boxShadow: authMode === "login" ? "0 2px 10px rgba(99, 102, 241, 0.4)" : "none",
              }}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setAuthMode("signup")}
              style={{
                flex: 1,
                padding: "0.6rem 0",
                fontSize: "0.85rem",
                fontWeight: "700",
                border: "none",
                borderRadius: "var(--radius-sm)",
                cursor: "pointer",
                transition: "all var(--transition-fast)",
                background: authMode === "signup" ? "var(--gradient-primary)" : "transparent",
                color: authMode === "signup" ? "#ffffff" : "var(--text-secondary)",
                boxShadow: authMode === "signup" ? "0 2px 10px rgba(99, 102, 241, 0.4)" : "none",
              }}
            >
              Create Account
            </button>
          </div>
        )}

        {/* Main Form */}
        <form onSubmit={handleSubmit}>
          {authMode === "signup" && (
            <div className="form-group">
              <label className="form-label">Creator Name</label>
              <div style={{ position: "relative" }}>
                <User
                  size={17}
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
                  required
                  placeholder="Alex Rivera"
                  className="input-field"
                  style={{ paddingLeft: "2.75rem" }}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
            </div>
          )}

          {authMode !== "reset" && (
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div style={{ position: "relative" }}>
                <Mail
                  size={17}
                  style={{
                    position: "absolute",
                    left: "1rem",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--text-muted)",
                  }}
                />
                <input
                  type="email"
                  required
                  placeholder="alex@creator.com"
                  className="input-field"
                  style={{ paddingLeft: "2.75rem" }}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>
          )}

          {(authMode === "login" || authMode === "signup") && (
            <div className="form-group">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <label className="form-label" style={{ marginBottom: 0 }}>Password</label>
                {authMode === "login" && (
                  <button
                    type="button"
                    onClick={() => setAuthMode("forgot")}
                    style={{
                      background: "none",
                      border: "none",
                      color: "var(--accent-indigo)",
                      fontSize: "0.775rem",
                      fontWeight: "600",
                      cursor: "pointer",
                      padding: 0,
                    }}
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div style={{ position: "relative", marginTop: "0.4rem" }}>
                <Lock
                  size={17}
                  style={{
                    position: "absolute",
                    left: "1rem",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--text-muted)",
                  }}
                />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  className="input-field"
                  style={{ paddingLeft: "2.75rem" }}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
            </div>
          )}

          {/* Reset Password Form Fields */}
          {authMode === "reset" && (
            <>
              <div className="form-group">
                <label className="form-label">Reset Token</label>
                <div style={{ position: "relative" }}>
                  <KeyRound
                    size={17}
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
                    required
                    placeholder="Paste 64-char hex token"
                    className="input-field"
                    style={{ paddingLeft: "2.75rem", fontFamily: "var(--font-mono)", fontSize: "0.85rem" }}
                    value={formData.resetToken}
                    onChange={(e) => setFormData({ ...formData, resetToken: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">New Password</label>
                <div style={{ position: "relative" }}>
                  <Lock
                    size={17}
                    style={{
                      position: "absolute",
                      left: "1rem",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "var(--text-muted)",
                    }}
                  />
                  <input
                    type="password"
                    required
                    minLength={6}
                    placeholder="At least 6 characters"
                    className="input-field"
                    style={{ paddingLeft: "2.75rem" }}
                    value={formData.newPassword}
                    onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                  />
                </div>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{
              width: "100%",
              padding: "0.85rem",
              marginTop: "0.75rem",
              fontSize: "0.95rem",
            }}
          >
            {loading ? (
              "Processing..."
            ) : (
              <>
                {authMode === "forgot"
                  ? "Generate Reset Token"
                  : authMode === "reset"
                  ? "Update Password"
                  : authMode === "login"
                  ? "Sign In to Studio"
                  : "Create Account"}
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {(authMode === "forgot" || authMode === "reset") && (
          <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
            <button
              type="button"
              onClick={() => {
                setSimulationNotice(null);
                setAuthMode("login");
              }}
              style={{
                background: "none",
                border: "none",
                color: "var(--text-secondary)",
                fontSize: "0.85rem",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              ← Back to Sign In
            </button>
          </div>
        )}

        {/* Feature Highlights Footer */}
        <div
          style={{
            marginTop: "2.25rem",
            paddingTop: "1.5rem",
            borderTop: "1px solid var(--border-subtle)",
            display: "flex",
            justifyContent: "space-around",
            fontSize: "0.75rem",
            color: "var(--text-muted)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
            <CheckCircle2 size={13} color="#10b981" />
            <span>Pair Token Auth</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
            <CheckCircle2 size={13} color="#10b981" />
            <span>Mobile Simulator</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
            <CheckCircle2 size={13} color="#10b981" />
            <span>Async Telemetry</span>
          </div>
        </div>
      </div>
    </div>
  );
};
