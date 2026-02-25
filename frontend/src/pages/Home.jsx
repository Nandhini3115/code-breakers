import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f8fafc",
        fontFamily: "Arial, sans-serif",
      }}
    >
      {/* Card Box */}
      <div
        style={{
          width: "450px",
          padding: "50px",
          textAlign: "center",
          borderRadius: "18px",
          background: "white",
          boxShadow: "0px 8px 25px rgba(0,0,0,0.15)",
        }}
      >
        {/* Title */}
        <h1
          style={{
            fontSize: "42px",
            fontWeight: "bold",
            color: "#092e7d",
            marginBottom: "15px",
          }}
        >
          ⚡CODE BREAKERS ⚡
        </h1>

        {/* Subtitle */}
        <p
          style={{
            fontSize: "18px",
            color: "#334155",
            marginBottom: "10px",
          }}
        >
          Welcome Participants!
        </p>

        <p
          style={{
            fontSize: "15px",
            color: "#64748b",
            marginBottom: "35px",
          }}
        >
          Crack the code, solve the puzzles, unlock the cipher 🔐
        </p>

        {/* Button */}
        <Link to="/round1-task1">
          <button
            style={{
              padding: "14px 45px",
              fontSize: "18px",
              fontWeight: "bold",
              borderRadius: "10px",
              border: "none",
              cursor: "pointer",
              background: "linear-gradient(to right, #2563eb, #38bdf8)",
              color: "white",
              boxShadow: "0px 5px 15px rgba(37,99,235,0.4)",
              transition: "0.3s ease",
            }}
            onMouseOver={(e) =>
              (e.target.style.transform = "scale(1.07)")
            }
            onMouseOut={(e) =>
              (e.target.style.transform = "scale(1)")
            }
          >
            Start 
          </button>
        </Link>

        {/* Footer */}
        <p
          style={{
            marginTop: "30px",
            fontSize: "13px",
            color: "#94a3b8",
          }}
        >
          Get ready to test your coding & decoding skills 💻
        </p>
      </div>
    </div>
  );
}
