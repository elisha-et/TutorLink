import { useState } from "react";
import { api } from "../api";

export default function BrowseTutors() {
  const [subject, setSubject] = useState("Calculus I");
  const [results, setResults] = useState([]);
  const [err, setErr] = useState("");

  async function search() {
    setErr("");
    try {
      const q = subject ? `?subject=${encodeURIComponent(subject)}` : "";
      const { data } = await api.get(`/tutors/search${q}`);
      setResults(data);
    } catch (e) {
      setErr(e?.response?.data?.detail || "Search failed");
    }
  }

  return (
    <div>
      <h2>Browse Tutors</h2>
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <input value={subject} onChange={e=>setSubject(e.target.value)} placeholder="Subject filter (e.g., Calculus I)" />
        <button onClick={search}>Search</button>
      </div>
      {err && <div style={{ color: "crimson" }}>{err}</div>}
      <ul style={{ listStyle: "none", padding: 0 }}>
        {results.map((t) => (
          <li key={t.tutor_id} style={{ border: "1px solid #ddd", borderRadius: 8, padding: 12, marginBottom: 10 }}>
            <div style={{ fontWeight: 600 }}>{t.name}</div>
            <div style={{ whiteSpace: "pre-wrap" }}>{t.bio}</div>
            <div style={{ fontSize: 14, opacity: 0.8 }}>
              Subjects: {t.subjects?.join(", ") || "—"}
            </div>
          </li>
        ))}
      </ul>
      {!results.length && <p>Try searching by subject (e.g., “Calculus I”).</p>}
    </div>
  );
}
