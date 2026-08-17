const { checkPermissions } = require("../../systems/permission-system");
const { getConfig, updateConfig } = require("../../systems/security-system/config");
const { createSuccessEmbed, createErrorEmbed } = require("../../ui/embeds");

const name = "setaction";
const description = "Set action for a security system.";

const validSystems = ["antispam", "antilink", "invite", "antiraid"];
const validActions = ["warn", "timeout", "kick"];

async function execute(message, args) {
  const system = args[0]?.toLowerCase();
  const action = args[1]?.toLowerCase();
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

  if (!system || !action) {
    return message.reply({
      embeds: [
        createErrorEmbed(
          "Usage: .setaction <system> <action>\nSystems: antispam, antilink, invite, antiraid\nActions: warn, timeout, kick"
        )
      ]
    });
  }

  if (!validSystems.includes(system)) {
    return message.reply({
      embeds: [createErrorEmbed("Invalid system.")]
    });
  }

  if (!validActions.includes(action)) {
    return message.reply({
      embeds: [createErrorEmbed("Invalid action.")]
    });
  }

  const map = {
    antispam: "antiSpam.action",
    antilink: "antiLink.action",
    invite: "inviteFilter.action",
    antiraid: "antiRaid.action",
  };

  await updateConfig(guildId, {
    [map[system]]: action,
  });

  return message.reply({
    embeds: [
      createSuccessEmbed(
        `Action for **${system}** set to **${action}**`
      )
    ]
  });
}

module.exports = { name, description, execute };