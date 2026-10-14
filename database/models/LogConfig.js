const mongoose = require("mongoose");

/**
 * Logging configuration only. Individual log events are never persisted.
 * categories stores each category's destination, e.g.
 * { moderation: { channelId, enabled }, security: { channelId, enabled } }.
 */
const logConfigSchema = new mongoose.Schema({
    guildId: {
        type: String,
        required: true,
        unique: true
    },
    // Global kill switch. Saved category routes remain intact when disabled.
    enabled: {
        type: Boolean,
        default: false
    },
    categories: {
        type: mongoose.Schema.Types.Mixed,
        default: () => ({})
    },
    // Legacy fields retained temporarily so older documents can be migrated.
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
