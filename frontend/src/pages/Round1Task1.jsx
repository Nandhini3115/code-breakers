import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Round1Task1() {
  const navigate = useNavigate();

  const totalTime = 15 * 60;
  const [timeLeft, setTimeLeft] = useState(totalTime);
  const [startTime] = useState(Date.now());

  const [answers, setAnswers] = useState(Array(8).fill(""));

  const correctAnswers = [
    "Y W U S Q O M K I G E C A B D F H J L N P R T V X Z",  // Q1
    "0 1 1 2 3 5 8",    // Q2
    `BREAKERSCODE`,     // Q3
    "4 10",    // Q4
    "dEbUG",     // Q5
    "B C E H M Z H M",     // Q6
    "1 2 6 24 120 720 5040",    // Q7
    "12 13 21 23 31 32"      // Q8
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
        `http://localhost:5000/api/participants/updateScore/${participantId}`,
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
    `letters = list("ABCDEFGHIJKLMNOPQRSTUVWXYZ")
s = []

for i, ch in enumerate(letters):
    if i % 2 == 0:
        s.insert(0, ch)  # prepend
    else:
        s.append(ch)     # append

print(" ".join(s))`,
    `n = 7
a = 0
b = 1

print(a, b, end=" ")

for i in range(2, n):
    c = a + b
    print(c, end=" ")
    a = b
    b = c`,
    `def rotate(s, n):
    n = n % len(s)
    return s[n:] + s[:n]

text = "CODEBREAKERS"

for i in range(3):
    text = rotate(text, i+1)

print(text)`,
    `#include <stdio.h>
int main(){
    int x = 10;
    printf("%lu %d", sizeof(x++), x);
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
int main(){
    char letters[] = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    int a=1,b=2,temp;
    for(int i=0;i<10;i++){
        printf("%c ", letters[a-1]);
        temp=a+b;
        a=b;
        b=temp;
        if(a>26) a%=26;
    }
    return 0;
}`,
    `public class Main {
    public static void main(String[] args) {
        int n = 1;
        for(int i=1; i<=7; i++){
            n *= i;
            System.out.print(n + " ");
        }
    }
}`,
    `public class Main {
    public static void main(String[] args) {

        outer:
        for (int i = 1; i <= 3; i++) {
            for (int j = 1; j <= 3; j++) {
                if (i == j)
                    continue outer;
                System.out.print(i + "" + j + " ");
            }
        }
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