const mongoose = require("mongoose");

/**
 * One active command-logging configuration per guild.
 * A saved configuration replaces the previous selection.
 */
const logConfigSchema = new mongoose.Schema({
    guildId: {
        type: String,
        required: true,
        unique: true
    },
    enabled: {
        type: Boolean,
        default: false
    },
    type: {
        type: String,
        default: null
    },
    channelId: {
        type: String,
        default: null
    }
}, {
    timestamps: true
});

module.exports = mongoose.model("LogConfig", logConfigSchema);
