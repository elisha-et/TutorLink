import { useState } from "react";
import { api } from "../api";

function parseCSV(s) {
  return (s || "")
    .split(",")
    .map(v => v.trim())
    .filter(Boolean);
}

export default function HelpRequest() {
  const [subject, setSubject] = useState("Calculus I");
  const [description, setDescription] = useState("Limits & derivatives");
  const [timesText, setTimesText] = useState("Tue 16:00-18:00");
  const [createdId, setCreatedId] = useState(null);
  const [err, setErr] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setErr(""); setCreatedId(null);
    try {
      const payload = {
        subject,
        description,
        preferred_times: parseCSV(timesText),
      };
      const { data } = await api.post("/help-requests", payload);
      setCreatedId(data.id);
    } catch (e) {
      setErr(e?.response?.data?.detail || "Create failed");
    }
  }

  return (
    <div>
      <h2>New Help Request</h2>
      <form onSubmit={onSubmit} style={{ display: "grid", gap: 8, maxWidth: 600 }}>
        <input placeholder="Subject (e.g., Calculus I)" value={subject} onChange={e=>setSubject(e.target.value)} />
        <textarea placeholder="What do you need help with?" value={description} onChange={e=>setDescription(e.target.value)} rows={4} />
        <input placeholder="Preferred times (comma-separated)" value={timesText} onChange={e=>setTimesText(e.target.value)} />
        {createdId && <div style={{ color: "green" }}>Created request #{createdId}</div>}
        {err && <div style={{ color: "crimson" }}>{err}</div>}
        <button type="submit">Post Request</button>
      </form>
    </div>
  );
}
