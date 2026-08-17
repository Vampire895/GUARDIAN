const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  userId: String,
  guildId: String,
  roles: [String],
  endTime: Date
});

module.exports = mongoose.model("IsolatedUser", schema);