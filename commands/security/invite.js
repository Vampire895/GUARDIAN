const { checkPermissions } = require("../../systems/permission-system");
const { getConfig, updateConfig } = require("../../systems/security-system/config");
const { createSuccessEmbed, createErrorEmbed } = require("../../ui/embeds");

const name = "invite";
const description = "Manage invite filter.";

async function execute(message, args) {
  const sub = args[0];
  const guildId = message.guild.id;

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

  const config = await getConfig(guildId);

  if (sub === "enable") {
    await updateConfig(guildId, { "inviteFilter.enabled": true });

    return message.reply({
      embeds: [createSuccessEmbed("Invite filter enabled.")]
    });
  }

  if (sub === "disable") {
    await updateConfig(guildId, { "inviteFilter.enabled": false });

    return message.reply({
      embeds: [createSuccessEmbed("Invite filter disabled.")]
    });
  }

  return message.reply({
    embeds: [
      createSuccessEmbed(
        `Invite Filter:\nEnabled: ${config.inviteFilter.enabled}\nAction: ${config.inviteFilter.action}`
      )
    ]
  });
}

module.exports = { name, description, execute };