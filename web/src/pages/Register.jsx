import { useState } from "react";
import { useAuth } from "../auth";
import { useNavigate, Link, useLocation } from "react-router-dom";

export default function Register() {
  const { registerUser } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const initialRole = new URLSearchParams(loc.search).get("role") || "student";

  const [name, setName] = useState("");
  const [role, setRole] = useState(initialRole); // "student" | "tutor"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    try {
      await registerUser({ name, email, password, role });
      nav("/", { replace: true });
    } catch (e) {
      setErr(e?.response?.data?.detail || "Registration failed");
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <h1 className="auth-title">Create your account</h1>
        <p className="auth-sub">Join TutorLink and start giving or getting help.</p>

        {/* Segmented role picker */}
        <div className="segmented" role="tablist" aria-label="Choose role">
          <button
            type="button"
            role="tab"
            aria-selected={role === "student"}
            className={`seg-item ${role === "student" ? "is-active" : ""}`}
            onClick={()=>setRole("student")}
          >
            Student
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={role === "tutor"}
            className={`seg-item ${role === "tutor" ? "is-active" : ""}`}
            onClick={()=>setRole("tutor")}
          >
            Tutor
          </button>
        </div>

        <form onSubmit={onSubmit} className="form-grid" style={{marginTop: 10}}>
          <label className="label">
            <span>Full name</span>
            <input
              className="input"
              placeholder="Jordan Okafor"
              value={name}
              onChange={e=>setName(e.target.value)}
            />
          </label>

          <label className="label">
            <span>Email</span>
            <input
              className="input"
              placeholder="you@school.edu"
              value={email}
              onChange={e=>setEmail(e.target.value)}
            />
          </label>

          <label className="label">
            <span>Password</span>
            <input
              className="input"
              type="password"
              placeholder="Create a password"
              value={password}
              onChange={e=>setPassword(e.target.value)}
            />
          </label>

          {/* Keep a hidden select for accessibility/fallback if you want */}
          <select
            value={role}
            onChange={e=>setRole(e.target.value)}
            style={{ display: "none" }}
            aria-hidden="true"
          >
            <option value="student">Student</option>
            <option value="tutor">Tutor</option>
          </select>

          {err && <div className="err">{err}</div>}

          <button type="submit" className="btn btn-primary" style={{marginTop: 4}}>
            Create account
          </button>
        </form>

        <p className="auth-foot">
          Already have an account? <Link to="/login" className="link">Log in</Link>
        </p>
      </div>
    </div>
  );
}
