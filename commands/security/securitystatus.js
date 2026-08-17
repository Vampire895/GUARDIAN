const { checkPermissions } = require("../../systems/permission-system");
const { getConfig } = require("../../systems/security-system/config");
const { createSuccessEmbed, createErrorEmbed } = require("../../ui/embeds");

const name = "securitystatus";
const description = "View security system status.";

async function execute(message) {
  const guildId = message.guild.id;

  // --- Permission check ---
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

  const format = (value) => value ? "🟢 ON" : "🔴 OFF";

  const embed = createSuccessEmbed(
    `🔐 **Security Status**

**Anti-Spam:** ${format(config.antiSpam?.enabled)}
**Anti-Link:** ${format(config.antiLink?.enabled)}
**Invite Filter:** ${format(config.inviteFilter?.enabled)}
**Anti-Raid:** ${format(config.antiRaid?.enabled)}
**Escalation:** ${format(config.escalation?.enabled)}

${
  config.antiBot
    ? `**Anti-Bot:** ${format(config.antiBot.enabled)}`
    : ""
}`
  );

  return message.reply({ embeds: [embed] });
}

module.exports = { name, description, execute };