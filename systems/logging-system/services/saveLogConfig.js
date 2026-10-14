const LogConfig = require("../../../database/models/LogConfig");

/**
 * Replace the guild's previous logging configuration with the newly saved one.
 * The old category-based configuration is explicitly removed.
 */
async function saveLogConfig({ guildId, type, channelId, enabled = true }) {
    return LogConfig.findOneAndUpdate(
        { guildId },
        {
            $set: {
                guildId,
                enabled,
                type,
                channelId
            },
            $unset: {
                categories: ""
            }
        },
        {
            upsert: true,
            new: true,
            setDefaultsOnInsert: true
        }
    );
}

module.exports = saveLogConfig;
