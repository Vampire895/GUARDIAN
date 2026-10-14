const LogConfig = require("../../../database/models/LogConfig");
const getLogConfig = require("./getLogConfig");

const SUPPORTED_CATEGORIES = new Set([
    "moderation",
    "security",
    "verification",
    "utility",
    "automation",
    "test"
]);

/**
 * Save or update one category without modifying any other route.
 * Passing enabled:false only toggles the global kill switch; it preserves all
 * saved category destinations. No log events are stored by this service.
 */
async function saveLogConfig({ guildId, type, channelId, enabled = true }) {
    const current = await getLogConfig(guildId);
    const categories = current.categories && typeof current.categories === "object"
        ? { ...current.categories }
        : {};

    if (enabled) {
        const normalizedType = String(type || "").toLowerCase();
        if (!SUPPORTED_CATEGORIES.has(normalizedType)) {
            throw new Error(`Unsupported logging category: ${normalizedType || "(empty)"}`);
        }
        if (!channelId) {
            throw new Error("A destination channel is required to enable a logging category.");
        }

        categories[normalizedType] = {
            ...(categories[normalizedType] || {}),
            channelId: String(channelId),
            enabled: true
        };
    }

    return LogConfig.findOneAndUpdate(
        { guildId },
        {
            $set: {
                enabled: Boolean(enabled),
                categories
            },
            $unset: {
                type: "",
                channelId: ""
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
