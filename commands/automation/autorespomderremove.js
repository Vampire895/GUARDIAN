const { getConfig } = require("../../systems/security-system/config");
const { createSuccessEmbed } = require("../../ui/embeds");

module.exports = {
  name: "autoresponderremove",

  async execute(message, args) {
    const config = await getConfig(message.guild.id);
    const trigger = args[0];

    config.autoresponder.responses =
      config.autoresponder.responses.filter(r => r.trigger !== trigger);

    await config.save();

    return message.reply({
      embeds: [createSuccessEmbed("Removed autoresponder.")]
    });
  }
};