const { getConfig } = require("../../systems/security-system/config");
const { createSuccessEmbed } = require("../../ui/embeds");

module.exports = {
  name: "welcomedisable",
  description: "Disable welcome system",

  async execute(message) {
    const config = await getConfig(message.guild.id);

    config.welcome.enabled = false;
    await config.save();

    return message.reply({
      embeds: [createSuccessEmbed("Welcome system disabled.")]
    });
  },
};