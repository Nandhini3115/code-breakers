const mongoose = require("mongoose");

const scoreSchema = new mongoose.Schema({
  name: { type: String, required: true },
  roundTask11: Number,
  round1Task2: Number,
  round2: Number,
  total: Number,
});

module.exports = mongoose.model("Score", scoreSchema);
