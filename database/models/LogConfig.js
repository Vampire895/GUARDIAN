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
    },
    // Retained in the schema only so the migration can explicitly unset legacy data.
    categories: {
        type: mongoose.Schema.Types.Mixed,
        default: undefined
    }
}, {
    timestamps: true
});

module.exports = mongoose.model("LogConfig", logConfigSchema);
