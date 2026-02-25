const express = require("express");
const Score = require("../models/Score");

const router = express.Router();

/* Save Score */
router.post("/save", async (req, res) => {
  try {
    const { name, round1, round2, total } = req.body;

    const newScore = new Score({ name, round1, round2, total });
    await newScore.save();

    res.json({ message: "Score Saved ✅" });
  } catch (err) {
    res.status(500).json({ message: "Error saving score ❌" });
  }
});

/* Get Leaderboard */
router.get("/leaderboard", async (req, res) => {
  try {
    const scores = await Score.find().sort({ total: -1 });

    res.json(scores);
  } catch (err) {
    res.status(500).json({ message: "Error fetching leaderboard ❌" });
  }
});

module.exports = router;
