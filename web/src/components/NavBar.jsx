import { useState } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth";
import { useTheme } from "../contexts/ThemeContext";
import RoleSwitcher from "./RoleSwitcher";
import ThemeToggle from "./ThemeToggle";
import MobileMenu from "./MobileMenu";

function Brand() {
  const { theme } = useTheme();
  const logoSrc = theme === "dark" ? "/logo-dark.png" : "/logo-light.png";
  
  return (
    <Link to="/" className="brand" aria-label="TutorLink home">
      <img src={logoSrc} alt="TutorLink" className="brand-logo" />
      <span className="brand-name">TutorLink</span>
    </Link>
  );
}

export default function NavBar() {
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Show loading state or empty nav while checking auth
  if (loading) {
    return (
      <header className="navbar">
        <div className="navbar-in">
          <Brand />
          <nav className="nav desktop-nav">
            <div style={{ padding: "6px 2px", color: "var(--muted)" }}>Loading...</div>
          </nav>
          <button
            className="mobile-menu-btn"
            aria-label="Toggle menu"
            disabled
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </div>
      </header>
    );
  }

  // Determine which role's links to show based on activeRole
  // Use activeRole first, fall back to first role in roles array, then legacy role field
  const displayRole = user?.activeRole || user?.roles?.[0] || user?.role;

  // Role-based nav items
  const links = !user
    ? [
        { to: "/browse", label: "Find a Tutor" },
        { to: "/login", label: "Log in" },
        { to: "/register", label: "Sign up", primary: true },
      ]
    : displayRole === "tutor"
    ? [
        { to: "/", label: "Dashboard" },
        { to: "/tutor/requests", label: "Requests" },
        { to: "/tutor/profile", label: "My Profile" },
      ]
    : [
        { to: "/", label: "Dashboard" },
        { to: "/browse", label: "Find a Tutor" },
        { to: "/student/requests", label: "My Requests" },
        { to: "/student/profile", label: "My Profile" },
      ];

  const initials = user?.name
    ?.trim()
    ?.split(/\s+/)
    .map((s) => s[0].toUpperCase())
    .slice(0, 2)
    .join("") || "U";

  // Check if user has multiple roles
  const hasMultipleRoles = user?.roles?.length > 1;

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Logout failed:", error);
      navigate("/", { replace: true });
    }
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header className="navbar">
        <div className="navbar-in">
          <Brand />

          <nav className="nav desktop-nav">
            {links.map((l) =>
              l.primary ? (
                <Link key={l.to} to={l.to} className="nav-btn primary">
                  {l.label}
                </Link>
              ) : (
                <NavLink
                  key={l.to}
                  to={l.to}
                  className={({ isActive }) =>
                    "nav-link" + (isActive ? " active" : "")
                  }
                >
                  {l.label}
                </NavLink>
              )
            )}
          </nav>

          <div className="nav-right desktop-nav-right">
            <ThemeToggle />
            {user && (
              <>
                {/* Role switcher - only shown if user has multiple roles */}
                {hasMultipleRoles && <RoleSwitcher />}
                
                <button
                  className="icon-btn"
                  title="Notifications"
                  aria-label="Notifications"
                >
                  {/* Bell icon */}
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M14 19a2 2 0 1 1-4 0"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                    />
                    <path
                      d="M6 8a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6Z"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="notif-dot" />
                </button>
                <div className="avatar" title={user.name}>
                  {initials}
                </div>
                <button 
                  className="nav-btn ghost" 
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            )}
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      <MobileMenu isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)}>
        {!user ? (
          <>
            <Link
              to="/browse"
              className="mobile-menu-item"
              onClick={() => setMobileMenuOpen(false)}
            >
              <span>Find a Tutor</span>
            </Link>
            <Link
              to="/login"
              className="mobile-menu-item"
              onClick={() => setMobileMenuOpen(false)}
            >
              <span>Log in</span>
            </Link>
            <Link
              to="/register"
              className="mobile-menu-item mobile-menu-item-primary"
              onClick={() => setMobileMenuOpen(false)}
            >
              <span>Sign up</span>
            </Link>
          </>
        ) : (
          <>
            {links.map((l) =>
              l.primary ? (
                <Link
                  key={l.to}
                  to={l.to}
                  className="mobile-menu-item mobile-menu-item-primary"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span>{l.label}</span>
                </Link>
              ) : (
                <NavLink
                  key={l.to}
                  to={l.to}
                  className={({ isActive }) =>
                    `mobile-menu-item ${isActive ? "mobile-menu-item-active" : ""}`
                  }
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span>{l.label}</span>
                </NavLink>
              )
            )}
            {hasMultipleRoles && (
              <div className="mobile-menu-item mobile-menu-item-role-switcher">
                <RoleSwitcher />
              </div>
            )}
            <button
              className="mobile-menu-item mobile-menu-item-logout"
              onClick={handleLogout}
            >
              <span>Logout</span>
            </button>
          </>
        )}
      </MobileMenu>
    </>
  );
}
