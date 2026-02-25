import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import API from "../api";

export default function Login() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // ✅ Fixed Admin Credentials
  const adminUser = "admin";
  const adminPass = "admin123";

  // Login Function
  const handleLogin = async (e) => {
    e.preventDefault();

    // ✅ Admin Login
    if (username === adminUser && password === adminPass) {
      alert("Admin Login Successful ✅");
      navigate("/admin");
      return;
    }

    // ✅ Participant Login
    try {
      const res = await axios.post(
        `${API}/api/participants/login`,
        {
          name: username,
          password: password,
        }
      );



      // Store participant ID
      localStorage.setItem("participantId", res.data.participant._id);

      // Navigate to Home Page
      navigate("/home");
    } catch (error) {
      alert("Invalid Username or Password ❌");
    }
  };

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#ffffff",
        fontFamily: "Arial",
      }}
    >
      {/* Login Card */}
      <form
        onSubmit={handleLogin}
        style={{
          width: "400px",
          padding: "40px",
          background: "#f9f9f9",
          borderRadius: "15px",
          boxShadow: "0px 0px 15px lightgray",
          textAlign: "center",
        }}
      >
        <h1 style={{ marginBottom: "10px", color: "#222" }}>
          🔑 Login
        </h1>

        <p style={{ marginBottom: "25px", color: "gray" }}>
          Code Breakers Competition Portal
        </p>

        {/* Username */}
        <input
          type="text"
          placeholder="Enter Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          style={{
            width: "100%",
            padding: "12px",
            marginBottom: "15px",
            borderRadius: "10px",
            border: "1px solid #ccc",
            fontSize: "15px",
          }}
        />

        {/* Password */}
        <input
          type="password"
          placeholder="Enter Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{
            width: "100%",
            padding: "12px",
            marginBottom: "20px",
            borderRadius: "10px",
            border: "1px solid #ccc",
            fontSize: "15px",
          }}
        />

        {/* Login Button */}
        <button
          type="submit"
          style={{
            width: "100%",
            padding: "12px",
            background: "green",
            color: "white",
            fontSize: "18px",
            border: "none",
            borderRadius: "10px",
            cursor: "pointer",
          }}
        >
          ✅ Login
        </button>
      </form>
    </div>
  );
}
