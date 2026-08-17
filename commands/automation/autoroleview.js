const { getConfig } = require("../../systems/security-system/config");
const { createSuccessEmbed } = require("../../ui/embeds");

module.exports = {
  name: "autoroleview",
  description: "View autorole configuration",

  async execute(message) {
    const config = await getConfig(message.guild.id);

    return message.reply({
      embeds: [
        createSuccessEmbed(
          `Autorole: ${config.autorole?.enabled ? "Enabled" : "Disabled"}\nRoles: ${config.autorole?.roles?.length || 0}`
        )
      ]
    });
  },
};