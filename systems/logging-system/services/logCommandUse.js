const { EmbedBuilder, PermissionsBitField } = require("discord.js");
const getLogConfig = require("./getLogConfig");

/**
 * Send a command-use log if the command matches the guild's active filter.
 * Command arguments are deliberately not recorded.
 */
async function logCommandUse({ message, commandName, category }) {
    try {
        if (!message?.guild || !message.author || !commandName) return;

        const config = await getLogConfig(message.guild.id);
        if (!config?.enabled || !config.channelId || !config.type) return;

        const normalizedCommand = String(commandName).toLowerCase();
        const normalizedCategory = String(category || "").toLowerCase();

        const matches = config.type === "all"
            || config.type === normalizedCategory
            || (config.type === "nick" && normalizedCommand === "nick");

        if (!matches) return;

        const channel = await message.guild.channels.fetch(config.channelId).catch(() => null);
        if (!channel || !channel.isTextBased() || !channel.send) return;

        const botMember = message.guild.members.me;
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
                { name: "Command", value: `\`${normalizedCommand}\``, inline: true },
                { name: "Category", value: normalizedCategory || "unknown", inline: true },
                { name: "Used by", value: `<@${message.author.id}> (\`${message.author.tag}\`)`, inline: false },
                { name: "Channel", value: `<#${message.channel.id}>`, inline: true }
            )
            .setTimestamp(message.createdAt || new Date());

        await channel.send({
            embeds: [embed],
            allowedMentions: { parse: [] }
        });
    } catch (error) {
        console.error("[Logging System] Failed to log command use:", error);
    }
}

module.exports = logCommandUse;
