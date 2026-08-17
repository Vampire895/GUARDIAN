const { checkPermissions } = require("../../systems/permission-system");
const { getConfig, updateConfig } = require("../../systems/security-system/config");
const { createSuccessEmbed, createErrorEmbed } = require("../../ui/embeds");

const name = "antiraid";
const description = "Manage anti-raid settings.";

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

  // ENABLE
  if (sub === "enable") {
    await updateConfig(guildId, { "antiRaid.enabled": true });

    return message.reply({
      embeds: [createSuccessEmbed("Anti-raid enabled.")]
    });
  }

  // DISABLE
  if (sub === "disable") {
    await updateConfig(guildId, { "antiRaid.enabled": false });

    return message.reply({
      embeds: [createSuccessEmbed("Anti-raid disabled.")]
    });
  }

  // CONFIG
  if (sub === "set") {
    const threshold = parseInt(args[1]);
    const interval = parseInt(args[2]);
    const action = args[3];

    if (!threshold || !interval || !action) {
      return message.reply({
        embeds: [
          createErrorEmbed(
            "Usage: .antiraid set <joins> <interval(ms)> <kick/timeout>"
          ),
        ],
      });
    }

    await updateConfig(guildId, {
      "antiRaid.joinThreshold": threshold,
      "antiRaid.interval": interval,
      "antiRaid.action": action,
    });

    return message.reply({
      embeds: [
        createSuccessEmbed(
          `Anti-raid updated:\nJoins: ${threshold}\nInterval: ${interval}ms\nAction: ${action}`
        ),
      ],
    });
  }

  // STATUS
  return message.reply({
    embeds: [
      createSuccessEmbed(
        `Anti-raid:\nEnabled: ${config.antiRaid.enabled}\nThreshold: ${config.antiRaid.joinThreshold}\nInterval: ${config.antiRaid.interval}ms\nAction: ${config.antiRaid.action}`
      ),
    ],
  });
}

module.exports = { name, description, execute };