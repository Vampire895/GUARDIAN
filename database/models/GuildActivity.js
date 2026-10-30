
const mongoose = require("mongoose");

const guildActivitySchema = new mongoose.Schema({
  guildId: {
    type: String,
    required: true,
    index: true
  },

  eventType: {
    type: String,
    enum: ["join", "leave"],
    required: true
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Keep enough history for a rolling seven-day report.
guildActivitySchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 8 * 24 * 60 * 60 }
);

guildActivitySchema.index({
  guildId: 1,
  eventType: 1,
  createdAt: -1
});

module.exports = mongoose.model("GuildActivity", guildActivitySchema);
