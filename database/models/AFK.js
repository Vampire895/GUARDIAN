const mongoose = require("mongoose");

/**
 * One active AFK record per user per server.
 * Records are deleted as soon as the user returns; no AFK history is kept.
 */
const afkSchema = new mongoose.Schema({
    guildId: {
        type: String,
        required: true
    },
    userId: {
        type: String,
        required: true
    },
    reason: {
        type: String,
        default: "AFK"
    },
    since: {
        type: Date,
        required: true,
        default: Date.now
    }
}, {
    timestamps: false
});

afkSchema.index(
    { guildId: 1, userId: 1 },
    { unique: true }
);

module.exports = mongoose.model("AFK", afkSchema);
