// Round1Task2.jsx
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import API from "../api";

const TOTAL_TIME = 20 * 60; // 20 minutes

const questions = [
  {
    id: 1,
    title: "Question 1",
    description: "Write a program to print the following number triangle pattern.",
    expectedOutput: `1 \n2 3 \n4 5 6 \n7 8 9 10 \n11 12 13 14 15`,
    displayOutput: `1 \n2 3 \n4 5 6 \n7 8 9 10 \n11 12 13 14 15`,
    marks: 14,
  },
  {
    id: 2,
    title: "Question 2",
    description: "Write a program to print the following.",
    expectedOutput: `4 4 4 4 4 4 4 
4 3 3 3 3 3 4 
4 3 3 3 3 3 4 
4 4 4 4 4 4 4 `,
    displayOutput: `4 4 4 4 4 4 4 
4 3 3 3 3 3 4 
4 3 3 3 3 3 4 
4 4 4 4 4 4 4 `,
    marks: 14,
  },
];

const LANG_PLACEHOLDERS = {
  python: `# Python example for Q1\nn = 1\nfor i in range(1, 6):\n    for j in range(i):\n        print(n, end=' ')\n        n += 1\n    print()`,
  c: `// C example\n#include <stdio.h>\nint main() {\n    // your code here\n    return 0;\n}`,
  java: `// Java example\npublic class Main {\n    public static void main(String[] args) {\n        // your code here\n    }\n}`,
};

// Per-question state shape
const defaultQuestionState = () => ({
  code: "",
  runState: "idle", // idle | running | correct | wrong | error
  stdout: "",
  errorMsg: "",
});

