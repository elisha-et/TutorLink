import { NavLink, Link } from "react-router-dom";
import { useAuth } from "../auth";

function Brand() {
  return (
    <Link to="/" className="brand" aria-label="TutorLink home">
      <span className="logo-dot" />
      <span className="brand-name">TutorLink</span>
    </Link>
  );
}

export default function NavBar() {
  const { user, logout } = useAuth();

  // role-based nav items
  const links = !user
    ? [
        { to: "/browse", label: "Find a Tutor" },
        { to: "/login", label: "Log in" },
        { to: "/register", label: "Sign up", primary: true },
      ]
    : user.role === "tutor"
    ? [
        { to: "/", label: "Dashboard" },
        { to: "/tutor/requests", label: "Help Requests" }, // tutor view
      ]
    : [
        { to: "/", label: "Dashboard" },
        { to: "/browse", label: "Find a Tutor" },
        { to: "/student/requests", label: "Help Requests" }, // student view
      ];

  const initials =
    user?.name?.trim()?.split(/\s+/).map(s => s[0].toUpperCase()).slice(0,2).join("") || "U";

  return (
    <header className="navbar">
      <div className="navbar-in">
        <Brand />

        <nav className="nav">
          {links.map(l =>
            l.primary ? (
              <Link key={l.to} to={l.to} className="nav-btn primary">{l.label}</Link>
            ) : (
              <NavLink
                key={l.to}
                to={l.to}
                className={({isActive}) => "nav-link" + (isActive ? " active" : "")}
              >
                {l.label}
              </NavLink>
            )
          )}
        </nav>

        {user && (
          <div className="nav-right">
            <button className="icon-btn" title="Notifications" aria-label="Notifications">
              {/* bell icon */}
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M14 19a2 2 0 1 1-4 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                <path d="M6 8a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
              </svg>
              <span className="notif-dot" />
            </button>
            <div className="avatar" title={user.name}>{initials}</div>
            <button className="nav-btn ghost" onClick={logout}>Logout</button>
          </div>
        )}
      </div>
    </header>
  );
}
