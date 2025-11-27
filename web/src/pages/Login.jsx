import { useState } from "react";
import { useAuth } from "../auth";
import { useLocation, useNavigate, Link } from "react-router-dom";

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const nav = useNavigate();
  const loc = useLocation();
  const from = loc.state?.from?.pathname || "/";

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    try {
      await login(email, password);
      nav(from, { replace: true });
    } catch (e) {
      setErr(e?.response?.data?.detail || "Login failed");
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <h1 className="auth-title">Log in</h1>
        <p className="auth-sub">Welcome back! Enter your details to continue.</p>

        <form onSubmit={onSubmit} className="form-grid">
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
              placeholder="••••••••"
              value={password}
              onChange={e=>setPassword(e.target.value)}
            />
          </label>

          {err && <div className="err">{err}</div>}

          <button type="submit" className="btn btn-primary" style={{marginTop: 4}}>
            Log in
          </button>
        </form>

        <p className="auth-foot">
          New here? <Link to="/register" className="link">Create an account</Link>
        </p>
      </div>
    </div>
  );
}
