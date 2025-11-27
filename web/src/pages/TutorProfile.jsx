import { useState } from "react";
import { api } from "../api";
import { useAuth } from "../auth";

function toList(csv) {
  return (csv || "").split(",").map(s => s.trim()).filter(Boolean);
}
function toCSV(list) {
  return (list || []).join(", ");
}

export default function TutorProfile() {
  const { user } = useAuth();
  const [name] = useState(user?.name || ""); // name edited at registration; read-only here
  const [bio, setBio] = useState("");
  const [subjects, setSubjects] = useState("Calc I, Chem 101, Intro to Python");
  const [availability, setAvailability] = useState("Mon 3–5 pm, Wed 6–8 pm");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setMsg(""); setErr("");
    try {
      await api.post("/tutors/profile", {
        bio,
        subjects: toList(subjects),
        availability: toList(availability),
      });
      setMsg("Profile saved!");
    } catch (e) {
      setErr(e?.response?.data?.detail || "Save failed");
    }
  }

  return (
    <div className="page-shell">
      <div className="page-header">
        <h1 className="page-title">Set Up Your Tutor Profile</h1>
        <p className="page-sub">Make your profile shine to attract more students.</p>
      </div>

      <div className="form-card">
        <form onSubmit={onSubmit} className="form-grid">
          <label className="label">
            <span>Full Name</span>
            <input className="input" value={name} disabled />
          </label>

          <label className="label">
            <span>Short Bio</span>
            <textarea
              className="textarea"
              rows={4}
              placeholder="Tell students about your tutoring style and experience..."
              value={bio}
              onChange={e=>setBio(e.target.value)}
            />
          </label>

          <label className="label">
            <span>Subjects</span>
            <input
              className="input"
              placeholder="e.g., Calc I, Chem 101, Intro to Python"
              value={subjects}
              onChange={e=>setSubjects(e.target.value)}
            />
          </label>

          <label className="label">
            <span>Availability</span>
            <input
              className="input"
              placeholder="e.g., Mon 3–5 pm, Wed 6–8 pm"
              value={availability}
              onChange={e=>setAvailability(e.target.value)}
            />
          </label>

          {msg && <div className="notice success">{msg}</div>}
          {err && <div className="notice error">{err}</div>}

          <button type="submit" className="btn btn-primary btn-lg">
            Save Profile
          </button>
        </form>
      </div>

      <footer className="page-foot">© 2024 TutorLink. All rights reserved.</footer>
    </div>
  );
}
