const mongoose = require("mongoose");

const participantSchema = new mongoose.Schema({
  name: String,
  college: String,
  password: String,
  round: String,
  round1Task1Score: {
    type: Number,
    default: 0,
  },
  round1Task2Score: {
    type: Number,
    default: 0,
  },

  round2Score: {
    type: Number,
    default: 0,
  },

  totalScore: {
    type: Number,
    default: 0,
  },
});

module.exports = mongoose.model("Participant", participantSchema);
