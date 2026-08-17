const { checkPermissions } = require("../../systems/permission-system");
const { getConfig, updateConfig } = require("../../systems/security-system/config");
const { createSuccessEmbed, createErrorEmbed } = require("../../ui/embeds");

const name = "antispam";
const description = "Manage anti-spam settings.";

async function execute(message, args) {
  const sub = args[0];

  const permCheck = checkPermissions({
    member: message.member,
    botMember: message.guild.members.me,
    requiredPermissions: ["ManageGuild"],
  });

  if (!permCheck.success) {
    return message.reply({
      embeds: [createErrorEmbed("Missing permissions.")]
    });
  }

  const guildId = message.guild.id;
  const config = await getConfig(guildId);

  // ENABLE
  if (sub === "enable") {
    await updateConfig(guildId, { "antiSpam.enabled": true });

    return message.reply({
      embeds: [createSuccessEmbed("Anti-spam enabled.")]
    });
  }

  // DISABLE
  if (sub === "disable") {
    await updateConfig(guildId, { "antiSpam.enabled": false });

    return message.reply({
      embeds: [createSuccessEmbed("Anti-spam disabled.")]
    });
  }

  // CONFIG
  if (sub === "set") {
    const maxMessages = parseInt(args[1]);
    const interval = parseInt(args[2]);

    if (!maxMessages || !interval) {
      return message.reply({
        embeds: [createErrorEmbed("Usage: !antispam set <messages> <interval(ms)>")]
      });
    }

    await updateConfig(guildId, {
      "antiSpam.maxMessages": maxMessages,
      "antiSpam.interval": interval,
    });

    return message.reply({
      embeds: [
        createSuccessEmbed(
          `Anti-spam updated:\nMessages: ${maxMessages}\nInterval: ${interval}ms`
        )
      ]
    });
  }

  // STATUS (default)
  return message.reply({
    embeds: [
      createSuccessEmbed(
        `Anti-spam:\nEnabled: ${config.antiSpam.enabled}\nMax: ${config.antiSpam.maxMessages}\nInterval: ${config.antiSpam.interval}ms`
      )
    ]
  });
}

module.exports = { name, description, execute };