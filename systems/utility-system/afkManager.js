/**
 * AFK Manager
 *
 * Active AFK states are persisted in MongoDB, not held in a RAM Map.
 * Each user has at most one active record per server. Breaking AFK
 * permanently deletes that record; no history or event log is stored.
 */

const AFK = require("../../database/models/AFK");

/**
 * Set or refresh a user's AFK state for a server.
 */
async function setAFK(guildId, userId, reason) {
    if (!guildId || !userId) {
        throw new Error("AFK requires both a guild ID and a user ID.");
    }

    const since = new Date();

    return AFK.findOneAndUpdate(
        { guildId: String(guildId), userId: String(userId) },
        {
            $set: {
                reason: reason || "AFK",
                since
            }
        },
        {
            upsert: true,
            new: true,
            runValidators: true,
            setDefaultsOnInsert: true
        }
    ).lean();
}

/**
 * Get the user's current AFK state in the specified server.
 */
async function getAFK(guildId, userId) {
    if (!guildId || !userId) return null;

    const afk = await AFK.findOne({
        guildId: String(guildId),
        userId: String(userId)
    }).lean();

    if (!afk) return null;

    // Keep the previous manager's millisecond timestamp interface for callers.
    return {
        ...afk,
        since: new Date(afk.since).getTime()
    };
}

/**
 * Check whether the user is AFK in the specified server.
 */
async function isAFK(guildId, userId) {
    if (!guildId || !userId) return false;

    return Boolean(await AFK.exists({
        guildId: String(guildId),
        userId: String(userId)
    }));
}

/**
 * Permanently delete the active AFK record when the user returns.
 */
async function removeAFK(guildId, userId) {
    if (!guildId || !userId) return false;

    const result = await AFK.deleteOne({
        guildId: String(guildId),
        userId: String(userId)
    });

    return result.deletedCount > 0;
}

/**
 * Get active AFK records. This returns a database query result, not a RAM Map.
 */
async function getAllAFK(guildId) {
    const filter = guildId ? { guildId: String(guildId) } : {};

    return AFK.find(filter).lean();
}

module.exports = {
    setAFK,
    getAFK,
    isAFK,
    removeAFK,
    getAllAFK
};
