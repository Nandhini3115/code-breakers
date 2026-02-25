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
app.use(express.json());
app.use(
  cors({
    origin: "*", // update with your Vercel URL after deployment
    methods: ["GET", "POST", "OPTIONS", "PUT"],
  })
);

// Connect to DB
connectDB();

// Routes
app.use("/api/code", codeRoutes);
app.use("/api/event", eventRoutes);
app.use("/api/participants", participantRoutes);

// Test route
app.get("/", (req, res) => res.send("Backend Running ✅"));

// Start server
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));