export default function Round1Task2() {
  const taskKey = "round1task2";
  const nextRoute = "/round2";
  const navigate = useNavigate();

  const [language, setLanguage] = useState("python");
  const [qStates, setQStates] = useState(questions.map(() => defaultQuestionState()));
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);
  const [submitting, setSubmitting] = useState(false);
  const timerRef = useRef(null);

  // ── Countdown timer ──────────────────────────────────────────────────────
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleFinish(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec < 10 ? "0" : ""}${sec}`;
  };

  // ── Helpers ───────────────────────────────────────────────────────────────
  const setQState = (index, updates) => {
    setQStates((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], ...updates };
      return next;
    });
  };

  // Auto-detect language from code content (used at run-time)
  const detectLanguage = (code) => {
    if (/public\s+class\s+\w+|System\.out\.|import\s+java\./i.test(code)) return "java";
    if (/#include\s*<|#include\s*"|int\s+main\s*\(|printf\s*\(/i.test(code)) return "c";
    return "python";
  };

  const handleCodeChange = (index, value) => {
    setQState(index, { code: value, runState: "idle", stdout: "", errorMsg: "" });
  };

  // ── Run & Judge ───────────────────────────────────────────────────────────
  const runAndCheck = async (index) => {
    const code = qStates[index].code.trim();
    if (!code) return;

    // Auto-detect language from code; override manual selection if Java/C detected
    const detectedLang = detectLanguage(code);
    const effectiveLang = detectedLang !== "python" ? detectedLang : language;
    if (detectedLang !== "python") setLanguage(detectedLang);

    setQState(index, { runState: "running", stdout: "", errorMsg: "" });

    try {
      const res = await axios.post(`${API}/api/code/judge`, {
        code,
        language: effectiveLang,
        expectedOutput: questions[index].expectedOutput,
      });

      if (!res.data.success) {
        setQState(index, {
          runState: "error",
          errorMsg: res.data.message || "Execution failed",
        });
        return;
      }

      const { isCorrect, stdout, stderr, compile_output, status } = res.data;

      if (isCorrect) {
        setQState(index, { runState: "correct", stdout });
      } else {
        // Show compile / runtime errors if present
        const errDetails = compile_output || stderr || "";
        if (errDetails) {
          setQState(index, {
            runState: "error",
            errorMsg: `${status}\n${errDetails}`,
            stdout,
          });
        } else {
          setQState(index, { runState: "wrong", stdout });
        }
      }
    } catch (err) {
      console.error(err);
      setQState(index, {
        runState: "error",
        errorMsg: "Could not connect to Judge0. Is it running?",
      });
    }
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleFinish = async (auto = false) => {
    if (submitting) return;
    setSubmitting(true);
    clearInterval(timerRef.current);

    let score = 0;
    qStates.forEach((qs, i) => {
      if (qs.runState === "correct") score += questions[i].marks;
    });

    localStorage.setItem(taskKey, String(score));

    try {
      const participantId = localStorage.getItem("participantId");
      if (!participantId) {
        alert("Participant not logged in ❌");
        setSubmitting(false);
        return;
      }
      await axios.put(
        `${API}/api/participants/updateScore/${participantId}`,
        { task: taskKey, score }
      );
    } catch (error) {
      console.error("MongoDB Save Error:", error);
      alert("Error saving score ❌");
      setSubmitting(false);
      return;
    }

    if (auto) alert("⏰ Time's up! Your answers have been submitted.");
    navigate(nextRoute);
  };

  // ── Styling helpers ────────────────────────────────────────────────────────
  const urgentTimer = timeLeft <= 60;

  const statusBadge = (runState) => {
    switch (runState) {
      case "running":
        return { text: "⏳ Running...", color: "#f59e0b", bg: "#fef3c7" };
      case "correct":
        return { text: "✅ Correct Output!", color: "#16a34a", bg: "#dcfce7" };
      case "wrong":
        return { text: "❌ Wrong Output", color: "#dc2626", bg: "#fee2e2" };
      case "error":
        return { text: "⚠️ Error", color: "#ea580c", bg: "#ffedd5" };
      default:
        return null;
    }
  };

  return (
    <div style={{ padding: "40px", fontFamily: "Arial" }}>
      <h1>🚀 Round 1 - Task 2</h1>
      <h2>Reverse Coding (2 Questions)</h2>

      <p style={{
        fontSize: "20px",
        fontWeight: "bold",
        color: timeLeft <= 60 ? "red" : "black",
      }}>
        ⏳ Time Left: {formatTime(timeLeft)}
      </p>

      {/* Language Selection */}
      <div style={{ marginBottom: "20px" }}>
        <label style={{ fontWeight: "bold", marginRight: "10px" }}>Language:</label>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          style={{ padding: "5px", borderRadius: "5px" }}
        >
          <option value="python">Python</option>
          <option value="c">C </option>
          <option value="java">Java</option>
        </select>
      </div>

      {questions.map((q, index) => {
        const qs = qStates[index];
        const badge = statusBadge(qs.runState);

        return (
          <div key={q.id} style={{ marginBottom: "40px", borderBottom: "1px solid #ccc", paddingBottom: "20px" }}>
            <h3>Q{index + 1} ({q.marks} Marks)</h3>
            <p>{q.description}</p>

            <div style={{ marginBottom: "10px" }}>
              <strong>📋 Expected Output:</strong>
              <pre>
                {q.displayOutput}
              </pre>
            </div>

            <div style={{ marginBottom: "10px" }}>
              <strong>💻 Your Code:</strong>
              <textarea
                rows={10}
                value={qs.code}
                onChange={(e) => handleCodeChange(index, e.target.value)}
                placeholder={LANG_PLACEHOLDERS[language]}
                style={{
                  width: "100%",
                  padding: "10px",
                  fontFamily: "monospace",
                  marginTop: "5px",
                  borderRadius: "5px",
                  border: "1px solid #ccc"
                }}
              />
            </div>

            <button
              onClick={() => runAndCheck(index)}
              disabled={qs.runState === "running" || !qs.code.trim()}
              style={{
                padding: "10px 20px",
                backgroundColor: "#007bff",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
                marginRight: "10px"
              }}
            >
              {qs.runState === "running" ? "⏳ Running..." : "▶ Run & Check"}
            </button>

            {badge && (
              <span style={{
                fontWeight: "bold",
                color: badge.color,
                backgroundColor: badge.bg,
                padding: "5px 10px",
                borderRadius: "5px"
              }}>
                {badge.text}
              </span>
            )}

            {/* Output area */}
            {(qs.runState === "wrong" || qs.runState === "correct") && qs.stdout && (
              <div style={{ marginTop: "10px" }}>
                <strong>📤 Your Output:</strong>
                <pre style={{
                  border: `2px solid ${qs.runState === "correct" ? "green" : "red"}`
                }}>
                  {qs.stdout}
                </pre>
              </div>
            )}

            {/* Error area */}
            {qs.runState === "error" && qs.errorMsg && (
              <div style={{ marginTop: "10px", color: "red" }}>
                <strong>💥 Error Details:</strong>
                <pre style={{ border: "1px solid red" }}>
                  {qs.errorMsg}
                </pre>
              </div>
            )}
          </div>
        );
      })}

      <div style={{ textAlign: "center" }}>
        <button
          onClick={() => handleFinish(false)}
          disabled={submitting}
          style={{
            padding: "15px 30px",
            fontSize: "18px",
            backgroundColor: "green",
            color: "white",
            border: "none",
            borderRadius: "10px",
            cursor: "pointer",
            opacity: submitting ? 0.6 : 1
          }}
        >
          {submitting ? "Submitting..." : "Submit & Proceed to Round 2 ➡"}
        </button>
        <p style={{ marginTop: "10px", color: "#666" }}>
          Solved: {qStates.filter((s) => s.runState === "correct").length} / {questions.length}
        </p>
      </div>
    </div>
  );
}