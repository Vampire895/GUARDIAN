const LogConfig = require("../../../database/models/LogConfig");

const SUPPORTED_CATEGORIES = new Set([
    "moderation",
    "security",
    "verification",
    "utility",
    "automation",
    "test"
]);

/**
 * Gets or creates the guild's logging configuration.
 * Migrates a legacy single-category route once. Legacy "all" and "nick"
 * routes are intentionally not migrated: category logs must never fall back
 * to a global or unrelated destination.
 */
async function getLogConfig(guildId) {
    let config = await LogConfig.findOne({ guildId });

    if (!config) {
        config = await LogConfig.create({
            guildId,
            enabled: false,
            categories: {}
        });
    }

    const categories = config.categories && typeof config.categories === "object"
        ? { ...config.categories }
        : {};

    let changed = false;

    if (
        config.type &&
        config.channelId &&
        SUPPORTED_CATEGORIES.has(String(config.type).toLowerCase()) &&
        !categories[String(config.type).toLowerCase()]
    ) {
        const legacyType = String(config.type).toLowerCase();
        categories[legacyType] = {
            channelId: config.channelId,
            enabled: config.enabled !== false
        };
        changed = true;
    }

    // These are not category routes and must not cause cross-category logging.
    if (Object.prototype.hasOwnProperty.call(categories, "all")) {
        delete categories.all;
        changed = true;
    }
    if (Object.prototype.hasOwnProperty.call(categories, "nick")) {
        delete categories.nick;
        changed = true;
    }

    const hasLegacyFields = Boolean(config.type || config.channelId);
    if (changed || hasLegacyFields || !config.categories) {
        await LogConfig.findOneAndUpdate(
            { guildId },
            {
                $set: { categories },
                $unset: { type: "", channelId: "" }
            },
            { new: true }
        );
        config = await LogConfig.findOne({ guildId });
    }

    return config;
}

module.exports = getLogConfig;
