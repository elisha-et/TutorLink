import { useEffect, useState } from "react";
import { api } from "../api";

function RequestItem({ r, onAccept, onDecline }) {
  return (
    <li className={`req-item ${r.status !== "open" ? "is-dim" : ""}`}>
      <div className="req-left">
        <div className="avatar" style={{backgroundImage:`url(${r.avatar || "https://i.pravatar.cc/100"})`}} />
        <div>
          <div className={`req-name ${r.status !== "open" ? "muted": ""}`}>{r.student_name || "Student"}</div>
          <div className="req-sub muted">{r.subject} — {r.time || "Preferred time"}</div>
        </div>
      </div>
      <div className="req-actions">
        {r.status === "open" ? (
          <>
            <button className="btn btn-ghost pill" onClick={()=>onDecline(r)}>Decline</button>
            <button className="btn btn-primary pill" onClick={()=>onAccept(r)}>Accept</button>
          </>
        ) : (
          <button className="btn pill" disabled>{r.status[0].toUpperCase()+r.status.slice(1)}</button>
        )}
      </div>
    </li>
  );
}

export default function TutorRequests() {
  const [list, setList] = useState([]);
  const [tab, setTab] = useState("new"); // "new" | "history"
  const [err, setErr] = useState("");

  async function load() {
    setErr("");
    try {
      // requires GET /help-requests?status=open (see backend patch)
      const { data } = await api.get("/help-requests?status=open");
      // map minimal fields for UI
      const mapped = data.map(x => ({
        id: x.id,
        subject: x.subject,
        status: x.status,
        student_name: x.student_name || "Student",
        time: (x.preferred_times && x.preferred_times[0]) || "",
      }));
      setList(mapped);
    } catch (e) {
      setErr(e?.response?.data?.detail || "Failed to load requests");
    }
  }

  useEffect(() => { load(); }, []);

  async function accept(r) {
    try {
      // minimal: mark request matched (see backend patch)
      await api.patch(`/help-requests/${r.id}`, { status: "matched" });
      setList(prev => prev.map(x => x.id === r.id ? {...x, status: "matched"} : x));
    } catch (e) {
      alert(e?.response?.data?.detail || "Accept failed");
    }
  }

  async function decline(r) {
    try {
      await api.patch(`/help-requests/${r.id}`, { status: "closed" });
      setList(prev => prev.map(x => x.id === r.id ? {...x, status: "closed"} : x));
    } catch (e) {
      alert(e?.response?.data?.detail || "Decline failed");
    }
  }

  const visible = tab === "new" ? list.filter(r => r.status === "open") : list.filter(r => r.status !== "open");

  return (
    <div className="page-shell">
      <div className="page-header row-between">
        <h1 className="page-title">Help Requests</h1>
        <div className="seg">
          <button className={`seg-btn ${tab==="new"?"on":""}`} onClick={()=>setTab("new")}>New</button>
          <button className={`seg-btn ${tab==="history"?"on":""}`} onClick={()=>setTab("history")}>History</button>
        </div>
      </div>

      {err && <div className="notice error" style={{marginBottom:12}}>{err}</div>}

      <ul className="req-list">
        {visible.map(r => (
          <RequestItem key={r.id} r={r} onAccept={accept} onDecline={decline} />
        ))}
      </ul>

      {!visible.length && <p className="muted">No items yet.</p>}
    </div>
  );
}
