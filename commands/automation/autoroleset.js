const { checkPermissions } = require("../../systems/permission-system");
const { getConfig } = require("../../systems/security-system/config");
const { createSuccessEmbed, createErrorEmbed } = require("../../ui/embeds");

module.exports = {
  name: "autoroleset",
  description: "Set autorole for new members",

  async execute(message, args) {
    const config = await getConfig(message.guild.id);

    const permCheck = checkPermissions({
      member: message.member,
      botMember: message.guild.members.me,
      requiredPermissions: ["ManageRoles"],
    });

    if (!permCheck.success) {
      return message.reply({
        embeds: [createErrorEmbed("Missing permissions.")]
      });
    }

    const role = message.mentions.roles.first();

    if (!role) {
      return message.reply({
        embeds: [createErrorEmbed("Mention a role.")]
      });
    }

    if (!config.autorole.roles.includes(role.id)) {
      config.autorole.roles.push(role.id);
    }

    config.autorole.enabled = true;

    await config.save();

    return message.reply({
      embeds: [createSuccessEmbed("Autorole configured.")]
    });
  },
};