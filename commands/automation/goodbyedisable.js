const { getConfig } = require("../../systems/security-system/config");
const { createSuccessEmbed } = require("../../ui/embeds");

module.exports = {
  name: "goodbyedisable",

  async execute(message) {
    const config = await getConfig(message.guild.id);

    config.goodbye.enabled = false;
    await config.save();

    return message.reply({
      embeds: [createSuccessEmbed("Goodbye system disabled.")]
    });
  },
};