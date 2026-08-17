const { checkPermissions } = require("../../systems/permission-system");
const { getConfig } = require("../../systems/security-system/config");
const { createSuccessEmbed, createErrorEmbed } = require("../../ui/embeds");

const name = "unignorechannel";
const description = "Remove one or multiple channels from ignore list.";

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

  let removed = [];

  for (const channel of channels.values()) {
    if (config.ignoredChannels.includes(channel.id)) {
      config.ignoredChannels = config.ignoredChannels.filter(
        id => id !== channel.id
      );
      removed.push(channel.toString());
    }
  }

  await config.save();

  return message.reply({
    embeds: [
      createSuccessEmbed(
        removed.length
          ? `Unignored: ${removed.join(", ")}`
          : `None of the mentioned channels were ignored.`
      )
    ]
  });
}

module.exports = { name, description, execute };