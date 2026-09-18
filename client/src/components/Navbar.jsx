import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Link2, Sparkles, LogOut } from "lucide-react";

export const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const isLinkStudioActive = location.pathname === "/links" || location.pathname === "/";
  const isBioBuilderActive = location.pathname === "/bio";

  return (
    <>
      <nav className="navbar">
        <div className="app-container navbar-inner">
          {/* Brand Logo */}
          <Link to="/" className="brand-logo">
            <div className="brand-icon">
              <Link2 size={18} strokeWidth={2.5} />
            </div>
            <span className="brand-text">
              Short<span className="text-gradient">Hub</span>
            </span>
            <span className="brand-badge">PRO</span>
          </Link>

          {/* Desktop Navigation Pill */}
          {isAuthenticated && (
            <ul className="nav-links desktop-nav-links">
              <li>
                <Link
                  to="/links"
                  className={`nav-link ${isLinkStudioActive ? "active" : ""}`}
                >
                  <Link2 size={15} />
                  <span>Link Studio</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/bio"
                  className={`nav-link ${isBioBuilderActive ? "active" : ""}`}
                >
                  <Sparkles size={15} />
                  <span>Bio Hub Builder</span>
                </Link>
              </li>
            </ul>
          )}

          {/* User Profile & Actions */}
          <div className="navbar-user-actions">
            {isAuthenticated ? (
              <>
                {/* Creator Profile Chip */}
                <div className="creator-chip">
                  <div className="creator-chip-avatar">
                    {user?.name?.[0]?.toUpperCase() || "U"}
                    <span className="pulse-dot emerald avatar-pulse-dot" title="Online" />
                  </div>
                  <div className="creator-chip-info">
                    <span className="creator-chip-name">
                      {user?.name || "Creator"}
                    </span>
                    <span className="creator-chip-email">
                      {user?.email}
                    </span>
                  </div>
                </div>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="btn btn-secondary btn-icon nav-logout-btn"
                  title="Sign Out"
                >
                  <LogOut size={16} />
                </button>
              </>
            ) : (
              <Link to="/login" className="btn btn-primary" style={{ padding: "0.5rem 1.15rem", fontSize: "0.85rem" }}>
                Sign In
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation Dock */}
      {isAuthenticated && (
        <nav className="mobile-bottom-nav" aria-label="Mobile Navigation Dock">
          <Link
            to="/links"
            className={`mobile-nav-item ${isLinkStudioActive ? "active" : ""}`}
          >
            <div className="mobile-nav-icon-wrap">
              <Link2 size={18} />
            </div>
            <span className="mobile-nav-label">Link Studio</span>
          </Link>

          <Link
            to="/bio"
            className={`mobile-nav-item ${isBioBuilderActive ? "active" : ""}`}
          >
            <div className="mobile-nav-icon-wrap">
              <Sparkles size={18} />
            </div>
            <span className="mobile-nav-label">Bio Hub</span>
          </Link>
        </nav>
      )}
    </>
  );
};

