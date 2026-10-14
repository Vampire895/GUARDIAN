const mongoose = require("mongoose");

/**
 * Per-guild command logging settings.
 * Each category keeps its own destination in categories, so saving one route
 * never removes another route. enabled is the guild-wide logging switch.
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
    // Map-like plain object: { moderation: { channelId, enabled }, security: ... }
    categories: {
        type: mongoose.Schema.Types.Mixed,
        default: undefined
    },
    // Legacy fields retained for safe migration of older single-route configs.
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
