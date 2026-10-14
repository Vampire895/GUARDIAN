const LogConfig = require("../../../database/models/LogConfig");
const getLogConfig = require("./getLogConfig");

/**
 * Add or update only the selected logging route.
 * Existing categories and their destinations are preserved.
 */
async function saveLogConfig({ guildId, type, channelId, enabled = true }) {
    const current = await getLogConfig(guildId);
    const categories = current.categories && typeof current.categories === "object"
        ? { ...current.categories }
        : {};

    if (enabled && type && channelId) {
        categories[type] = {
            ...(categories[type] || {}),
            channelId,
            enabled: true
        };
    }

    return LogConfig.findOneAndUpdate(
        { guildId },
        {
            $set: {
                guildId,
                enabled,
                categories
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
