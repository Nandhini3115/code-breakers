import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Round2() {
  const navigate = useNavigate();

  // ✅ Timer: 20 minutes
  const totalTime = 20 * 60;
  const [timeLeft, setTimeLeft] = useState(totalTime);

  // ✅ Start time for score calculation
  const [startTime] = useState(Date.now());

  // Answers
  const [cipher1, setCipher1] = useState("");
  const [cipher2, setCipher2] = useState("");

  // Correct answers
  const correctCipher1 = "SECURITYKEYDISCOVERED";
  const correctCipher2 = "AREKYAQQPMZO";

  // Prevent multiple submissions
  const [submitted, setSubmitted] = useState(false);

  // Live feedback
  const checkAnswer = (input, correct) => {
    if (input === "") return "";
    return input.toUpperCase() === correct ? "✅ Correct" : "❌ Wrong";
  };

  // ✅ Timer Countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);

          alert("⏳ Time Over! Score = 0");
          finishRound(true); // force submit with score 0
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // ✅ Finish Round Function
  const finishRound = async (timeOver = false) => {
    if (submitted) return;
    setSubmitted(true);

    let score = 0;

    // Check correctness
    if (cipher1.toUpperCase() === correctCipher1) {
      score += 20;
    }
    if (cipher2.toUpperCase() === correctCipher2) {
      score += 20;
    }

    // ❌ If time over, and no questions were correct, score remains 0
    if (timeOver && score === 0) {
      score = 0;
    }

    // ✅ Save Round2 Score in MongoDB
    try {
      const participantId = localStorage.getItem("participantId");

      if (!participantId) {
        alert("Participant not logged in ❌");
        return;
      }

      await axios.put(
        `http://localhost:5000/api/participants/updateScore/${participantId}`,
        {
          task: "round2",
          score: score,
        }
      );

      console.log("Round2 Score Saved in MongoDB ✅");

      // Navigate to Result page
      navigate("/result");
    } catch (error) {
      console.error("MongoDB Save Error:", error);
      alert("Error saving score ❌");
      setSubmitted(false);
    }
  };

  // ✅ Submit button unlock condition
  const completedCorrectly =
    cipher1.toUpperCase() === correctCipher1 &&
    cipher2.toUpperCase() === correctCipher2;

  return (
    <div style={{ padding: "40px", fontFamily: "Arial" }}>
      <h1>🔐 Round 2: Cipher Hunt</h1>

      {/* Timer */}
      <h2 style={{ color: timeLeft <= 60 ? "red" : "black" }}>
        ⏳ Time Left: {Math.floor(timeLeft / 60)}:
        {timeLeft % 60 < 10 ? "0" : ""}
        {timeLeft % 60}
      </h2>

      {/* Cipher Question 1 */}
      <div style={{ marginTop: "30px" }}>
        <h3>Cipher Question 1 (20 Points) (Rail Fence Cipher use 3 rails)</h3>
        <p>
          Cipher Text: <b>SRKIVDEUIYEDSOEECTYCR</b>
        </p>
        <p>Hint: Caesar Cipher Shift = 3</p>

        <input
          placeholder="Enter Plain Text"
          value={cipher1}
          onChange={(e) => setCipher1(e.target.value)}
        />

        <p>{checkAnswer(cipher1, correctCipher1)}</p>
      </div>

      {/* Cipher Question 2 */}
      <div style={{ marginTop: "30px" }}>
        <h3>Cipher Question 2 (20 Points) (Hill Cipher use 3*3 matrix)</h3>
        <p>
          Cipher Text: <b>CRACKTHECODE</b>
        </p>
        <p>Hint: Key = First 6 letters of Answer 1</p>

        <input
          placeholder="Enter Plain Text"
          value={cipher2}
          onChange={(e) => setCipher2(e.target.value)}
        />

        <p>{checkAnswer(cipher2, correctCipher2)}</p>
      </div>

      {/* ✅ Submit button ONLY appears if completed correctly */}
      {completedCorrectly && (
        <button
          disabled={submitted}
          style={{
            marginTop: "30px",
            padding: "12px 25px",
            fontSize: "18px",
            background: "green",
            color: "white",
            border: "none",
            borderRadius: "10px",
            cursor: "pointer",
          }}
          onClick={() => finishRound(false)}
        >
          ✅ Submit Round 2
        </button>
      )}

      {!completedCorrectly && (
        <p style={{ marginTop: "20px", color: "gray" }}>
          Solve both cipher questions correctly to unlock Submit 🔒
        </p>
      )}
    </div>
  );
}
