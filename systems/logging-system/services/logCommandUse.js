const { EmbedBuilder, PermissionsBitField } = require("discord.js");
const getLogConfig = require("./getLogConfig");

/**
 * Send a command-use embed only to the selected destination for that command's
 * own category. No selected route means no log is sent anywhere.
 *
 * Only the configuration is stored in MongoDB; individual log events and
 * command arguments are never persisted or retained by this dispatcher.
 */
async function logCommandUse({ message, commandName, category }) {
    try {
        if (!message?.guild || !message.author || !commandName) return;

        const config = await getLogConfig(message.guild.id);
        if (!config?.enabled) return;

        const normalizedCategory = String(category || "").toLowerCase();
        const categoryKey = normalizedCategory === "utilities"
            ? "utility"
            : normalizedCategory;
        if (!categoryKey) return;

        const categories = config.categories && typeof config.categories === "object"
            ? config.categories
            : {};
        const route = categories[categoryKey];

        // Strictly no fallback to the command channel, another category, "all",
        // or a legacy route. No configured route means no logging embed.
        if (route?.enabled !== true || !route.channelId) return;

        const botMember = message.guild.members.me;
        if (!botMember) return;

        const channel = await message.guild.channels.fetch(route.channelId).catch(() => null);
        if (!channel || !channel.isTextBased() || !channel.send) return;

        const permissions = channel.permissionsFor(botMember);
        if (!permissions
            || !permissions.has(PermissionsBitField.Flags.ViewChannel)
            || !permissions.has(PermissionsBitField.Flags.SendMessages)) {
            return;
        }

        const embed = new EmbedBuilder()
            .setColor("#2B2D31")
            .setTitle("📜 GUARDIAN Command Used")
            .addFields(
                { name: "Command", value: `\`${String(commandName).toLowerCase()}\``, inline: true },
                { name: "Category", value: categoryKey, inline: true },
                { name: "Used by", value: `<@${message.author.id}> (\`${message.author.tag}\`)`, inline: false },
                { name: "Channel", value: `<#${message.channel.id}>`, inline: true }
            )
            .setTimestamp(message.createdAt || new Date());

        await channel.send({
            embeds: [embed],
            allowedMentions: { parse: [] }
        });
    } catch (error) {
        // Logging failures must never prevent the actual command from running.
        console.error("[Logging System] Failed to log command use:", error);
    }
}

module.exports = logCommandUse;
