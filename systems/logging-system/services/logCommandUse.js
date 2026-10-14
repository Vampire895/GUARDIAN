const { EmbedBuilder, PermissionsBitField } = require("discord.js");
const getLogConfig = require("./getLogConfig");

/**
 * Send command-use logs to every configured matching route.
 * The optional "all" route receives every command; category routes can coexist
 * with it. A channel is only sent one copy of a given command log.
 * Command arguments are deliberately not recorded.
 */
async function logCommandUse({ message, commandName, category }) {
    try {
        if (!message?.guild || !message.author || !commandName) return;

        const config = await getLogConfig(message.guild.id);
        if (!config?.enabled) return;

        const categories = config.categories && typeof config.categories === "object"
            ? config.categories
            : {};

        const normalizedCommand = String(commandName).toLowerCase();
        const normalizedCategory = String(category || "").toLowerCase();
        const matchingTypes = new Set(["all"]);

        if (normalizedCategory) matchingTypes.add(normalizedCategory);
        if (normalizedCommand === "nick") matchingTypes.add("nick");

        const destinations = new Map();
        for (const type of matchingTypes) {
            const route = categories[type];
            if (!route?.enabled || !route.channelId) continue;
            destinations.set(route.channelId, type);
        }

        // Backward compatibility if a legacy route has not yet been migrated.
        if (destinations.size === 0 && config.type && config.channelId) {
            const legacyMatches = config.type === "all"
                || config.type === normalizedCategory
                || (config.type === "nick" && normalizedCommand === "nick");
            if (legacyMatches) destinations.set(config.channelId, config.type);
        }

        if (!destinations.size) return;

        const embed = new EmbedBuilder()
            .setColor("#2B2D31")
            .setTitle("📜 GUARDIAN Command Used")
            .addFields(
                { name: "Command", value: `\`${normalizedCommand}\``, inline: true },
                { name: "Category", value: normalizedCategory || "unknown", inline: true },
                { name: "Used by", value: `<@${message.author.id}> (\`${message.author.tag}\`)`, inline: false },
                { name: "Channel", value: `<#${message.channel.id}>`, inline: true }
            )
            .setTimestamp(message.createdAt || new Date());

        const botMember = message.guild.members.me;
        for (const channelId of destinations.keys()) {
            const channel = await message.guild.channels.fetch(channelId).catch(() => null);
            if (!channel || !channel.isTextBased() || !channel.send) continue;

            const permissions = channel.permissionsFor(botMember);
            if (!permissions
                || !permissions.has(PermissionsBitField.Flags.ViewChannel)
                || !permissions.has(PermissionsBitField.Flags.SendMessages)) {
                continue;
            }

            await channel.send({
                embeds: [embed],
                allowedMentions: { parse: [] }
            });
        }
    } catch (error) {
        console.error("[Logging System] Failed to log command use:", error);
    }
}

module.exports = logCommandUse;
