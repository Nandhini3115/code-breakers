import { useState, useEffect } from "react";
import axios from "axios";
import API from "../api";

export default function AdminDashboard() {
  const [name, setName] = useState("");
  const [college, setCollege] = useState("");
  const [password, setPassword] = useState("");
  const [participants, setParticipants] = useState([]);

  const fetchParticipants = async () => {
    const res = await axios.get(`${API}/api/participants/all`);
    setParticipants(res.data);
  };

  useEffect(() => {
    fetchParticipants();
  }, []);

  const handleAdd = async () => {
    if (!name || !college || !password) {
      alert("Fill all fields ❌");
      return;
    }

    await axios.post(`${API}/api/participants/add`, {
      name,
      college,
      password,
    });

    alert("Participant Added Successfully ✅");

    setName("");
    setCollege("");
    setPassword("");
    fetchParticipants();
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "50px",
        fontFamily: "Segoe UI, sans-serif",
        backgroundColor: "#ffffff",
      }}
    >
      <h1
        style={{
          textAlign: "center",
          marginBottom: "40px",
          fontSize: "32px",
          fontWeight: "600",
        }}
      >
        👑 Admin Dashboard
      </h1>

      {/* Add Participant Card */}
      <div
        style={{
          maxWidth: "450px",
          margin: "0 auto",
          padding: "30px",
          borderRadius: "16px",
          backgroundColor: "#f9fafb",
          boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
        }}
      >
        <h2 style={{ marginBottom: "20px", fontWeight: "600" }}>
          ➕ Add Participant
        </h2>

        <input
          placeholder="Participant Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={inputStyle}
        />

        <input
          placeholder="College Name"
          value={college}
          onChange={(e) => setCollege(e.target.value)}
          style={inputStyle}
        />

        <input
          type="password"
          placeholder="Create Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={inputStyle}
        />

        <button onClick={handleAdd} style={buttonStyle}>
          Add Participant
        </button>
      </div>

      {/* Leaderboard */}
      <div
        style={{
          marginTop: "60px",
          backgroundColor: "#ffffff",
          padding: "30px",
          borderRadius: "16px",
          boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
        }}
      >
        <h2
          style={{
            marginBottom: "20px",
            fontWeight: "600",
          }}
        >
          🏆 Leaderboard
        </h2>

        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            textAlign: "center",
          }}
        >
          <thead>
            <tr style={{ backgroundColor: "#111827", color: "white" }}>
              <th style={thStyle}>Rank</th>
              <th style={thStyle}>Name</th>
              <th style={thStyle}>College</th>
              <th style={thStyle}>R1 T1</th>
              <th style={thStyle}>R1 T2</th>
              <th style={thStyle}>R2</th>
              <th style={thStyle}>Total</th>
            </tr>
          </thead>

          <tbody>
            {participants.map((p, index) => (
              <tr
                key={p._id}
                style={{
                  backgroundColor:
                    index === 0
                      ? "#fef9c3"
                      : index === 1
                        ? "#e5e7eb"
                        : index === 2
                          ? "#fcd7aa"
                          : "white",
                  fontWeight: index < 3 ? "600" : "400",
                  transition: "0.2s",
                }}
              >
                <td style={tdStyle}>{index + 1}</td>
                <td style={tdStyle}>{p.name}</td>
                <td style={tdStyle}>{p.college}</td>
                <td style={tdStyle}>{p.round1Task1Score || 0}</td>
                <td style={tdStyle}>{p.round1Task2Score || 0}</td>
                <td style={tdStyle}>{p.round2Score || 0}</td>
                <td style={{ ...tdStyle, fontWeight: "700" }}>
                  {p.totalScore || 0}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "12px",
  marginBottom: "15px",
  borderRadius: "8px",
  border: "1px solid #d1d5db",
  fontSize: "14px",
};

const buttonStyle = {
  width: "100%",
  padding: "12px",
  borderRadius: "8px",
  border: "none",
  backgroundColor: "#2563eb",
  color: "white",
  fontWeight: "600",
  fontSize: "15px",
  cursor: "pointer",
};

const thStyle = {
  padding: "12px",
};

const tdStyle = {
  padding: "10px",
  borderBottom: "1px solid #e5e7eb",
};
