const express = require("express");
const Participant = require("../models/Participant");

const router = express.Router();


// ✅ ADD Participant (Admin Dashboard)
router.post("/add", async (req, res) => {
  try {
    const { name, college, password } = req.body;

    if (!name || !college || !password) {
      return res.status(400).json({ message: "All fields required ❌" });
    }

    // Check already exists
    const existing = await Participant.findOne({ name });
    if (existing) {
      return res.status(400).json({ message: "Participant already exists ❌" });
    }

    // Create participant
    const newParticipant = new Participant({
      name,
      college,
      password,
    });

    await newParticipant.save();

    res.json({
      message: "Participant Added Successfully ✅",
      participant: newParticipant,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error ❌" });
  }
});


// ✅ GET All Participants (Leaderboard)
router.get("/all", async (req, res) => {
  try {
    const participants = await Participant.find().sort({ totalScore: -1 });

    res.json(participants);
  } catch (error) {
    res.status(500).json({ message: "Server Error ❌" });
  }
});


// ✅ LOGIN Participant
router.post("/login", async (req, res) => {
  try {
    const { name, password } = req.body;

    const participant = await Participant.findOne({ name });

    if (!participant) {
      return res.status(400).json({ message: "Participant not found ❌" });
    }

    if (participant.password !== password) {
      return res.status(400).json({ message: "Wrong Password ❌" });
    }

    res.json({
      message: "Login Successful ✅",
      participant,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error ❌" });
  }
});
// ✅ UPDATE SCORE AFTER EACH ROUND
router.put("/updateScore/:id", async (req, res) => {
  try {
    const { task, score } = req.body; // match frontend

    const participant = await Participant.findById(req.params.id);

    if (!participant) {
      return res.status(404).json({ message: "Participant not found ❌" });
    }

    // ✅ Update correct task score
    if (task === "round1task1") {
      participant.round1Task1Score = Number(score);
    }

    if (task === "round1task2") {
      participant.round1Task2Score = Number(score);
    }

    if (task === "round2") {
      participant.round2Score = Number(score);
    }

    // ✅ Prevent undefined errors
    participant.totalScore =
      (participant.round1Task1Score || 0) +
      (participant.round1Task2Score || 0) +
      (participant.round2Score || 0);

    await participant.save();

    res.json({
      message: "Score Updated Successfully ✅",
      participant,
    });

  } catch (error) {
    console.log("Update Score Error:", error);
    res.status(500).json({ message: "Server Error ❌" });
  }
});


module.exports = router;
