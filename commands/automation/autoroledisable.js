const { getConfig } = require("../../systems/security-system/config");
const { createSuccessEmbed } = require("../../ui/embeds");

module.exports = {
  name: "autoroledisable",
  description: "Disable autorole system",

  async execute(message) {
    const config = await getConfig(message.guild.id);

    config.autorole.enabled = false;
    await config.save();

    return message.reply({
      embeds: [createSuccessEmbed("Autorole disabled.")]
    });
  },
};