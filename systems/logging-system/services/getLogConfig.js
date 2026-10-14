const LogConfig = require("../../../database/models/LogConfig");

/**
 * Gets or creates a guild logging config and safely migrates the former
 * single-route format into the independent categories map.
 */
async function getLogConfig(guildId) {
    let config = await LogConfig.findOne({ guildId });

    if (!config) {
        config = await LogConfig.create({ guildId });
    }

    const categories = config.categories && typeof config.categories === "object"
        ? { ...config.categories }
        : {};

    // Preserve an existing single-route configuration when moving to the
    // multi-category format. Do not overwrite categories already configured.
    if (
        config.type &&
        config.channelId &&
        !categories[config.type]
    ) {
        categories[config.type] = {
            channelId: config.channelId,
            enabled: config.enabled !== false
        };

        config.categories = categories;
        await config.save();
    }

    return config;
}

module.exports = getLogConfig;
