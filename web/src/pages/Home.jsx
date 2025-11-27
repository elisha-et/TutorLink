// src/pages/Home.jsx
import { useNavigate, Link } from "react-router-dom";

export default function Home() {
  const nav = useNavigate();
  const go = (role) => nav(`/register?role=${role}`);

  return (
    <div className="landing-shell">
      <div className="landing-card">
        <div className="landing-hero">
          <img
            src="/hero.png"
            onError={(e) => {
              e.currentTarget.src =
                "https://lh3.googleusercontent.com/aida-public/AB6AXuDdBAhi1wa2cL9ePTiSkBdAvJGJnut-FH8ljYG_pAWawwznbE_HX-bu0TLEkWV0EQKZ89rfS1x-bO6YrZ6fX2BOT3_QAzK2z3gE8lxZKOnch63pXVS-LeZ5C1AbUJgPRE98JQ2yi0tokv-eXqiAWhjOAAMPvG7uddFWgxXDkRNdSJXOiCkDaF8Ig1JyoH3kufQ9yKQt47hmygIWTrQoT-f1fHQfT7GWgj6LXfUHNZVk78sp7OrtE_arxCGkWMOfikG3CvhT0D8UuAA";
            }}
            alt="Students collaborating"
          />
        </div>

        <h1 className="landing-title">Welcome to TutorLink</h1>
        <p className="landing-sub">
          Connect with classmates for academic support. Choose your role to get started.
        </p>

        <div className="landing-actions">
          <button className="btn btn-primary" onClick={() => go("student")}>
            Student
          </button>
          <button className="btn btn-ghost" onClick={() => go("tutor")}>
            Tutor
          </button>
        </div>

        <p className="landing-login">
          Already have an account?{" "}
          <Link to="/login" className="link">Log in</Link>
        </p>
      </div>
    </div>
  );
}
