const { PermissionsBitField } = require("discord.js");
const getLogConfig = require("./services/getLogConfig");

/**
 * Send a completed action's detailed embed only to its explicitly configured
 * category destination. Action payloads are never written to the database.
 */
async function logAction({ guild, category, embeds } = {}) {
    try {
        if (!guild || !category || !Array.isArray(embeds) || embeds.length === 0) return;

        const config = await getLogConfig(guild.id);
        if (!config?.enabled) return;

        const categoryKey = String(category).toLowerCase() === "utilities"
            ? "utility"
            : String(category).toLowerCase();
        const categories = config.categories && typeof config.categories === "object"
            ? config.categories
            : {};
        const route = categories[categoryKey];

        // Never fall back to the command channel or another category.
        if (route?.enabled !== true || !route.channelId) return;

        const botMember = guild.members.me;
        if (!botMember) return;

        const channel = await guild.channels.fetch(route.channelId).catch(() => null);
        if (!channel || !channel.isTextBased() || !channel.send) return;

        const permissions = channel.permissionsFor(botMember);
        if (!permissions
            || !permissions.has(PermissionsBitField.Flags.ViewChannel)
            || !permissions.has(PermissionsBitField.Flags.SendMessages)
            || !permissions.has(PermissionsBitField.Flags.EmbedLinks)) return;

        await channel.send({ embeds, allowedMentions: { parse: [] } });
    } catch (error) {
        console.error("[Logging System] Failed to dispatch action log:", error);
    }
}

module.exports = logAction;
