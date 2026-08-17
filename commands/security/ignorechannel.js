const { checkPermissions } = require("../../systems/permission-system");
const { getConfig } = require("../../systems/security-system/config");
const { createSuccessEmbed, createErrorEmbed } = require("../../ui/embeds");

const name = "ignorechannel";
const description = "Ignore one or multiple channels from security systems.";

async function execute(message) {
  const channels = message.mentions.channels;
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

  if (!channels.size) {
    return message.reply({
      embeds: [createErrorEmbed("Please mention at least one channel.")]
    });
  }

  const config = await getConfig(guildId);

  let added = [];

  for (const channel of channels.values()) {
    if (!config.ignoredChannels.includes(channel.id)) {
      config.ignoredChannels.push(channel.id);
      added.push(channel.toString());
    }
  }

  await config.save();

  return message.reply({
    embeds: [
      createSuccessEmbed(
        added.length
          ? `Ignored: ${added.join(", ")}`
          : `All mentioned channels are already ignored.`
      )
    ]
  });
}

module.exports = { name, description, execute };