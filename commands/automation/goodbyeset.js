const { checkPermissions } = require("../../systems/permission-system");
const { getConfig } = require("../../systems/security-system/config");
const { createSuccessEmbed, createErrorEmbed } = require("../../ui/embeds");

module.exports = {
  name: "goodbyeset",

  async execute(message) {
    const config = await getConfig(message.guild.id);

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

    const channel = message.mentions.channels.first();

    if (!channel) {
      return message.reply({
        embeds: [createErrorEmbed("Mention a channel.")]
      });
    }

    config.goodbye.enabled = true;
    config.goodbye.channelId = channel.id;

    await config.save();

    return message.reply({
      embeds: [createSuccessEmbed("Goodbye system configured.")]
    });
  },
};