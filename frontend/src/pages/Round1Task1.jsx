import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import API from "../api";

export default function Round1Task1() {
  const navigate = useNavigate();

  const totalTime = 15 * 60;
  const [timeLeft, setTimeLeft] = useState(totalTime);
  const [startTime] = useState(Date.now());

  const [answers, setAnswers] = useState(Array(8).fill(""));

  const correctAnswers = [
    "4321",  // Q1
    "0 1 1 2 3 5 8",    // Q2
    `BREAKERSCODE`,     // Q3
    "15 15",    // Q4
    "dEbUG",     // Q5
    "12 7",     // Q6
    "1 2 6 24 120",    // Q7
    "10 15 20"      // Q8
  ];

  const checkAnswer = (input, correct) => {
    if (input === "") return "";
    return input === correct ? "✅ Correct" : "❌ Wrong";
  };

  const handleChange = (index, value) => {
    const updated = [...answers];
    updated[index] = value;
    setAnswers(updated);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          alert("Time Over! Moving to Task 2...");
          navigate("/round1-task2");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  const handleSubmit = async () => {
    const endTime = Date.now();
    let elapsedSec = Math.floor((endTime - startTime) / 1000);
    if (isNaN(elapsedSec) || elapsedSec < 0) elapsedSec = 0;

    // ✅ NEW SCORING LOGIC (4 points per correct answer)
    let score = 0;
    answers.forEach((ans, index) => {
      if (ans === correctAnswers[index]) {
        score += 4;
      }
    });

    localStorage.setItem("round1task1", String(score));
    localStorage.setItem("round1task1Time", String(elapsedSec));

    try {
      const participantId = localStorage.getItem("participantId");
      if (!participantId) return;

      await axios.put(
        `${API}/api/participants/updateScore/${participantId}`,
        {
          task: "round1task1",
          score: score,
        }
      );

      console.log("Score Saved in MongoDB ✅");
    } catch (error) {
      console.error("MongoDB Save Error:", error);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const questions = [
    `num = 1234
rev = 0

while num > 0:
    rev = rev * 10 + num % 10
    num //= 10

print(rev)`,
    `def rotate(s, n):
    n = n % len(s)
    return s[n:] + s[:n]

text = "CODEBREAKERS"

for i in range(3):
    text = rotate(text, i+1)

print(text)`,
    `#include <stdio.h>
int main() {
    int a = 10;
    int *p = &a;

    *p = *p + 5;
    printf("%d %d", a, *p);

    return 0;
}`,
    `#include<stdio.h>

int main() {
    char str[]="DeBug";
    int i;

    for(i=0;str[i]!='\0';i++){
        if(str[i]>='A' && str[i]<='Z')
            str[i]=str[i]+32;
        else if(str[i]>='a' && str[i]<='z')
            str[i]=str[i]-32;
    }

    printf(str);
}`,
    `#include <stdio.h>
int main() {
    int a = 5;
    int b = a++ + ++a;
    printf("%d %d", b, a);
    return 0;
}
}`,
    `public class Main {
    public static void main(String[] args) {
        int n = 1;
        for(int i=1; i<=5; i++){
            n *= i;
            System.out.print(n + " ");
        }
    }
}`,
    `class Test {
    static int x = 5;

    Test() {
        x += 5;
        System.out.print(x + " ");
    }
}

public class Main {
    public static void main(String[] args) {
        new Test();
        new Test();
        new Test();
    }
}`
  ];

  return (
    <div style={{ padding: "40px", fontFamily: "Arial" }}>
      <h1>🚀 Round 1 - Task 1</h1>
      <h2>Output Prediction (8 Questions)</h2>

      <p style={{
        fontSize: "20px",
        fontWeight: "bold",
        color: timeLeft <= 60 ? "red" : "black",
      }}>
        ⏳ Time Left: {formatTime(timeLeft)}
      </p>

      {questions.map((q, index) => (
        <div key={index} style={{ marginBottom: "20px" }}>
          <h3>Q{index + 1} (4 Marks)</h3>
          <pre>{q}</pre>
          <input
            placeholder="Enter Output"
            value={answers[index]}
            onChange={(e) => handleChange(index, e.target.value)}
          />
          <p>{checkAnswer(answers[index], correctAnswers[index])}</p>
        </div>
      ))}

      <button
        style={{
          marginTop: "20px",
          padding: "12px 25px",
          fontSize: "18px",
          backgroundColor: "green",
          color: "white",
          border: "none",
          borderRadius: "10px",
          cursor: "pointer",
        }}
        onClick={async () => {
          await handleSubmit();
          navigate("/round1-task2");
        }}
      >
        Submit & Next ➡
      </button>
    </div>
  );
}