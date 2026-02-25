import { useEffect, useState } from "react";
import axios from "axios";
import API from "../api";

export default function Result() {
  const [participant, setParticipant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchParticipant = async () => {
      try {
        const participantId = localStorage.getItem("participantId");
        if (!participantId) {
          setError("Participant not found. Please log in again.");
          setLoading(false);
          return;
        }

        // Fetch all participants and find the one matching this ID
        const res = await axios.get(`${API}/api/participants/all`);
        const found = res.data.find((p) => p._id === participantId);

        if (!found) {
          setError("Participant data not found ❌");
        } else {
          setParticipant(found);
        }
      } catch (err) {
        setError("Failed to fetch results. Is the server running?");
      } finally {
        setLoading(false);
      }
    };

    fetchParticipant();
  }, []);

  const rounds = [
    {
      label: "Round 1 - Task 1",
      emoji: "🧠",
      score: participant?.round1Task1Score ?? 0,
      max: 32,
      color: "#6366f1",
    },
    {
      label: "Round 1 - Task 2",
      emoji: "💻",
      score: participant?.round1Task2Score ?? 0,
      max: 28,
      color: "#0ea5e9",
    },
    {
      label: "Round 2",
      emoji: "🔐",
      score: participant?.round2Score ?? 0,
      max: 40,
      color: "#f59e0b",
    },
  ];

  const totalScore = participant?.totalScore ?? 0;
  const totalMax = 100;

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", fontFamily: "Arial" }}>
        <p style={{ fontSize: "22px", color: "#666" }}>⏳ Loading results...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", fontFamily: "Arial" }}>
        <p style={{ fontSize: "20px", color: "red" }}>❌ {error}</p>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        fontFamily: "'Arial', sans-serif",
        background: "linear-gradient(135deg, #e0e7ff 0%, #f0fdf4 100%)",
        padding: "50px 20px",
      }}
    >
      <div
        style={{
          maxWidth: "720px",
          margin: "0 auto",
          background: "white",
          borderRadius: "24px",
          boxShadow: "0 20px 50px rgba(0,0,0,0.12)",
          padding: "50px 40px",
          textAlign: "center",
        }}
      >
        {/* Header */}
        <div style={{ fontSize: "60px", marginBottom: "10px" }}>🎉</div>
        <h1
          style={{
            fontSize: "2.4rem",
            fontWeight: "800",
            background: "linear-gradient(90deg, #6366f1, #10b981)",
            WebkitBackgroundClip: "text",
            color: "transparent",
            marginBottom: "6px",
          }}
        >
          Event Completed!
        </h1>

        <p style={{ color: "#888", fontSize: "16px", marginBottom: "30px" }}>
          Well done, <strong style={{ color: "#333" }}>{participant?.name}</strong> from <strong style={{ color: "#333" }}>{participant?.college}</strong>!
        </p>

        {/* Total Score Card */}
        <div
          style={{
            background: "linear-gradient(135deg, #6366f1, #10b981)",
            borderRadius: "16px",
            padding: "28px",
            color: "white",
            marginBottom: "40px",
          }}
        >
          <p style={{ fontSize: "16px", opacity: 0.9, marginBottom: "6px" }}>Total Score</p>
          <p style={{ fontSize: "52px", fontWeight: "900", margin: 0 }}>
            {totalScore}
            <span style={{ fontSize: "24px", fontWeight: "400", opacity: 0.8 }}>/{totalMax}</span>
          </p>

          {/* Overall progress bar */}
          <div
            style={{
              marginTop: "18px",
              height: "12px",
              background: "rgba(255,255,255,0.3)",
              borderRadius: "6px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${Math.min((totalScore / totalMax) * 100, 100)}%`,
                height: "100%",
                background: "rgba(255,255,255,0.9)",
                borderRadius: "6px",
                transition: "width 1.2s ease",
              }}
            />
          </div>
        </div>

        {/* Individual Round Breakdown */}
        <div style={{ textAlign: "left" }}>
          <h2 style={{ fontSize: "20px", fontWeight: "700", color: "#333", marginBottom: "20px" }}>
            📊 Score Breakdown
          </h2>

          {rounds.map(({ label, emoji, score, max, color }) => (
            <div
              key={label}
              style={{
                background: "#f9fafb",
                borderRadius: "16px",
                padding: "22px 24px",
                marginBottom: "16px",
                border: `2px solid ${color}22`,
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
                cursor: "default",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-3px)";
                e.currentTarget.style.boxShadow = `0 8px 24px ${color}33`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              {/* Top row */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                <div>
                  <span style={{ fontSize: "22px", marginRight: "10px" }}>{emoji}</span>
                  <span style={{ fontWeight: "700", fontSize: "17px", color: "#222" }}>{label}</span>
                </div>
                <span
                  style={{
                    fontWeight: "800",
                    fontSize: "22px",
                    color: score > 0 ? color : "#ccc",
                  }}
                >
                  {score}
                  <span style={{ fontSize: "14px", fontWeight: "500", color: "#999" }}>/{max}</span>
                </span>
              </div>

              {/* Progress bar */}
              <div
                style={{
                  height: "10px",
                  background: "#e5e7eb",
                  borderRadius: "5px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${Math.min((score / max) * 100, 100)}%`,
                    height: "100%",
                    background: score > 0 ? color : "#e5e7eb",
                    borderRadius: "5px",
                    transition: "width 1s ease",
                  }}
                />
              </div>

              {/* Percentage label */}
              <div style={{ fontSize: "12px", color: "#999", marginTop: "7px", textAlign: "right" }}>
                {max > 0 ? Math.round((score / max) * 100) : 0}% achieved
              </div>
            </div>
          ))}
        </div>

        <p style={{ marginTop: "30px", fontSize: "15px", color: "#aaa" }}>
          Thank you for participating! 🚀
        </p>
      </div>
    </div>
  );
}
