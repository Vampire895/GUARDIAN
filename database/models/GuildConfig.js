
const mongoose = require("mongoose");

const guildConfigSchema = new mongoose.Schema(
  {
    guildId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },

    prefix: {
      type: String,
      default: null,
      trim: true
    },

    activityTrackingStartedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("GuildConfig", guildConfigSchema);
