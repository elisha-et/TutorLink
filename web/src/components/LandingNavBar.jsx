import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
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

export default function LandingNavBar() {
  const nav = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    setMobileMenuOpen(false);
  };

  const handleFindTutors = () => {
    nav("/browse");
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header className="navbar">
        <div className="navbar-in">
          <Brand />

          <nav className="nav desktop-nav">
            <button
              onClick={() => scrollToSection("features")}
              className="nav-link"
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection("how-it-works")}
              className="nav-link"
            >
              How it Works
            </button>
            <button
              onClick={() => nav("/browse")}
              className="nav-link"
            >
              Find Tutors
            </button>
          </nav>

          <div className="nav-right desktop-nav-right">
            <ThemeToggle />
            <Link to="/login" className="nav-link">
              Log in
            </Link>
            <Link to="/register" className="nav-btn primary">
              Get Started
            </Link>
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
        <button
          onClick={() => scrollToSection("features")}
          className="mobile-menu-item"
        >
          <span>Features</span>
        </button>
        <button
          onClick={() => scrollToSection("how-it-works")}
          className="mobile-menu-item"
        >
          <span>How it Works</span>
        </button>
        <button
          onClick={handleFindTutors}
          className="mobile-menu-item"
        >
          <span>Find Tutors</span>
        </button>
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
      </MobileMenu>
    </>
  );
}
