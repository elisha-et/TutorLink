import { useEffect, useState } from "react";
import { api } from "../api";
import { Link } from "react-router-dom";

function Badge({ status }) {
  const cls =
    status === "open" ? "bdg open" :
    status === "matched" ? "bdg matched" :
    "bdg closed";
  return <span className={cls}>{status}</span>;
}

export default function StudentRequests() {
  const [list, setList] = useState([]);
  const [err, setErr] = useState("");

  async function load() {
    setErr("");
    try {
      // requires backend to support ?mine=true (patch below)
      const { data } = await api.get("/help-requests?mine=true");
      setList(data);
    } catch (e) {
      setErr(e?.response?.data?.detail || "Failed to load your requests");
    }
  }

  useEffect(() => { load(); }, []);

  return (
    <div className="page-shell">
      <div className="page-header row-between">
        <h1 className="page-title">My Help Requests</h1>
        <Link to="/student/request" className="nav-btn primary">New Request</Link>
      </div>

      {err && <div className="notice error" style={{marginBottom:12}}>{err}</div>}

      <ul className="req-list">
        {list.map(r => (
          <li key={r.id} className="req-item">
            <div className="req-left">
              <div>
                <div className="req-name">{r.subject}</div>
                <div className="muted">{(r.preferred_times && r.preferred_times[0]) || ""}</div>
              </div>
            </div>
            <Badge status={r.status} />
          </li>
        ))}
      </ul>

      {!list.length && (
        <p className="muted">
          You don't have any requests yet. <Link to="/student/request" className="link">Create one</Link>.
        </p>
      )}
    </div>
  );
}
