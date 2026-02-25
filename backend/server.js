// server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db"); // your MongoDB connection
const codeRoutes = require("./routes/codeRoutes");
const eventRoutes = require("./routes/eventRoutes");
const participantRoutes = require("./routes/participantRoutes");

const app = express();

// Middleware
app.use(cors({
  origin: ["http://localhost:5173", "https://nandhini3115.github.io"],
  methods: ["GET", "POST", "OPTIONS", "PUT"],
  credentials: true
}));
app.use(express.json());

// Connect to DB
connectDB();

// Routes
app.use("/api/code", codeRoutes);
app.use("/api/event", eventRoutes);
app.use("/api/participants", participantRoutes);

// Test route
app.get("/", (req, res) => res.send("Backend Running ✅"));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));